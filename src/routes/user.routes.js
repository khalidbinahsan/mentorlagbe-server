import express from "express";
import {
  usersCollection,
  tuitionsCollection,
  applicationsCollection,
} from "../config/db.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Get current user profile
router.get("/me", verifyToken, async (req, res) => {
  const user = await usersCollection.findOne({ email: req.user.email });
  res.send(user);
});

// Shared: Update Profile (Name, Phone, Bio, Image)
router.patch("/profile", verifyToken, async (req, res) => {
  try {
    const { name, phone, bio, image } = req.body;
    const updateFields = {};
    if (name !== undefined) updateFields.name = name;
    if (phone !== undefined) updateFields.phone = phone;
    if (bio !== undefined) updateFields.bio = bio;
    if (image !== undefined) updateFields.image = image;

    const result = await usersCollection.updateOne(
      { email: req.user.email },
      { $set: updateFields }
    );
    res.send(result);
  } catch (error) {
    res.status(500).json({ message: "Failed to update profile" });
  }
});

// Dashboard Overview Stats for Student & Tutor
router.get("/dashboard-stats", verifyToken, async (req, res) => {
  try {
    const user = await usersCollection.findOne({ email: req.user.email });

    if (user.role === "student") {
      const [totalApplied, acceptedCount, pendingCount] = await Promise.all([
        applicationsCollection.countDocuments({ studentEmail: user.email }),
        applicationsCollection.countDocuments({ studentEmail: user.email, status: "accepted" }),
        applicationsCollection.countDocuments({ studentEmail: user.email, status: "pending" }),
      ]);
      return res.send({ totalApplied, acceptedCount, pendingCount, plan: user.plan });
    }

    if (user.role === "tutor") {
      const [totalPosted, approvedCount, totalApplicants] = await Promise.all([
        tuitionsCollection.countDocuments({ tutorEmail: user.email }),
        tuitionsCollection.countDocuments({ tutorEmail: user.email, approvalStatus: "approved" }),
        applicationsCollection.countDocuments({ tutorEmail: user.email }),
      ]);
      return res.send({ totalPosted, approvedCount, totalApplicants, plan: user.plan });
    }

    res.send({ plan: user.plan });
  } catch (error) {
    res.status(500).json({ message: "Failed to load stats" });
  }
});

export default router;