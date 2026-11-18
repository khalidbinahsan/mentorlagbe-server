import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { db } from "./db.js";

export const auth = betterAuth({
  database: mongodbAdapter(db),
  baseURL: process.env.BETTER_AUTH_URL,
  trustedOrigins: [process.env.CLIENT_URL],
  emailAndPassword: {
    enabled: true,
  },
  user: {
    modelName: "users",
    additionalFields: {
      role: {
        type: "string",
        required: true,
        defaultValue: "student",
      },
      plan: {
        type: "string",
        required: true,
        defaultValue: "free",
      },
      phone: {
        type: "string",
        required: false,
        defaultValue: "",
      },
      bio: {
        type: "string",
        required: false,
        defaultValue: "",
      },
    },
  },
});