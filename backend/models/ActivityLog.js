import mongoose from "mongoose";

const activityLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  action: {
    type: String,
    required: true,
    enum: [
      "LOGIN",
      "LOGOUT",
      "QUIZ_CREATE",
      "QUIZ_APPROVE",
      "QUIZ_DELETE",
      "USER_SUSPEND",
      "SETTINGS_UPDATE",
    ],
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  ipAddress: {
    type: String,
  },
  userAgent: {
    type: String,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const ActivityLog = mongoose.model("ActivityLog", activityLogSchema);

export default ActivityLog;
