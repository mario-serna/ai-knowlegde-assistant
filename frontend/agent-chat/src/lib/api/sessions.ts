import { ChatResponse, SessionResponse } from "@/types";

export const getAllSessions = async (): Promise<SessionResponse> => {
    const response = await fetch(process.env.NEXT_PUBLIC_API_URL + "/sessions");
    return response.json();
};

export const getSessionChat = async (id: string): Promise<ChatResponse> => {
    const response = await fetch(process.env.NEXT_PUBLIC_API_URL + "/sessions/" + id + "/chat");
    return response.json();
};
