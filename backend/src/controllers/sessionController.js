import mongoose from "mongoose";
import { chatClient, streamClient } from "../lib/stream.js";
import Session from "../models/Session.js";

// Helper to generate a 9-digit meeting ID like '123-456-789'
function generateMeetingId() {
  const digits = Math.floor(100000000 + Math.random() * 900000000).toString();
  return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6, 9)}`;
}

// Helper to generate a random 6-character alphanumeric password
function generatePassword() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let password = '';
  for (let i = 0; i < 6; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

export async function createSession(req, res) {
  try {
    const { problem, difficulty } = req.body;
    const userId = req.user._id;
    const clerkId = req.user.clerkId;

    // generate a unique call id for stream video
    const callId = `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    // auto-generate meetingId with retry for uniqueness
    let meetingId;
    let retries = 3;
    while (retries > 0) {
      meetingId = generateMeetingId();
      const exists = await Session.findOne({ meetingId });
      if (!exists) break;
      retries--;
    }
    if (retries === 0) {
      return res.status(500).json({ message: "Failed to generate unique meeting ID, please try again" });
    }

    const password = generatePassword();

    // create session in db
    const session = await Session.create({
      problem,
      difficulty,
      host: userId,
      callId,
      meetingId,
      password,
    });

    // create stream video call
    await streamClient.video.call("default", callId).getOrCreate({
      data: {
        created_by_id: clerkId,
        custom: { problem, difficulty, sessionId: session._id.toString() },
      },
    });

    // chat messaging
    const channel = chatClient.channel("messaging", callId, {
      name: `Session ${meetingId}`,
      created_by_id: clerkId,
      members: [clerkId],
    });

    await channel.create();

    res.status(201).json({ session, meetingId, password });
  } catch (error) {
    console.error("Error in createSession controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getActiveSessions(_, res) {
  try {
    const sessions = await Session.find({ status: "active" })
      .populate("host", "name profileImage email clerkId")
      .populate("participants", "name profileImage email clerkId")
      .sort({ createdAt: -1 })
      .limit(20);

    res.status(200).json({ sessions });
  } catch (error) {
    console.error("Error in getActiveSessions controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getMyRecentSessions(req, res) {
  try {
    const userId = req.user._id;

    // get sessions where user is either host or participant
    const sessions = await Session.find({
      status: "completed",
      $or: [{ host: userId }, { participants: userId }],
    })
      .sort({ createdAt: -1 })
      .limit(20);

    res.status(200).json({ sessions });
  } catch (error) {
    console.error("Error in getMyRecentSessions controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getSessionById(req, res) {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid session ID format" });
    }

    const session = await Session.findById(id)
      .populate("host", "name email profileImage clerkId")
      .populate("participants", "name email profileImage clerkId");

    if (!session) return res.status(404).json({ message: "Session not found" });

    res.status(200).json({ session });
  } catch (error) {
    console.error("Error in getSessionById controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function joinSession(req, res) {
  try {
    const { meetingId, password } = req.body;
    const userId = req.user._id;
    const clerkId = req.user.clerkId;

    // First, find the session to validate password and check conditions
    const sessionCheck = await Session.findOne({ meetingId });

    if (!sessionCheck) return res.status(404).json({ message: "Session not found" });

    // validate password
    if (password !== sessionCheck.password) {
      return res.status(401).json({ message: "Invalid Password" });
    }

    if (sessionCheck.status !== "active") {
      return res.status(400).json({ message: "Cannot join a completed session" });
    }

    if (sessionCheck.host.toString() === userId.toString()) {
      return res.status(400).json({ message: "Host cannot join their own session as participant" });
    }

    // Atomic update: check participant limit AND push in a single operation
    // This prevents the race condition where two users pass the length check simultaneously
    const session = await Session.findOneAndUpdate(
      {
        meetingId,
        status: "active",
        participants: { $nin: [userId] },
        $expr: { $lt: [{ $size: "$participants" }, 3] },
      },
      { $addToSet: { participants: userId } },
      { new: true }
    );

    if (!session) {
      // Determine the specific reason for failure
      const current = await Session.findOne({ meetingId });
      if (current.participants.some((p) => p.toString() === userId.toString())) {
        return res.status(400).json({ message: "You have already joined this session" });
      }
      return res.status(409).json({ message: "Room is full" });
    }

    const channel = chatClient.channel("messaging", session.callId);
    await channel.addMembers([clerkId]);

    res.status(200).json({ session });
  } catch (error) {
    console.error("Error in joinSession controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function endSession(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid session ID format" });
    }

    const session = await Session.findById(id);

    if (!session) return res.status(404).json({ message: "Session not found" });

    // check if user is the host
    if (session.host.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Only the host can end the session" });
    }

    // check if session is already completed
    if (session.status === "completed") {
      return res.status(400).json({ message: "Session is already completed" });
    }

    // delete stream video call
    const call = streamClient.video.call("default", session.callId);
    await call.delete({ hard: true });

    // delete stream chat channel
    const channel = chatClient.channel("messaging", session.callId);
    await channel.delete();

    session.status = "completed";
    await session.save();

    res.status(200).json({ session, message: "Session ended successfully" });
  } catch (error) {
    console.error("Error in endSession controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
