import { clerkClient } from "@clerk/express";
import User from "../models/User.js";
import { upsertStreamUser } from "../lib/stream.js";

export async function syncUser(req, res) {
  try {
    const { userId } = req.auth();

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized - no user ID" });
    }

    // Check if user already exists in our database
    let user = await User.findOne({ clerkId: userId });

    if (user) {
      // User already exists, return it
      return res.status(200).json({ user, synced: false });
    }

    // User doesn't exist, fetch from Clerk and create
    const clerkUser = await clerkClient.users.getUser(userId);

    const newUser = {
      clerkId: userId,
      email: clerkUser.emailAddresses[0]?.emailAddress,
      name: `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() || "User",
      profileImage: clerkUser.imageUrl || "",
    };

    user = await User.create(newUser);

    // Also sync to Stream
    await upsertStreamUser({
      id: user.clerkId.toString(),
      name: user.name,
      image: user.profileImage,
    });

    res.status(201).json({ user, synced: true });
  } catch (error) {
    console.error("Error in syncUser controller:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
