import { Pool, PoolConfig } from "pg";
import { env } from "./env";

export class Database {
  private pool: Pool;

  constructor(connectionString: string) {
    const poolConfig: PoolConfig = {
      connectionString: connectionString,
    };

    this.pool = new Pool(poolConfig);
  }

  async connect(): Promise<void> {
    try {
      const client = await this.pool.connect();
      console.log("✅ Connected to PostgreSQL database");

      // Check if pgvector extension is available
      const result = await client.query(
        "SELECT * FROM pg_extension WHERE extname = $1",
        ["vector"]
      );
      if (result.rows.length === 0) {
        console.log(
          "⚠️ pgvector extension not found. Please install it first."
        );
        console.log("💡 Run: CREATE EXTENSION IF NOT EXISTS vector;");
      } else {
        console.log("✅ pgvector extension is available");
      }

      client.release();
    } catch (error) {
      console.error("❌ Database connection failed:", error);
      throw error;
    }
  }

  async query(text: string, params?: any[]): Promise<any> {
    const start = Date.now();
    try {
      const result = await this.pool.query(text, params);
      const duration = Date.now() - start;
      console.log(
        `🔍 Executed query in ${duration}ms: ${text.substring(0, 100)}...`
      );
      return result;
    } catch (error) {
      console.error("❌ Query failed:", error);
      throw error;
    }
  }

  async getClient(): Promise<any> {
    return await this.pool.connect();
  }

  async close(): Promise<void> {
    await this.pool.end();
  }

  getPool(): Pool {
    return this.pool;
  }
}

// Create database instance from environment variables
export const db = new Database(env.DATABASE_URL || "");
