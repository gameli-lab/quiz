import mongoDB from "mongoose";

const quizSchema = new mongoDB.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  questions: {
    type: Array,
    default: [],
    required: true,
  },
  uploader: {
    type: mongoDB.Schema.Types.ObjectId,
    ref: "User",
  },
  timeLimit: {
    type: Number,
    required: true,
  },
  subject: {
    type: String,
    required: true,
    enum: [
      "Math",
      "Science",
      "Computing",
      "English",
      "Art",
      "Social Studies",
      "French",
      "Other",
    ],
  },
  difficulty: {
    type: String,
    enum: ["easy", "medium", "hard"],
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  approved: {
    type: Boolean,
    default: false,
  },
});

const CompletedQuizSchema = new mongoDB.Schema({
  user: { type: mongoDB.Schema.Types.ObjectId, ref: "User", required: true },
  quiz: { type: mongoDB.Schema.Types.ObjectId, ref: "Quiz", required: true },
  completedAt: { type: Date, default: Date.now },
});

const Quiz = mongoDB.model("Quiz", quizSchema);
const CompletedQuiz = mongoDB.model("CompletedQuiz", CompletedQuizSchema);

export { Quiz, CompletedQuiz };
