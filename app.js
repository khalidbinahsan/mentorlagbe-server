import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import { toNodeHandler, fromNodeHeaders } from "better-auth/node";
import { auth } from "./config/auth.js";
import { usersCollection } from "./config/db.js";
import userRoutes from "./routes/user.routes.js";
import tuitionRoutes from "./routes/tuition.routes.js";
import applicationRoutes from "./routes/application.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import paymentRoutes from "./routes/payment.routes.js";

const app = express();

app.use(
  cors({
    origin: [process.env.CLIENT_URL],
    credentials: true,
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
  })
);

app.all("/api/auth/*splat", toNodeHandler(auth));

app.use(express.json());

app.post("/api/jwt", async (req, res) => {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session?.user) {
      return res.status(401).json({ message: "No active session" });
    }

    const dbUser = await usersCollection.findOne({ email: session.user.email });
    const token = jwt.sign(
      {
        email: session.user.email,
        role: dbUser?.role || "student",
        plan: dbUser?.plan || "free",
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.send({ token, user: dbUser });
  } catch (error) {
    res.status(500).json({ message: "Failed to generate JWT" });
  }
});

app.use("/api/users", userRoutes);
app.use("/api/tuitions", tuitionRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/payments", paymentRoutes);

app.get("/", (req, res) => {
  res.send({ status: "OK", message: "MentorLagbe API is running" });
});

export default app;