import Razorpay from "razorpay";
import crypto from "crypto";
import User from "../models/User.js";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// POST /api/payment/create-order
export async function createOrder(req, res) {
  try {
    const options = {
      amount: 499 * 100, // ₹499 in paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
      notes: {
        clerkId: req.auth().userId,
      },
    };

    const order = await razorpay.orders.create(options);

    res.status(201).json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("Error in createOrder controller:", error);
    res.status(500).json({ message: "Failed to create payment order" });
  }
}

// POST /api/payment/verify
export async function verifyPayment(req, res) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ message: "Missing payment verification fields" });
    }

    // Verify signature using Razorpay's HMAC SHA256 method
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: "Payment verification failed - invalid signature" });
    }

    // Signature valid → upgrade user to premium
    const clerkId = req.auth().userId;
    const user = await User.findOneAndUpdate(
      { clerkId },
      { isPremium: true },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "Payment verified successfully",
      isPremium: user.isPremium,
    });
  } catch (error) {
    console.error("Error in verifyPayment controller:", error);
    res.status(500).json({ message: "Payment verification failed" });
  }
}
