import { MongoClient } from "mongodb";
import dotenv from "dotenv";
dotenv.config();

const client = new MongoClient(process.env.MONGODB_URI);
export const db = client.db("mentorlagbe");

export const usersCollection = db.collection("users");
export const tuitionsCollection = db.collection("tuitions");
export const applicationsCollection = db.collection("applications");
export const paymentsCollection = db.collection("payments");

export async function connectDB() {
  await client.connect();
  console.log("✅ Connected to MongoDB Atlas (mentorlagbe)");
}