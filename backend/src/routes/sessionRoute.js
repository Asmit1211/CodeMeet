import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import { sendInterviewReport } from "../controllers/reportController.js";
import {
  createSession,
  endSession,
  getActiveSessions,
  getMyRecentSessions,
  getSessionById,
  joinSession,
} from "../controllers/sessionController.js";

const router = express.Router();

router.post("/", protectRoute, createSession);
router.get("/active", protectRoute, getActiveSessions);
router.get("/my-recent", protectRoute, getMyRecentSessions);

router.post("/join", protectRoute, joinSession);

// Interview report email (no DB changes) — must be before /:id routes
router.post("/report", protectRoute, sendInterviewReport);

router.get("/:id", protectRoute, getSessionById);
router.post("/:id/end", protectRoute, endSession);

export default router;
