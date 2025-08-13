import dotenv from "dotenv";
dotenv.config();

export const env = {
    NODE_ENV: process.env.NODE_ENV || "development",
    DATABASE_URL: process.env.DATABASE_URL || "",
    OLLAMA_BASE_URL: process.env.OLLAMA_BASE_URL || "http://localhost:11434",
    OLLAMA_MODEL: process.env.OLLAMA_MODEL || "llama3.2:1b",
    OLLAMA_EMBEDDING_MODEL: process.env.OLLAMA_EMBEDDING_MODEL || "nomic-embed-text",
    PORT: process.env.PORT || 3001,
    STRAPI_BASE_URL: process.env.STRAPI_BASE_URL || "http://localhost:1337",
    STRAPI_API_KEY: process.env.STRAPI_API_KEY || "",
};