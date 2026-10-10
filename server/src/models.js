import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);

const expenseSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: { type: String, enum: ["expense", "income"], default: "expense" },
    amount: { type: Number, required: true, min: 0.01 },
    description: { type: String, required: true, trim: true, maxlength: 240 },
    category: { type: String, required: true, trim: true, maxlength: 60 },
    date: { type: Date, required: true },
    merchant: { type: String, trim: true, maxlength: 120 },
    paymentMethod: { type: String, trim: true, maxlength: 60 },
    receiptText: { type: String, maxlength: 12000 },
    recurringCandidate: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export const User = mongoose.model("User", userSchema);
export const Expense = mongoose.model("Expense", expenseSchema);
