import { Router } from "express";
import chatController from "../controllers/chat.controller";

// Chat routes with mergeParams to inherit sessionId from parent route
const router = Router({ mergeParams: true });

router.post("/", chatController.addMessage);
router.get("/", chatController.getChat);

export default router;
