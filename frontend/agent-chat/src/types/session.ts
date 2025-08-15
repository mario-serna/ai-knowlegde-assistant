export interface NewSessionRequest {
    title: string;
}

export interface NewSessionResponse {
    success: boolean;
    data?: Session;
    error?: string;
}

export interface SessionResponse {
    success: boolean;
    data?: SessionData;
    error?: string;
}

export interface SessionData {
    sessions: Session[];
    pagination: Pagination;
}

export interface Pagination {
    limit: number;
    offset: number;
    total: number;
}

export interface Session {
    id: string;
    title: string;
    createdAt: string;
    updatedAt: string;
    metadata: Record<string, unknown>;
}