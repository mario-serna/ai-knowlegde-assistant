import { Request, Response } from "express";
import { sessionService } from "../services";

export class SessionController {
    async createSession(req: Request, res: Response) {
        try {
            const { title, metadata } = req.body;

            const session = await sessionService.createSession(title, metadata);

            return res.status(201).json({
                success: true,
                data: session,
            });
        } catch (error) {
            console.error("❌ Failed to create session:", error);
            return res.status(500).json({
                success: false,
                error: "Failed to create session",
                message: error instanceof Error ? error.message : "Unknown error",
            });
        }
    }

    // Get a specific session
    async getSession(req: Request, res: Response) {
        try {
            const { sessionId } = req.params;

            const session = await sessionService.getSession(sessionId);

            if (!session) {
                return res.status(404).json({
                    success: false,
                    error: "Session not found",
                    sessionId,
                });
            }

            return res.status(200).json({
                success: true,
                data: session,
            });
        } catch (error) {
            console.error("❌ Failed to get session:", error);
            return res.status(500).json({
                success: false,
                error: "Failed to get session",
                message: error instanceof Error ? error.message : "Unknown error",
            });
        }
    }

    // Update a session
    async updateSession(req: Request, res: Response) {
        try {
            const { sessionId } = req.params;
            const { title, metadata } = req.body;

            const session = await sessionService.updateSession(sessionId, {
                title,
                metadata,
            });

            return res.status(200).json({
                success: true,
                data: session,
            });
        } catch (error) {
            console.error("❌ Failed to update session:", error);

            if (error instanceof Error && error.message === "Session not found") {
                return res.status(404).json({
                    success: false,
                    error: "Session not found",
                    sessionId: req.params.sessionId,
                });
            }

            return res.status(500).json({
                success: false,
                error: "Failed to update session",
                message: error instanceof Error ? error.message : "Unknown error",
            });
        }
    }

    // Delete a session
    async deleteSession(req: Request, res: Response) {
        try {
            const { sessionId } = req.params;

            await sessionService.deleteSession(sessionId);

            return res.status(200).json({
                success: true,
                message: "Session deleted successfully",
            });
        } catch (error) {
            console.error("❌ Failed to delete session:", error);

            if (error instanceof Error && error.message === "Session not found") {
                return res.status(404).json({
                    success: false,
                    error: "Session not found",
                    sessionId: req.params.sessionId,
                });
            }

            return res.status(500).json({
                success: false,
                error: "Failed to delete session",
                message: error instanceof Error ? error.message : "Unknown error",
            });
        }
    }

    // List all sessions
    async listSessions(req: Request, res: Response) {
        try {
            const limit = parseInt(req.query.limit as string) || 50;
            const offset = parseInt(req.query.offset as string) || 0;

            const sessions = await sessionService.listSessions(limit, offset);

            return res.status(200).json({
                success: true,
                data: {
                    sessions,
                    pagination: {
                        limit,
                        offset,
                        total: sessions.length,
                    },
                },
            });
        } catch (error) {
            console.error("❌ Failed to list sessions:", error);
            return res.status(500).json({
                success: false,
                error: "Failed to list sessions",
                message: error instanceof Error ? error.message : "Unknown error",
            });
        }
    }
}

export default new SessionController();
