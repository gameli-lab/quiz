import rateLimit from "express-rate-limit";
import ActivityLog from "../models/ActivityLog.js";
import SystemSettings from "../models/SystemSettings.js";

// Rate limiting
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: { message: "Too many login attempts. Please try again later." },
});

// Activity logging
export const logActivity = async (req, res, next) => {
  try {
    if (req.user) {
      const log = new ActivityLog({
        user: req.user._id,
        action: req.activityType,
        details: req.activityDetails,
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
      });
      await log.save();
    }
    next();
  } catch (error) {
    console.error("Activity logging error:", error);
    next();
  }
};

// Session validation
export const validateSession = async (req, res, next) => {
  try {
    const settings = await SystemSettings.findOne();
    const sessionTimeout = settings.security.sessionTimeout * 60 * 1000;

    if (req.user && req.user.lastActivity) {
      const timeSinceLastActivity =
        Date.now() - new Date(req.user.lastActivity);
      if (timeSinceLastActivity > sessionTimeout) {
        return res
          .status(401)
          .json({ message: "Session expired. Please login again." });
      }
      req.user.lastActivity = new Date();
      await req.user.save();
    }
    next();
  } catch (error) {
    next(error);
  }
};
