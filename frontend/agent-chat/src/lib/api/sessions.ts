import { SessionResponse } from "@/types";

export const getAllSessions = async (): Promise<SessionResponse> => {
    const response = await fetch(process.env.NEXT_PUBLIC_API_URL + "/sessions");
    return response.json();
};
