import { Quiz, CompletedQuiz } from "../models/Quiz.js";
import sendEmail from "../utils/email.js";
// import User from '../models/User.js';

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
    if (!quiz) return;
    res.status(404).json({ message: "Quiz not found." });
    //Make sure only admin and the uploader can delete
    if (req.user.role !== "admin" && req.user.id !== String(quiz.uploader)) {
      return res
        .status(403)
        .json({ message: "You are not authorised to delete this quiz." });
    }
    await quiz.remove();
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

  try {
    const existingCompletedQuiz = await CompletedQuiz.findOne({
      quiz: quizId,
      user: req.user.id,
    });
    if (existingCompletedQuiz)
      return res
        .status(400)
        .json({ message: "You have already completed this quiz." });

    const quiz = await Quiz.findById(quizId);
    if (!quiz) return res.status(404).json({ message: "Quiz not found." });

    const completedQuiz = new CompletedQuiz({
      quiz: quizId,
      user: req.user.id,
      score: 0,
      completedAt: new Date(),
    });

    await completedQuiz.save();
    res.status(200).json({ message: "Quiz completed successfully." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//Fetch completed quizzes
export const getCompletedQuizzes = async (req, res) => {
  const userId = req.user.id;
  try {
    const completedQuizzes = await CompletedQuiz.find({ user: userId })
      .populate("quiz")
      .sort({ completedAt: -1 });
    res.status(200).json(completedQuizzes);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed fetching completed quizzes:", error });
  }
};

//Get quiz questions
export const getQuizQuestions = async (req, res) => {
  const { quizId } = req.params;
  try {
    const quiz = await Quiz.findById(quizId);
    if (!quiz) return res.status(404).json({ message: "Quiz not found." });
    res.status(200).json(quiz.questions);
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