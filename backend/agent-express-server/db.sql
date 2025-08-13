-- Drop and recreate database
DROP DATABASE IF EXISTS agents_db;
CREATE DATABASE agents_db;
\c agents_db;

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- Create sessions table first (no dependencies)
CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    title VARCHAR(255),
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Create uploaded_files table (depends on sessions)
CREATE TABLE IF NOT EXISTS uploaded_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL,
    filename TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    file_type VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Create embeddings table (depends on sessions)
CREATE TABLE IF NOT EXISTS embeddings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL,
    content_type TEXT NOT NULL, -- e.g., "chat_message", "file"
    source_id UUID NOT NULL, -- e.g., chat_message_id, file_id
    chunk_index INT,
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    embedding vector(1536) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create file_chunks table (depends on uploaded_files and embeddings)
CREATE TABLE IF NOT EXISTS file_chunks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    file_id UUID NOT NULL,
    chunk_index INT,
    content TEXT,
    embedding_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Create chat_messages table (depends on sessions)
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL,
    file_id UUID,
    role VARCHAR(50) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Now add all foreign key constraints
ALTER TABLE uploaded_files 
    ADD CONSTRAINT fk_session_files 
    FOREIGN KEY (session_id) 
    REFERENCES sessions(id) 
    ON DELETE CASCADE;

ALTER TABLE embeddings 
    ADD CONSTRAINT fk_session_embeddings 
    FOREIGN KEY (session_id) 
    REFERENCES sessions(id) 
    ON DELETE CASCADE;

ALTER TABLE file_chunks 
    ADD CONSTRAINT fk_file 
    FOREIGN KEY (file_id) 
    REFERENCES uploaded_files(id) 
    ON DELETE CASCADE;

ALTER TABLE file_chunks 
    ADD CONSTRAINT fk_embedding 
    FOREIGN KEY (embedding_id) 
    REFERENCES embeddings(id) 
    ON DELETE SET NULL;

ALTER TABLE chat_messages 
    ADD CONSTRAINT fk_session_messages 
    FOREIGN KEY (session_id) 
    REFERENCES sessions(id) 
    ON DELETE CASCADE;

ALTER TABLE chat_messages 
    ADD CONSTRAINT fk_file_messages 
    FOREIGN KEY (file_id) 
    REFERENCES uploaded_files(id) 
    ON DELETE SET NULL;

-- Create indexes
CREATE INDEX idx_embeddings_session_id ON embeddings(session_id);
-- Using IVFFlat index for vector similarity search
CREATE INDEX idx_embeddings_embedding ON embeddings USING ivfflat (embedding vector_l2_ops) WITH (lists = 100);
CREATE INDEX idx_file_chunks_file_id ON file_chunks(file_id);
CREATE INDEX idx_chat_messages_session_id ON chat_messages(session_id);