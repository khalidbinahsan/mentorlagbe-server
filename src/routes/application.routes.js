import express from "express";
import { ObjectId } from "mongodb";
import { applicationsCollection, tuitionsCollection } from "../config/db.js";
import { verifyToken, verifyStudent, verifyTutor } from "../middlewares/auth.middleware.js";

const router = express.Router();

// STUDENT: Apply for tuition
router.post("/", verifyToken, verifyStudent, async (req, res) => {
  try {
    const { tuitionId, studentPhone, preferredSchedule, studentNote } = req.body;

    const existing = await applicationsCollection.findOne({
      tuitionId,
      studentEmail: req.dbUser.email,
    });
    if (existing) {
      return res.status(400).json({ message: "You have already applied for this tuition." });
    }

    const tuition = await tuitionsCollection.findOne({ _id: new ObjectId(tuitionId) });
    if (!tuition) return res.status(404).json({ message: "Tuition not found" });

    const application = {
      tuitionId,
      tuitionTitle: tuition.title,
      subject: tuition.subject,
      monthlyFee: tuition.monthlyFee,
      tutorEmail: tuition.tutorEmail,
      studentName: req.dbUser.name,
      studentEmail: req.dbUser.email,
      studentPhone,
      preferredSchedule,
      studentNote,
      status: "pending",
      appliedAt: new Date(),
    };

    const result = await applicationsCollection.insertOne(application);
    res.status(201).send(result);
  } catch (error) {
    res.status(500).json({ message: "Failed to submit application" });
  }
});

// STUDENT: Get my applications
router.get("/my-applications", verifyToken, verifyStudent, async (req, res) => {
  try {
    const result = await applicationsCollection
      .find({ studentEmail: req.dbUser.email })
      .sort({ appliedAt: -1 })
      .toArray();
    res.send(result);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch applications" });
  }
});

// STUDENT: Cancel pending application
router.delete("/:id", verifyToken, verifyStudent, async (req, res) => {
  try {
    const app = await applicationsCollection.findOne({
      _id: new ObjectId(req.params.id),
      studentEmail: req.dbUser.email,
    });
    if (!app) return res.status(404).json({ message: "Application not found" });
    if (app.status !== "pending") {
      return res.status(400).json({ message: "Only pending applications can be cancelled." });
    }

    const result = await applicationsCollection.deleteOne({ _id: app._id });
    res.send(result);
  } catch (error) {
    res.status(500).json({ message: "Failed to cancel application" });
  }
});

// TUTOR: View applicants
router.get("/tutor-applicants", verifyToken, verifyTutor, async (req, res) => {
  try {
    const result = await applicationsCollection
      .find({ tutorEmail: req.dbUser.email })
      .sort({ appliedAt: -1 })
      .toArray();
    res.send(result);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch applicants" });
  }
});

// TUTOR: Accept or reject applicant
router.patch("/:id/status", verifyToken, verifyTutor, async (req, res) => {
  try {
    const { status } = req.body;
    if (!["accepted", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const result = await applicationsCollection.updateOne(
      { _id: new ObjectId(req.params.id), tutorEmail: req.dbUser.email },
      { $set: { status } }
    );
    res.send(result);
  } catch (error) {
    res.status(500).json({ message: "Failed to update application status" });
  }
});

export default router;