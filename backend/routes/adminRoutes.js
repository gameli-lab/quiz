import express from "express";
import { verifyToken, isAdmin } from "../middlewares/authMiddleware.js";
import { logActivity } from "../middlewares/securityMiddleware.js";
import {
  getAllUsers,
  getAnalytics,
  updateUserStatus,
  deleteUser,
  sendAnnouncement,
  bulkApproveQuizzes,
  exportReport,
} from "../controllers/adminController.js";
import {
  getSystemSettings,
  updateSystemSettings,
  getActivityLogs,
  getSystemAnalytics,
  createBackup,
  restoreBackup,
  getBackups,
} from "../controllers/systemController.js";

const router = express.Router();

// User Management
router.get("/users", verifyToken, isAdmin, getAllUsers);
router.post("/users/:userId/suspend", verifyToken, isAdmin, updateUserStatus);
router.delete("/users/:userId", verifyToken, isAdmin, deleteUser);

// Analytics
router.get("/analytics", verifyToken, isAdmin, getAnalytics);
router.get("/export-report", verifyToken, isAdmin, exportReport);

// System Management
router.post("/announcement", verifyToken, isAdmin, sendAnnouncement);
router.get("/settings", verifyToken, isAdmin, getSystemSettings);
router.put("/settings", verifyToken, isAdmin, updateSystemSettings);

// Quiz Management
router.post("/quizzes/bulk-approve", verifyToken, isAdmin, bulkApproveQuizzes);

router.get("/settings", verifyToken, isAdmin, getSystemSettings);
router.put(
  "/settings",
  verifyToken,
  isAdmin,
  logActivity,
  updateSystemSettings
);

// Activity Logs
router.get("/activity-logs", verifyToken, isAdmin, getActivityLogs);

// Analytics
router.get("/analytics", verifyToken, isAdmin, getSystemAnalytics);

// Backup Management
router.post("/backup", verifyToken, isAdmin, logActivity, createBackup);
router.post("/restore", verifyToken, isAdmin, logActivity, restoreBackup);
router.get("/backups", verifyToken, isAdmin, getBackups);

export default router;
