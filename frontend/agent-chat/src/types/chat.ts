import { Role } from "@/types";

export interface ChatResponse {
    success: boolean;
    data: ChatMessage[];
}

export interface ChatMessage {
    id: string;
    sessionId: string;
    fileId: string | null;
    role: Role;
    content: string;
    createdAt: string;
    metadata: Record<string, unknown>;
}

export interface ChatMessageResponse {
    success: boolean;
    data: {
        answer: string;
    }
    error?: string;
}
