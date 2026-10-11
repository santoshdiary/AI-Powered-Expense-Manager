import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import authRoutes from "./routes/auth.js";
import expenseRoutes from "./routes/expenses.js";
import aiRoutes from "./routes/ai.js";


const app = express();
app.use(cors({ origin: process.env.CLIENT_ORIGIN || "http://localhost:5173" }));
app.use(express.json({ limit: "1mb" }));
app.get("/api/health", (_req, res) =>
  res.json({ ok: true, service: "ai-expense-manager" }),
);
app.use("/api/auth", authRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/ai", aiRoutes);

const port = process.env.PORT || 5000;

if (!process.env.JWT_SECRET?.trim()) {
  console.error("JWT_SECRET is required. Add it to server/.env.");
  process.exit(1);
}

//-------db connection logic-------------




try {
  await mongoose.connect(process.env.MONGODB_URI, {
    dbName: process.env.MONGODB_DB || "expense_manager",
  });
  console.log("MongoDB connected");
  app.listen(port, () =>
    console.log(`API listening on http://localhost:${port}`),
  );
} catch (err) {
  console.error("Failed to start. Check MONGODB_URI.", err.message);
  process.exit(1);
}
