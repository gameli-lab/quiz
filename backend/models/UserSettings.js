import mongoose from "mongoose";

const userSettingsSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    emailNotifications: {
      type: Boolean,
      default: true,
    },
    quizReminders: {
      type: Boolean,
      default: true,
    },
    resultNotifications: {
      type: Boolean,
      default: true,
    },
    theme: {
      type: String,
      enum: ["light", "dark", "system"],
      default: "light",
    },
    language: {
      type: String,
      enum: ["en", "es", "fr"],
      default: "en",
    },
    accessibility: {
      fontSize: {
        type: String,
        enum: ["small", "medium", "large"],
        default: "medium",
      },
      highContrast: {
        type: Boolean,
        default: false,
      },
    },
  },
  { timestamps: true }
);

const UserSettings = mongoose.model("UserSettings", userSettingsSchema);

export default UserSettings;
