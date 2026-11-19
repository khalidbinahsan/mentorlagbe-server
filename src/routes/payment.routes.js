import "dotenv/config";
import express from "express";
import Stripe from "stripe";
import { db } from "../config/db.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

// 1. Create Stripe Checkout Session
router.post("/create-checkout-session", verifyToken, async (req, res) => {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return res.status(500).json({ message: "STRIPE_SECRET_KEY is missing in server .env" });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const dbUser = await db.collection("users").findOne({ email: req.user.email });
    const user = dbUser || req.user;

    if (user.plan === "pro") {
      return res.status(400).json({ message: "You are already subscribed to Pro" });
    }

    const isTutor = user.role === "tutor";
    const amount = isTutor ? 15 : 10;
    const planName = isTutor ? "Tutor Pro Plan" : "Student Pro Plan";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: user.email,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `MentorLagbe — ${planName}`,
              description: isTutor
                ? "Unlimited tuition batch postings & Verified Pro Educator badge"
                : "Priority tutor application placement & Verified Pro Learner badge",
            },
            unit_amount: amount * 100,
          },
          quantity: 1,
        },
      ],
      metadata: {
        userId: (user._id || user.id || "").toString(),
        userEmail: user.email,
        userName: user.name || user.email.split("@")[0],
        userRole: user.role || "student",
        planName,
        amount: String(amount),
      },
      success_url: `${process.env.CLIENT_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/payment/cancel`,
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error("Stripe Checkout Error:", err);
    res.status(500).json({ message: err.message || "Failed to create Stripe session" });
  }
});

// 2. Verify Session & Upgrade User Plan in MongoDB
router.post("/verify-session", verifyToken, async (req, res) => {
  try {
    const { sessionId } = req.body;
    if (!sessionId) return res.status(400).json({ message: "Session ID is required" });

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      return res.status(400).json({ message: "Payment not completed" });
    }

    const paymentsCol = db.collection("payments");
    const existing = await paymentsCol.findOne({ transactionId: session.payment_intent });

    if (!existing) {
      await paymentsCol.insertOne({
        userEmail: session.metadata.userEmail,
        userName: session.metadata.userName,
        userRole: session.metadata.userRole,
        planName: session.metadata.planName,
        amount: Number(session.metadata.amount),
        currency: "USD",
        transactionId: session.payment_intent,
        paidAt: new Date(),
      });
    }

    await db.collection("users").updateOne(
      { email: req.user.email },
      { $set: { plan: "pro" } }
    );

    res.json({ success: true, plan: "pro" });
  } catch (err) {
    console.error("Stripe Verify Error:", err);
    res.status(500).json({ message: err.message || "Payment verification failed" });
  }
});

export default router;