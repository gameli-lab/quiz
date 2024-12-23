import mongoose from "mongoose";

const systemSettingsSchema = new mongoose.Schema(
  {
    quiz: {
      maxQuestionsPerQuiz: { type: Number, default: 50 },
      timeLimit: { type: Number, default: 60 }, // minutes
      maxAttempts: { type: Number, default: 3 },
      passingScore: { type: Number, default: 70 },
    },
    security: {
      maxLoginAttempts: { type: Number, default: 5 },
      lockoutDuration: { type: Number, default: 30 }, // minutes
      passwordPolicy: {
        minLength: { type: Number, default: 8 },
        requireSpecialChar: { type: Boolean, default: true },
        requireNumber: { type: Boolean, default: true },
        requireUppercase: { type: Boolean, default: true },
      },
      sessionTimeout: { type: Number, default: 60 }, // minutes
    },
    email: {
      templates: {
        welcome: { type: String },
        quizApproved: { type: String },
        quizRejected: { type: String },
        accountSuspended: { type: String },
      },
      notificationPreferences: {
        quizResults: { type: Boolean, default: true },
        systemAnnouncements: { type: Boolean, default: true },
      },
    },
    maintenance: {
      isEnabled: { type: Boolean, default: false },
      message: { type: String },
      scheduledTime: { type: Date },
    },
    branding: {
      logo: { type: String },
      primaryColor: { type: String, default: "#1976d2" },
      secondaryColor: { type: String, default: "#2c3e50" },
    },
    landingPage: {
      welcomeText: { type: String },
      features: [{ title: String, description: String }],
      testimonials: [
        {
          name: String,
          role: String,
          content: String,
        },
      ],
    },
  },
  { timestamps: true }
);

const SystemSettings = mongoose.model("SystemSettings", systemSettingsSchema);
export default SystemSettings;
