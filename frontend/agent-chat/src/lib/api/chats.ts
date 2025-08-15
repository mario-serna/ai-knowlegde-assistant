import { ChatMessageResponse } from "@/types";

export const sendMessage = async (id: string, message: string): Promise<ChatMessageResponse> => {
    const response = await fetch(process.env.NEXT_PUBLIC_API_URL + "/sessions/" + id + "/chat", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ question: message }),
    });
    return response.json();
};