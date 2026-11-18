import jwt from "jsonwebtoken";
import { usersCollection } from "../config/db.js";

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized: Missing token" });
  }

  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }
    req.user = decoded;
    next();
  });
};

const verifyRole = (role) => async (req, res, next) => {
  try {
    const dbUser = await usersCollection.findOne({ email: req.user.email });
    if (!dbUser || dbUser.role !== role) {
      return res.status(403).json({ message: `Forbidden: ${role} access only` });
    }
    req.dbUser = dbUser;
    next();
  } catch (error) {
    res.status(500).json({ message: "Server error verifying role" });
  }
};

export const verifyStudent = verifyRole("student");
export const verifyTutor = verifyRole("tutor");
export const verifyAdmin = verifyRole("admin");