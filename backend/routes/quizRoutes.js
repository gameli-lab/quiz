import express from "express";
import { verifyToken, isAdmin } from "../middlewares/authMiddleware.js";
import { getUserProfile } from "../controllers/userController.js";
import {
  uploadQuiz,
  getPendingQuiz,
  getApprovedQuizzes,
  approveQuiz,
  deleteQuiz,
  markQuizCompleted,
  getCompletedQuizzes,
  getQuizResults,
  getQuizQuestions,
  createQuiz,
} from "../controllers/quizController.js";
import { upload } from "../middlewares/uploadMiddleware.js";
import { getAnnouncements } from "../controllers/announcementController.js";

const router = express.Router();

//Teacher upload Quiz
router.post("/upload", verifyToken, uploadQuiz);

//Admin view pending quizzes
router.get("/pending", verifyToken, isAdmin, getPendingQuiz);

//Admin approves quiz
router.put("/approve/:quizId", verifyToken, isAdmin, approveQuiz);

//Get approved quizzes
router.get("/approved", verifyToken, getApprovedQuizzes);

//Delete quiz (admin or uploader)
router.delete("/:quizId", verifyToken, deleteQuiz);

//Mark quiz as completed
router.post("/:quizId/complete", verifyToken, markQuizCompleted);

//Get completed quizzes
router.get("/completed", verifyToken, getCompletedQuizzes);

//Get quiz results
router.get("/results/:quizId", verifyToken, getQuizResults);

//Get quiz questions
router.get("/questions/:quizId", verifyToken, getQuizQuestions);

//Get user profile
router.get("/profile", verifyToken, getUserProfile);

router.post(
  "/create",
  verifyToken,
  upload.array("files", 5), // Allow up to 5 files
  createQuiz
);

// Get announcements for students/teachers
router.get("/announcements", verifyToken, getAnnouncements);

export default router;
