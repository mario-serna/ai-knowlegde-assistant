import { Request, Response } from "express";
import { chatService } from "../services";

export class ChatController {
    async addMessage(req: Request, res: Response) {
        try {
            const { sessionId } = req.params;
            const { question, fileId } = req.body;
            if (!question) {
                return res.status(400).json({
                    success: false,
                    error: "Missing question",
                });
            }

            const answer = await chatService.processUserMessage(question, sessionId, fileId);

            return res.status(200).json({
                success: true,
                data: {
                    answer,
                },
            });
        } catch (error) {
            console.error("❌ Failed to answer question:", error);
            return res.status(500).json({
                success: false,
                error: "Failed to answer question",
                message: error instanceof Error ? error.message : "Unknown error",
            });
        }
    }
}

export default new ChatController();