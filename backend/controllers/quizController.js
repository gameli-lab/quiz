import mongoose from "mongoose";
import Quiz from "../models/Quiz.js";
import CompletedQuiz from "../models/CompletedQuiz.js";
import sendEmail from "../utils/email.js";
import { processQuizFile } from "../services/quizProcessingService.js";

// Teacher uploads quiz
export const uploadQuiz = async (req, res) => {
  const { title, description, questions, subject, difficulty } = req.body;

  if (
    !title ||
    !questions ||
    questions.length === 0 ||
    !subject ||
    !difficulty
  ) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    const quiz = new Quiz({
      title,
      description,
      questions,
      subject,
      difficulty,
      uploader: req.user.id,
    });

    await quiz.save();
    res.status(200).json({
      message: "Quiz uploaded successfully and awaiting admin approval.",
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin fetching quizes for approval
export const getPendingQuiz = async (req, res) => {
  try {
    const quizzes = await Quiz.find({ approved: false }).populate(
      "uploader",
      "fullname email"
    );
    res.status(200).json(quizzes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* export const approveQuiz = async (req, res) => {
  const { quizId } = req.params;
  try {
    const quiz = await Quiz.findOne(quizId);
    if (!quiz) return res.status(404).json({ message: "Quiz not found." });
    quiz.approved = true;
    await quiz.save();
    res.status(200).json({ message: "Quiz approved successfully." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
 */
//Fetch approved quizzes
export const getApprovedQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find({ approved: true });
    res.status(200).json(quizzes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//Delete a quiz
export const deleteQuiz = async (req, res) => {
  const { quizId } = req.params;
  try {
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found." });
    }
    //Make sure only admin and the uploader can delete
    if (req.user.role !== "admin" && req.user.id !== String(quiz.uploader)) {
      return res
        .status(403)
        .json({ message: "You are not authorised to delete this quiz." });
    }
    await Quiz.deleteOne({ _id: quiz._id });
    res.status(200).json({ message: "Quiz deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const approveQuiz = async (req, res) => {
  const { quizId } = req.params;

  try {
    const quiz = await Quiz.findById(quizId).populate("uploader", "email name");
    if (!quiz) return res.status(404).json({ message: "Quiz not found." });

    quiz.approved = true;
    await quiz.save();

    // Notify the teacher
    await sendEmail(
      quiz.uploader.email,
      "Quiz Approved",
      `Dear ${quiz.uploader.name}, your quiz titled "${quiz.title}" has been approved and is now live for students.`
    );

    res.status(200).json({ message: "Quiz approved successfully." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//Mark a quiz as completed
export const markQuizCompleted = async (req, res) => {
  const { quizId } = req.params;
  const { answers, timeSpent } = req.body;

  try {
    // Check if user has already completed this quiz
    const existingCompletedQuiz = await CompletedQuiz.findOne({
      quiz: quizId,
      user: req.user.id,
    });

    if (existingCompletedQuiz) {
      return res
        .status(400)
        .json({ message: "You have already completed this quiz." });
    }

    const quiz = await Quiz.findById(quizId);
    if (!quiz) return res.status(404).json({ message: "Quiz not found." });

    // Process answers and calculate score
    const processedAnswers = [];
    let score = 0;
    let totalPoints = 0;

    // Check each answer against correct answers in quiz
    if (quiz.questions && quiz.questions.length > 0) {
      Object.keys(answers).forEach((index) => {
        const i = parseInt(index);
        const question = quiz.questions[i];
        if (!question) return;

        const userAnswer = answers[index];
        const isCorrect = userAnswer === question.correctAnswer;
        const points = question.points || 1;

        totalPoints += points;
        if (isCorrect) {
          score += points;
        }

        // Use a string ID that can be converted to ObjectId
        processedAnswers.push({
          questionId: question._id || new mongoose.Types.ObjectId(), // Generate a new ObjectId if _id is missing
          selectedAnswer: userAnswer,
          isCorrect,
        });
      });
    }

    // Calculate score percentage
    const scorePercentage = totalPoints > 0 ? (score / totalPoints) * 100 : 0;

    const completedQuiz = new CompletedQuiz({
      quiz: quizId,
      user: req.user.id,
      score: Math.round(scorePercentage),
      answers: processedAnswers,
      timeSpent: timeSpent || 0,
      completedAt: new Date(),
    });

    await completedQuiz.save();

    res.status(200).json({
      message: "Quiz completed successfully.",
      score: Math.round(scorePercentage),
    });
  } catch (error) {
    console.error("Error completing quiz:", error);
    res.status(500).json({ message: error.message });
  }
};

//Fetch completed quizzes
export const getCompletedQuizzes = async (req, res) => {
  const userId = req.user.id;
  try {
    const completedQuizzes = await CompletedQuiz.find({ user: userId })
      .populate("quiz", "title subject difficulty")
      .sort({ completedAt: -1 });
    res.status(200).json(completedQuizzes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//Get quiz questions
export const getQuizQuestions = async (req, res) => {
  const { quizId } = req.params;
  try {
    const quiz = await Quiz.findById(quizId);
    if (!quiz) return res.status(404).json({ message: "Quiz not found." });

    // Return the entire quiz object instead of just questions
    res.status(200).json(quiz);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//Get quiz results
export const getQuizResults = async (req, res) => {
  const { quizId } = req.params;
  try {
    const quiz = await Quiz.findById(quizId);
    if (!quiz) return res.status(404).json({ message: "Quiz not found." });

    const results = await CompletedQuiz.find({ quiz: quizId })
      .populate("user", "fullname email")
      .select("score completedAt user")
      .sort({ completedAt: -1 });

    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createQuiz = async (req, res) => {
  try {
    const { title, subject, description, timeLimit, difficulty } = req.body;

    // Validate required fields
    if (!title || !subject || !timeLimit || !difficulty) {
      return res.status(400).json({
        message:
          "Missing required fields. Please provide title, subject, timeLimit, and difficulty.",
      });
    }

    // Validate time limit is a positive number
    if (timeLimit <= 0) {
      return res.status(400).json({
        message: "Time limit must be a positive number.",
      });
    }

    const files = req.files;
    const isAdmin = req.user.role === "admin";

    const quiz = new Quiz({
      title,
      subject,
      description,
      timeLimit: parseInt(timeLimit),
      difficulty,
      uploader: req.user._id,
      attachments: files.map((file) => ({
        filename: file.originalname,
        path: file.path,
        mimetype: file.mimetype,
      })),
      approved: isAdmin, // Auto-approve for admin
      isProcessed: false,
      processingStatus: "pending",
      questions: [], // Will be populated by the file processor
    });

    await quiz.save();

    // Process files asynchronously
    processQuizFile(quiz._id, files).catch(console.error);

    res.status(201).json({
      message: isAdmin
        ? "Quiz created and approved successfully"
        : "Quiz created and pending approval",
      quiz,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
