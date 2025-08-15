import { AIMessage, HumanMessage, SystemMessage } from "@langchain/core/messages";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatOllama, OllamaEmbeddings } from "@langchain/ollama";
import { db } from "../config/database";
import { env } from "../config/env";
import { chatService } from "./chat.service";

export interface LLMConfig {
  baseUrl: string;
  model: string;
  embeddingModel: string;
}

export class LLMService {
  private embeddings: OllamaEmbeddings;
  private llm: ChatOllama;
  private config: LLMConfig;
  private embeddingDimension: number;
  private agent;

  constructor(config: LLMConfig) {
    this.config = config;
    this.embeddingDimension = 1536;
    this.embeddings = new OllamaEmbeddings({
      model: config.embeddingModel,
      baseUrl: config.baseUrl,
    });

    this.llm = new ChatOllama({
      model: config.model,
      baseUrl: config.baseUrl,
    });

    this.agent = createReactAgent({
      llm: this.llm,
      tools: []
    });
  }

  buildSystemMessage(): string {
    return `You are AIKA, short for AI Knowledge Assistant — an expert, friendly, and helpful assistant with tools capabilities.
    Special capabilities:
    - You can use tools to answer the user's question.
    - You can retrieve relevant context from the session.
    - You can process text files uploaded by the user.

    Thought:

    1. Analyze the user's question and determine if it requires using a tool.
    2. If a tool is needed, explain why you will use it and ask for user confirmation before using it.
    3. If a tool is not needed, proceed with answering the user's question.
    
    Follow these rules:

    1. Use the session summary and retrieved context to answer the user's question.
    2. If key context is missing, ask short clarifying questions first.
    3. Be concise, accurate, and friendly.
    4. Avoid using tools unless absolutely necessary.
    5. Never provide irrelevant information.
    6. Limit your answer to a single message, max 2 sentences.
    7. Never provide code.`;
  }

  async generateEmbedding(text: string): Promise<number[]> {
    try {
      const embedding = await this.embeddings.embedQuery(text);
      // Ensure the embedding is 1536 dimensions
      if (embedding.length > this.embeddingDimension) {
        return embedding.slice(0, this.embeddingDimension);
      } else if (embedding.length < this.embeddingDimension) {
        // Pad with zeros if needed (though this is unlikely)
        return [...embedding, ...new Array(this.embeddingDimension - embedding.length).fill(0)];
      }
      return embedding;
    } catch (error) {
      console.error("❌ Failed to generate embedding:", error);
      throw new Error(
        `Failed to generate embedding: ${error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  async generateResponse(messages: (SystemMessage | HumanMessage | AIMessage)[]) {
    try {
      const response = await this.agent.invoke({ messages });
      console.log("✅ Generated response:", response);
      return response.messages[response.messages.length - 1].content.toString().trim();
    } catch (error) {
      console.error("❌ Failed to generate response:", error);
      throw new Error(
        `Failed to generate response: ${error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  // Build messages array for ChatOllama: system -> summary -> retrieved context -> recent messages -> new user message
  async buildMessagesForQuery(sessionId: string, userMessage: string) {
    const systemPrompt = this.buildSystemMessage();

    const messages: (SystemMessage | HumanMessage | AIMessage)[] = [new SystemMessage(systemPrompt)];

    // include summary (if exists)
    const summary = await this.getSessionSummary(sessionId);
    if (summary) {
      messages.push(new SystemMessage(`Session summary:\n${summary}`));
    }

    // include retrieval (docs + past messages by similarity)
    const retrieved = await this.retrieveRelevantContext(sessionId, userMessage, 5);
    if (retrieved.length) {
      // Add as a single system message or multiple; keep it short
      const joined = retrieved.map((r) => `${r.type.toUpperCase()}: ${r.content}`).join("\n\n");
      messages.push(new SystemMessage(`Relevant context:\n${joined}`));
    }

    // Finally, the new question
    messages.push(new HumanMessage(userMessage));

    return messages;
  }

  private async getSessionSummary(sessionId: string): Promise<string> {
    // Strategy: take top-K relevant items for the session (overall or last N messages),
    // plus a few recent messages, and ask the model to produce a compact summary.

    // 1) Take recent messages
    const recent = await chatService.getMessages(sessionId, "DESC", 6); // last 6 messages
    if (!recent.length) {
      return "No recent messages found.";
    }
    const recentsText = recent.map((m: any) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`).join("\n");

    console.log("Recent messages:", recentsText);
    // 2) Take top-K embeddings across session (documents and chat)
    const top = await db.query(
      `SELECT content FROM embeddings WHERE session_id = $1 ORDER BY created_at DESC LIMIT 40`,
      [sessionId]
    );
    const topText = top.rows.map((r: any) => r.content).join("\n\n");

    // 3) Build prompt for summarization
    const summarizationPrompt = [
      new SystemMessage(
        `You are an assistant that creates short, factual session summaries used for future context.
       Extract user goals, decisions, important facts, contact names, or constraints. Keep it concise (max 100 words).`
      ),
      new HumanMessage(
        `Here are recent messages:\n\n${recentsText}\n\nHere are other relevant excerpts:\n\n${topText}\n\nCreate a brief session summary (bullet points or short paragraphs).`
      ),
    ];

    const summaryResp = await this.llm.invoke(summarizationPrompt);
    const summaryText = summaryResp.content.toString().trim();

    return summaryText;
  }

  private async retrieveRelevantContext(sessionId: string, query: string, limit: number = 5): Promise<{ type: string; content: string; sourceId: string }[]> {
    try {
      const embeddings = await this.generateEmbedding(query);

      // Get similar documents from the database    
      const similarDocuments = await db.query(
        `SELECT content, content_type, source_id
         FROM embeddings
         WHERE session_id = $1
         ORDER BY embedding <-> $2::vector
         LIMIT $3`,
        [sessionId, JSON.stringify(embeddings), limit]
      );

      if (!similarDocuments.rows.length) {
        return [];
      }

      return similarDocuments.rows.map((row: { content: string; content_type: string; source_id: string }) => {
        return {
          type: row.content_type,
          content: row.content,
          sourceId: row.source_id,
        };
      });
    } catch (error) {
      console.error("Error in getSimilarDocuments:", error);
      return [];
    }
  }
}

// Create LLM service instance from environment variables
export const llmService = new LLMService({
  baseUrl: env.OLLAMA_BASE_URL,
  model: env.OLLAMA_MODEL,
  embeddingModel: env.OLLAMA_EMBEDDING_MODEL,
});
