import { Router } from "express";
import { chatRouter, fileRouter } from ".";
import sessionController from "../controllers/session.controller";
import { sessionMiddleware } from "../middleware/session.middleware";

const router = Router();

// Create a new session
router.post("/", sessionController.createSession);

// Get a specific session
router.get("/:sessionId", sessionController.getSession);

// Update a session
router.put("/:sessionId", sessionController.updateSession);

// Delete a session
router.delete("/:sessionId", sessionController.deleteSession);

// List all sessions
router.get("/", sessionController.listSessions);

// Chat routes
router.use("/:sessionId/chat", sessionMiddleware, chatRouter);

// File routes
router.use("/:sessionId/files", sessionMiddleware, fileRouter);

export default router;
