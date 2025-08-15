import { ChatResponse, NewSessionResponse, SessionResponse } from "@/types";
import { sendMessage } from "./chats";

export const getAllSessions = async (): Promise<SessionResponse> => {
    const response = await fetch(process.env.NEXT_PUBLIC_API_URL + "/sessions");
    return response.json();
};

export const getSessionChat = async (id: string): Promise<ChatResponse> => {
    const response = await fetch(process.env.NEXT_PUBLIC_API_URL + "/sessions/" + id + "/chat");
    return response.json();
};

export const createSession = async (title: string): Promise<NewSessionResponse> => {
    const response = await fetch(process.env.NEXT_PUBLIC_API_URL + "/sessions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ title }),
    });
    return response.json();
};

export const createSessionChat = async (title: string, message: string): Promise<string> => {
    const { data, success, error } = await createSession(title);
    if (!success || !data) {
        throw new Error(error || "Failed to create session");
    }
    const sessionId = data.id;
    await sendMessage(sessionId, message);
    return sessionId;
};
