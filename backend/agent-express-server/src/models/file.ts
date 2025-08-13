export interface FileMetadata {
    filename: string;
    file_size: number;
    file_type: string;
    sessionId: string;
}

export interface FileChunk {
    content: string;
    embedding: number[];
    chunkIndex: number;
}