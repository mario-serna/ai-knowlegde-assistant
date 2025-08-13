import { db } from "../config/database";
import { Session } from "../models";

export class SessionService {

  mapSession(session: any): Session {
    return {
      id: session.id,
      title: session.title,
      createdAt: session.created_at,
      updatedAt: session.updated_at,
      metadata: session.metadata,
    };
  }

  async createSession(title?: string, metadata?: any): Promise<Session> {
    try {
      const result = await db.query(
        `
        INSERT INTO sessions (title, metadata)
        VALUES ($1, $2)
        RETURNING id, title, created_at, updated_at, metadata
      `,
        [title, metadata || {}]
      );

      const session = result.rows[0];
      console.log(`✅ Session created: ${session.id}`);

      return this.mapSession(session);
    } catch (error) {
      console.error("❌ Failed to create session:", error);
      throw error;
    }
  }

  async getSession(sessionId: string): Promise<Session | null> {
    try {
      const result = await db.query(
        `
        SELECT id, title, created_at, updated_at, metadata
        FROM sessions
        WHERE id = $1
      `,
        [sessionId]
      );

      if (result.rows.length === 0) {
        return null;
      }

      const session = result.rows[0];
      return this.mapSession(session);
    } catch (error) {
      console.error("❌ Failed to get session:", error);
      throw error;
    }
  }

  async updateSession(
    sessionId: string,
    updates: Partial<Session>
  ): Promise<Session> {
    try {
      const setClauses: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      if (updates.title !== undefined) {
        setClauses.push(`title = $${paramIndex++}`);
        values.push(updates.title);
      }

      if (updates.metadata !== undefined) {
        setClauses.push(`metadata = $${paramIndex++}`);
        values.push(updates.metadata);
      }

      if (setClauses.length === 0) {
        throw new Error("No updates provided");
      }

      values.push(sessionId);

      const result = await db.query(
        `
        UPDATE sessions
        SET ${setClauses.join(", ")}, updated_at = CURRENT_TIMESTAMP
        WHERE id = $${paramIndex}
        RETURNING id, title, created_at, updated_at, metadata
      `,
        values
      );

      if (result.rows.length === 0) {
        throw new Error("Session not found");
      }

      const session = result.rows[0];
      console.log(`✅ Session updated: ${sessionId}`);

      return this.mapSession(session);
    } catch (error) {
      console.error("❌ Failed to update session:", error);
      throw error;
    }
  }

  async deleteSession(sessionId: string): Promise<void> {
    try {
      const result = await db.query(
        "DELETE FROM sessions WHERE id = $1 RETURNING id",
        [sessionId]
      );

      if (result.rows.length === 0) {
        throw new Error("Session not found");
      }

      console.log(`✅ Session deleted: ${sessionId}`);
    } catch (error) {
      console.error("❌ Failed to delete session:", error);
      throw error;
    }
  }

  async listSessions(
    limit: number = 50,
    offset: number = 0
  ): Promise<Session[]> {
    try {
      const result = await db.query(
        `
        SELECT id, title, created_at, updated_at, metadata
        FROM sessions
        ORDER BY updated_at DESC
        LIMIT $1 OFFSET $2
      `,
        [limit, offset]
      );

      return result.rows.map((row: any) => this.mapSession(row));
    } catch (error) {
      console.error("❌ Failed to list sessions:", error);
      throw error;
    }
  }
}

export const sessionService = new SessionService();
