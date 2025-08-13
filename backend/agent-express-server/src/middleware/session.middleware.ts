import { NextFunction, Request, Response } from "express";
import { sessionService } from "../services/session.service";

/**
 * Middleware to validate session ID and check if session exists
 * @param req - The request object
 * @param res - The response object
 * @param next - The next middleware function
 * @returns void
 */
export const sessionMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const sessionId = req.params.sessionId;
    if (!sessionId) {
        return res.status(400).json({
            success: false,
            error: "Missing session ID",
        });
    }

    const session = await sessionService.getSession(sessionId);
    if (!session) {
        return res.status(404).json({
            success: false,
            error: "Session not found",
            sessionId,
        });
    }
    return next();
};
