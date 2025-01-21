import express from "express";
import { verifyToken } from "../middlewares/authMiddleware.js";
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
router.get("/users", verifyToken, getAllUsers);
router.post("/users/:userId/suspend", verifyToken, updateUserStatus);
router.delete("/users/:userId", verifyToken, deleteUser);

// Analytics
router.get("/analytics", verifyToken, getAnalytics);
router.get("/export-report", verifyToken, exportReport);

// System Management
router.get("/settings", verifyToken, getSystemSettings);
router.put("/settings", verifyToken, updateSystemSettings);

// Quiz Management
router.get("/quizzes", verifyToken, getAllQuizzes);
router.post("/quizzes/:quizId/status", verifyToken, updateQuizStatus);
router.delete("/quizzes/:quizId", verifyToken, deleteQuiz);

// Dashboard stats route
router.get("/dashboard/stats", verifyToken, getDashboardStats);

// Announcement routes
router.get("/announcements", verifyToken, getAnnouncements);
router.get("/announcements/recent", verifyToken, getRecentAnnouncements);
router.post("/announcements", verifyToken, createAnnouncement);
router.delete("/announcements/:id", verifyToken, deleteAnnouncement);

export default router;
