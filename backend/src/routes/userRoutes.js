import express from "express";
import { syncUser } from "../controllers/userController.js";
import { requireAuth } from "@clerk/express";

const router = express.Router();

// Sync user from Clerk to MongoDB (called after login)
router.post("/sync", requireAuth(), syncUser);

export default router;
