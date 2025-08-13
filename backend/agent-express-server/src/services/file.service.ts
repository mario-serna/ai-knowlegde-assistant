import * as fs from "fs";
import * as path from "path";
import pdf from "pdf-parse";
import { v4 as uuidv4 } from "uuid";
import { db } from "../config/database";
import { FileMetadata } from "../models";
import { llmService } from "./llm.service";


export class FileService {
  private uploadDir: string;
  private chunkSize: number;

  constructor(uploadDir: string = "./uploads", chunkSize: number = 1000) {
    this.uploadDir = uploadDir;
    this.chunkSize = chunkSize;
    this.ensureUploadDir();
  }

  private ensureUploadDir(): void {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async getFiles(sessionId: string): Promise<FileMetadata[]> {
    const result = await db.query(
      `SELECT * FROM files WHERE session_id = $1`,
      [sessionId]
    );
    return result.rows;
  }

  async processFile(
    file: Express.Multer.File,
    sessionId: string
  ): Promise<string> {
    try {
      // Generate unique filename
      const fileId = uuidv4();
      const fileExtension = path.extname(file.originalname);
      const filename = `${fileId}${fileExtension}`;
      const filePath = path.join(this.uploadDir, filename);

      // Save file to disk
      fs.writeFileSync(filePath, file.buffer);

      // Extract text content
      let textContent: string;
      if (file.mimetype === "application/pdf") {
        textContent = await this.extractTextFromPDF(filePath);
      } else if (file.mimetype === "text/plain") {
        textContent = file.buffer.toString("utf-8");
      } else {
        throw new Error(`Unsupported file type: ${file.mimetype}`);
      }

      // Split text into chunks
      const chunks = this.splitTextIntoChunks(textContent);

      // Save file metadata to database
      const fileRecord = await this.saveFileMetadata({
        filename: file.originalname,
        file_size: file.size,
        file_type: file.mimetype,
        sessionId,
      });

      // Process chunks and generate embeddings
      await this.processChunks(chunks, fileRecord.id, sessionId);

      // Clean up temporary file
      fs.unlinkSync(filePath);

      console.log(
        `✅ File processed successfully: ${file.originalname} -> ${chunks.length} chunks`
      );
      return fileRecord.id;
    } catch (error) {
      console.error("❌ File processing failed:", error);
      throw error;
    }
  }

  private async extractTextFromPDF(filePath: string): Promise<string> {
    try {
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdf(dataBuffer);
      return data.text;
    } catch (error) {
      throw new Error(
        `Failed to extract text from PDF: ${error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  private splitTextIntoChunks(text: string): string[] {
    const chunks: string[] = [];
    const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);

    let currentChunk = "";

    for (const sentence of sentences) {
      const trimmedSentence = sentence.trim();
      if (trimmedSentence.length === 0) continue;

      if (currentChunk.length + trimmedSentence.length > this.chunkSize) {
        if (currentChunk.length > 0) {
          chunks.push(currentChunk.trim());
          currentChunk = trimmedSentence;
        } else {
          // If a single sentence is longer than chunk size, split it
          chunks.push(trimmedSentence.substring(0, this.chunkSize));
          currentChunk = trimmedSentence.substring(this.chunkSize);
        }
      } else {
        currentChunk += (currentChunk ? ". " : "") + trimmedSentence;
      }
    }

    if (currentChunk.trim().length > 0) {
      chunks.push(currentChunk.trim());
    }

    return chunks;
  }

  private async saveFileMetadata(
    metadata: FileMetadata
  ): Promise<{ id: string }> {
    const result = await db.query(
      `
      INSERT INTO uploaded_files (session_id, filename, file_size, file_type)
      VALUES ($1, $2, $3, $4)
      RETURNING id
    `,
      [
        metadata.sessionId,
        metadata.filename,
        metadata.file_size,
        metadata.file_type,
      ]
    );

    return result.rows[0];
  }

  private async processChunks(
    chunks: string[],
    fileId: string,
    sessionId: string
  ): Promise<void> {
    if (chunks.length === 0) return;

    try {
      db.query("BEGIN");
      // Generate all embeddings in parallel
      const embeddings = await Promise.all(
        chunks.map(chunk => llmService.generateEmbedding(chunk))
      );

      // Save embeddings to database
      // Prepare values for bulk insert
      const embeddingValues = chunks.map((_, i) => {
        const index = i * 6;
        return `($${index + 1}, $${index + 2}, $${index + 3}, $${index + 4}, $${index + 5}, $${index + 6}::vector)`
      }).join(',');

      const embeddingParams = chunks.flatMap((chunk, i) => [
        sessionId,
        'file',
        fileId,
        i,
        chunk,
        JSON.stringify(embeddings[i])
      ]);
      const embeddingIds = await db.query(
        `INSERT INTO embeddings (session_id, content_type, source_id, chunk_index, content, embedding)
         VALUES ${embeddingValues}
         RETURNING id`,
        embeddingParams
      );

      // Prepare values for bulk insert
      const values = chunks.map((_, i) => {
        const index = i * 4;
        return `($${index + 1}, $${index + 2}, $${index + 3}, $${index + 4})`
      }).join(',');

      const params = chunks.flatMap((chunk, i) => [
        fileId,
        i,
        chunk,
        embeddingIds.rows[i].id
      ]);

      // Execute single insert with all values
      await db.query(`
        INSERT INTO file_chunks 
        (file_id, chunk_index, content, embedding_id)
        VALUES ${values}
      `, params);

      db.query("COMMIT");
    } catch (error) {
      console.error('❌ Failed to process chunks:', error);
      db.query("ROLLBACK");
      throw error; // Re-throw to allow the caller to handle the error
    }
  }

  async getFileChunks(sessionId: string, limit: number = 10): Promise<any[]> {
    const result = await db.query(
      `
      SELECT fc.*, f.filename
      FROM file_chunks fc
      JOIN uploaded_files f ON fc.file_id = f.id
      WHERE fc.session_id = $1
      ORDER BY fc.created_at DESC
      LIMIT $2
    `,
      [sessionId, limit]
    );

    return result.rows;
  }

  async searchSimilarChunks(
    sessionId: string,
    query: string,
    limit: number = 5
  ): Promise<any[]> {
    try {
      // Generate embedding for the query
      const queryEmbedding = await llmService.generateEmbedding(query);

      // Search for similar chunks using vector similarity
      const result = await db.query(
        `
        SELECT 
          fc.content,
          fc.chunk_index,
          f.filename,
          1 - (fc.embedding <=> $1) as similarity
        FROM file_chunks fc
        JOIN uploaded_files f ON fc.file_id = f.id
        WHERE fc.session_id = $2
        ORDER BY fc.embedding <=> $1
        LIMIT $3
      `,
        [queryEmbedding, sessionId, limit]
      );

      return result.rows;
    } catch (error) {
      console.error("❌ Vector search failed:", error);
      throw error;
    }
  }

  async deleteFile(fileId: string): Promise<void> {
    try {
      // Delete file chunks first (cascade will handle this, but being explicit)
      await db.query("DELETE FROM file_chunks WHERE file_id = $1", [fileId]);

      // Delete file record
      await db.query("DELETE FROM uploaded_files WHERE id = $1", [fileId]);

      console.log(`✅ File deleted: ${fileId}`);
    } catch (error) {
      console.error("❌ Failed to delete file:", error);
      throw error;
    }
  }
}

export const fileService = new FileService();
