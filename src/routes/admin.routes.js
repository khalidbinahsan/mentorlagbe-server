import express from "express";
import { ObjectId } from "mongodb";
import {
  usersCollection,
  tuitionsCollection,
  paymentsCollection,
} from "../config/db.js";
import { verifyToken, verifyAdmin } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(verifyToken, verifyAdmin);

// Admin Overview Stats
router.get("/stats", async (req, res) => {
  try {
    const [totalUsers, totalTutors, pendingTuitions, approvedTuitions, payments] =
      await Promise.all([
        usersCollection.countDocuments(),
        usersCollection.countDocuments({ role: "tutor" }),
        tuitionsCollection.countDocuments({ approvalStatus: "pending" }),
        tuitionsCollection.countDocuments({ approvalStatus: "approved" }),
        paymentsCollection.find({ paymentStatus: "paid" }).toArray(),
      ]);

    const totalRevenue = payments.reduce((sum, p) => sum + (p.amount || 0), 0);

    res.send({
      totalUsers,
      totalTutors,
      pendingTuitions,
      approvedTuitions,
      totalRevenue,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to load admin stats" });
  }
});

// Get all users
router.get("/users", async (req, res) => {
  const users = await usersCollection.find().sort({ createdAt: -1 }).toArray();
  res.send(users);
});

// Update user role
router.patch("/users/:id/role", async (req, res) => {
  const { role } = req.body;
  if (!["student", "tutor", "admin"].includes(role)) {
    return res.status(400).json({ message: "Invalid role" });
  }
  const result = await usersCollection.updateOne(
    { _id: new ObjectId(req.params.id) },
    { $set: { role } }
  );
  res.send(result);
});

// Get all tuitions for approval
router.get("/tuitions", async (req, res) => {
  const tuitions = await tuitionsCollection.find().sort({ createdAt: -1 }).toArray();
  res.send(tuitions);
});

// Approve or reject tuition
router.patch("/tuitions/:id/status", async (req, res) => {
  const { approvalStatus } = req.body;
  if (!["approved", "rejected"].includes(approvalStatus)) {
    return res.status(400).json({ message: "Invalid approval status" });
  }
  const result = await tuitionsCollection.updateOne(
    { _id: new ObjectId(req.params.id) },
    { $set: { approvalStatus } }
  );
  res.send(result);
});

// View all Stripe transactions
router.get("/transactions", async (req, res) => {
  const transactions = await paymentsCollection.find().sort({ paidAt: -1 }).toArray();
  res.send(transactions);
});

export default router;