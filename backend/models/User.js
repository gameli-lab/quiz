import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["student", "teacher", "admin"],
      default: "student",
    },
    bio: {
      type: String,
      default: "",
    },
    avatar: {
      type: String,
      default: "default-avatar.png",
    },
    suspended: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastActivity: {
      type: Date,
      default: Date.now,
    },
    passwordResetToken: String, // Add this field
    passwordResetExpires: Date, // Add this field
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

export default User;
