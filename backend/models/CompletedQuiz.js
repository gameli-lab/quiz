import mongoose from "mongoose";

const completedQuizSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    quiz: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz",
      required: true,
    },
    score: {
      type: Number,
      required: true,
    },
    answers: [
      {
        questionId: mongoose.Schema.Types.ObjectId,
        selectedAnswer: String,
        isCorrect: Boolean,
      },
    ],
    timeSpent: {
      type: Number, // Time spent in seconds
      required: true,
    },
    completedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
completedQuizSchema.index({ user: 1, quiz: 1 });
completedQuizSchema.index({ completedAt: -1 });

const CompletedQuiz = mongoose.model("CompletedQuiz", completedQuizSchema);

export default CompletedQuiz;
