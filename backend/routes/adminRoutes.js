import express from "express";
import { authenticateToken } from "../middleware/auth.js";
import { logActivity } from "../middlewares/securityMiddleware.js";
import {
  getAllUsers,
  getAnalytics,
  updateUserStatus,
  deleteUser,
  sendAnnouncement,
  exportReport,
  getDashboardStats,
  getAnnouncements,
  createAnnouncement,
  deleteAnnouncement,
  getRecentAnnouncements,
  getAllQuizzes,
  updateQuizStatus,
  deleteQuiz,
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
router.get("/users", authenticateToken, getAllUsers);
router.post("/users/:userId/suspend", authenticateToken, updateUserStatus);
router.delete("/users/:userId", authenticateToken, deleteUser);

// Analytics
router.get("/analytics", authenticateToken, getAnalytics);
router.get("/export-report", authenticateToken, exportReport);

// System Management
router.get("/settings", authenticateToken, getSystemSettings);
router.put("/settings", authenticateToken, updateSystemSettings);

// Quiz Management
router.get("/quizzes", authenticateToken, getAllQuizzes);
router.post("/quizzes/:quizId/status", authenticateToken, updateQuizStatus);
router.delete("/quizzes/:quizId", authenticateToken, deleteQuiz);

// Dashboard stats route
router.get("/dashboard/stats", authenticateToken, getDashboardStats);

// Announcement routes
router.get("/announcements", authenticateToken, getAnnouncements);
router.get("/announcements/recent", authenticateToken, getRecentAnnouncements);
router.post("/announcements", authenticateToken, createAnnouncement);
router.delete("/announcements/:id", authenticateToken, deleteAnnouncement);

export default router;
