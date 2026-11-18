import express from "express";
import { ObjectId } from "mongodb";
import { tuitionsCollection } from "../config/db.js";
import { verifyToken, verifyTutor } from "../middlewares/auth.middleware.js";

const router = express.Router();

// PUBLIC: Browse approved & active tuitions
router.get("/", async (req, res) => {
  try {
    const { search = "", subject = "", classLevel = "", mode = "", page = 1, limit = 6 } = req.query;
    const query = { approvalStatus: "approved", isActive: true };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { subject: { $regex: search, $options: "i" } },
      ];
    }
    if (subject) query.subject = subject;
    if (classLevel) query.classLevel = classLevel;
    if (mode) query.mode = mode;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const [tuitions, total] = await Promise.all([
      tuitionsCollection.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum).toArray(),
      tuitionsCollection.countDocuments(query),
    ]);

    res.send({
      tuitions,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch tuitions" });
  }
});

// TUTOR: Get logged-in tutor's tuitions
router.get("/my-tuitions", verifyToken, verifyTutor, async (req, res) => {
  try {
    const result = await tuitionsCollection
      .find({ tutorEmail: req.dbUser.email })
      .sort({ createdAt: -1 })
      .toArray();
    res.send(result);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch your tuitions" });
  }
});

// PUBLIC: Single tuition details
router.get("/:id", async (req, res) => {
  try {
    const tuition = await tuitionsCollection.findOne({ _id: new ObjectId(req.params.id) });
    if (!tuition) return res.status(404).json({ message: "Tuition not found" });
    res.send(tuition);
  } catch (error) {
    res.status(400).json({ message: "Invalid tuition ID" });
  }
});

// TUTOR: Create tuition (Free max 2, Pro unlimited)
router.post("/", verifyToken, verifyTutor, async (req, res) => {
  try {
    if (req.dbUser.plan === "free") {
      const count = await tuitionsCollection.countDocuments({ tutorEmail: req.dbUser.email });
      if (count >= 2) {
        return res.status(403).json({
          message: "Free plan allows maximum 2 tuition posts. Upgrade to Pro for unlimited posts.",
        });
      }
    }

    const newTuition = {
      ...req.body,
      monthlyFee: Number(req.body.monthlyFee),
      daysPerWeek: Number(req.body.daysPerWeek),
      tutorName: req.dbUser.name,
      tutorEmail: req.dbUser.email,
      approvalStatus: "pending",
      isActive: true,
      createdAt: new Date(),
    };

    const result = await tuitionsCollection.insertOne(newTuition);
    res.status(201).send(result);
  } catch (error) {
    res.status(500).json({ message: "Failed to create tuition post" });
  }
});

// TUTOR: Update tuition or toggle isActive
router.patch("/:id", verifyToken, verifyTutor, async (req, res) => {
  try {
    const updateDoc = { $set: { ...req.body } };
    if (req.body.monthlyFee !== undefined) updateDoc.$set.monthlyFee = Number(req.body.monthlyFee);
    if (req.body.daysPerWeek !== undefined) updateDoc.$set.daysPerWeek = Number(req.body.daysPerWeek);

    const result = await tuitionsCollection.updateOne(
      { _id: new ObjectId(req.params.id), tutorEmail: req.dbUser.email },
      updateDoc
    );
    res.send(result);
  } catch (error) {
    res.status(500).json({ message: "Failed to update tuition" });
  }
});

// TUTOR: Delete tuition
router.delete("/:id", verifyToken, verifyTutor, async (req, res) => {
  try {
    const result = await tuitionsCollection.deleteOne({
      _id: new ObjectId(req.params.id),
      tutorEmail: req.dbUser.email,
    });
    res.send(result);
  } catch (error) {
    res.status(500).json({ message: "Failed to delete tuition" });
  }
});

export default router;