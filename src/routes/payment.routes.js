import express from "express";
import Stripe from "stripe";
import { usersCollection, paymentsCollection } from "../config/db.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Create Stripe Checkout Session ($15 Tutor Pro, $10 Student Pro)
router.post("/create-checkout-session", verifyToken, async (req, res) => {
  try {
    const user = await usersCollection.findOne({ email: req.user.email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isTutor = user.role === "tutor";
    const amount = isTutor ? 15 : 10;
    const planName = isTutor ? "Pro Tutor Plan" : "Pro Student Plan";

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: user.email,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { name: `MentorLagbe - ${planName}` },
            unit_amount: amount * 100,
          },
          quantity: 1,
        },
      ],
      metadata: {
        userEmail: user.email,
        userName: user.name,
        userRole: user.role,
        planName,
        amount: String(amount),
      },
      success_url: `${process.env.CLIENT_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/payment/cancel`,
    });

    res.send({ url: session.url });
  } catch (error) {
    res.status(500).json({ message: "Failed to create checkout session" });
  }
});

// Verify Stripe Session on /payment/success & sync DB
router.post("/verify-session", verifyToken, async (req, res) => {
  try {
    const { sessionId } = req.body;
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      return res.status(400).json({ message: "Payment not completed" });
    }

    const existingPayment = await paymentsCollection.findOne({ stripeSessionId: session.id });
    if (!existingPayment) {
      await paymentsCollection.insertOne({
        userEmail: session.metadata.userEmail,
        userName: session.metadata.userName,
        userRole: session.metadata.userRole,
        planName: session.metadata.planName,
        amount: Number(session.metadata.amount),
        currency: session.currency.toUpperCase(),
        transactionId: session.payment_intent,
        stripeSessionId: session.id,
        paymentStatus: "paid",
        paidAt: new Date(),
      });

      await usersCollection.updateOne(
        { email: session.metadata.userEmail },
        { $set: { plan: "pro" } }
      );
    }

    res.send({ success: true, plan: "pro" });
  } catch (error) {
    res.status(500).json({ message: "Failed to verify payment session" });
  }
});

export default router;