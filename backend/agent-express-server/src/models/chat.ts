export interface ChatMessage {
  id: string;
  sessionId: string;
  fileId: string;
  role: "user" | "assistant";
  content: string;
  createdAt: Date;
  metadata?: any;
}

export interface ChatResponse {
  message: string;
}
