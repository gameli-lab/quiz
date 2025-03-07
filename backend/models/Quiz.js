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
      "Creative Art and Design",
      "Social Studies",
      "French",
      "Career Technology",
      "Ghanaian Language",
      "Religious and Moral Education",
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
  attachments: [
    {
      filename: String,
      path: String,
      mimetype: String,
      uploadedAt: { type: Date, default: Date.now },
    },
  ],
  isProcessed: { type: Boolean, default: false },
  processingStatus: {
    type: String,
    enum: ["pending", "processing", "completed", "failed"],
    default: "pending",
  },
});

const Quiz = mongoDB.model("Quiz", quizSchema);

export default Quiz;
