import { db } from "../config/database";
import { ChatMessage, ChatResponse } from "../models";
import { llmService } from "./llm.service";

export class ChatService {

    mapMessage(message: any): ChatMessage {
        return {
            id: message.id,
            sessionId: message.session_id,
            fileId: message.file_id,
            role: message.role,
            content: message.content,
            createdAt: message.created_at,
            metadata: message.metadata,
        };
    }

    async saveMessage(
        sessionId: string,
        fileId: string,
        role: "user" | "assistant",
        content: string,
        metadata?: any
    ): Promise<ChatMessage> {
        try {
            db.query("BEGIN;");

            const query = [
                "INSERT INTO chat_messages (session_id, file_id, role, content, metadata)",
                "VALUES ($1, $2, $3, $4, $5)",
                "RETURNING id, session_id, file_id, role, content, created_at, metadata"
            ].join(" ");
            const params = [sessionId, fileId || null, role, content, metadata || {}];

            const result = await db.query(query, params);

            const message = result.rows[0];

            // 2) Create embedding and insert into embeddings table
            // const vec = await llmService.generateEmbedding(content);
            // await db.query(
            //     `INSERT INTO embeddings (session_id, content_type, source_id, content, embedding) 
            //      VALUES ($1, 'chat', $2, $3, $4)`,
            //     [sessionId, message.id, content, JSON.stringify(vec)]
            // );

            // Update session's updated_at timestamp
            await db.query(
                [
                    "UPDATE sessions",
                    "SET updated_at = CURRENT_TIMESTAMP",
                    "WHERE id = $1"
                ].join(" "),
                [sessionId]
            );

            db.query("COMMIT;");
            return this.mapMessage(message);
        } catch (error) {
            console.error("❌ Failed to add message:", error);
            db.query("ROLLBACK;");
            throw error;
        }
    }

    async getMessages(
        sessionId: string,
        sort: "ASC" | "DESC" = "ASC",
        limit: number = 100,
        offset: number = 0
    ): Promise<ChatMessage[]> {
        try {
            const sortDirection = sort.toLowerCase() === 'asc' ? 'ASC' : 'DESC';
            const query = [
                "SELECT id, session_id, file_id, role, content, created_at, metadata",
                "FROM chat_messages",
                "WHERE session_id = $1",
                "ORDER BY created_at " + sortDirection,
                "LIMIT $2 OFFSET $3"
            ].join(" ");
            console.log(query);
            const result = await db.query(query, [sessionId, limit, offset]);

            return result.rows.map((row: any) => this.mapMessage(row));
        } catch (error) {
            console.error("❌ Failed to get messages:", error);
            throw error;
        }
    }

    async processUserMessage(
        userMessage: string,
        sessionId: string,
        fileId: string,
    ): Promise<ChatResponse> {
        try {

            const messages = await llmService.buildMessagesForQuery(sessionId, userMessage);
            const aiResponse = await llmService.generateResponse(messages);

            // Save user message
            await this.saveMessage(sessionId, fileId, "user", userMessage);
            // Save AI response
            await this.saveMessage(sessionId, fileId, "assistant", aiResponse);

            return {
                message: aiResponse,
            };
        } catch (error) {
            console.error("❌ Failed to process user message:", error);
            throw error;
        }
    }
}

export const chatService = new ChatService();
