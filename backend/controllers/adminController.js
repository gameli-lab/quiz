import User from "../models/User.js";
import { Quiz, CompletedQuiz } from "../models/Quiz.js";
import sendEmail from "../utils/email.js";

// User Management
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: { $ne: "admin" } })
      .select("-password")
      .sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.suspended = !user.suspended;
    await user.save();

    // Send email notification to user
    await sendEmail(
      user.email,
      `Account ${user.suspended ? "Suspended" : "Activated"}`,
      `Your account has been ${
        user.suspended ? "suspended" : "activated"
      } by an administrator.`
    );

    res.status(200).json({ message: "User status updated successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Delete user's quizzes and completed quizzes
    await Quiz.deleteMany({ uploader: user._id });
    await CompletedQuiz.deleteMany({ user: user._id });
    await user.remove();

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Analytics
export const getAnalytics = async (req, res) => {
  try {
    const analytics = {
      totalUsers: await User.countDocuments({ role: { $ne: "admin" } }),
      totalQuizzes: await Quiz.countDocuments({ approved: true }),
      pendingQuizzes: await Quiz.countDocuments({ approved: false }),
      totalCompletedQuizzes: await CompletedQuiz.countDocuments(),
      usersByRole: await User.aggregate([
        { $group: { _id: "$role", count: { $sum: 1 } } },
      ]),
      quizzesBySubject: await Quiz.aggregate([
        { $group: { _id: "$subject", count: { $sum: 1 } } },
      ]),
      averageScore: await CompletedQuiz.aggregate([
        { $group: { _id: null, avg: { $avg: "$score" } } },
      ]),
    };

    res.status(200).json(analytics);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const exportReport = async (req, res) => {
  try {
    const { type, startDate, endDate } = req.query;
    let data;

    switch (type) {
      case "users":
        data = await User.find({
          createdAt: { $gte: startDate, $lte: endDate },
        }).select("-password");
        break;
      case "quizzes":
        data = await Quiz.find({
          createdAt: { $gte: startDate, $lte: endDate },
        });
        break;
      case "performance":
        data = await CompletedQuiz.find({
          completedAt: { $gte: startDate, $lte: endDate },
        }).populate("user", "name email");
        break;
      default:
        return res.status(400).json({ message: "Invalid report type" });
    }

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// System Management
export const sendAnnouncement = async (req, res) => {
  try {
    const { message, targetRole } = req.body;

    let users;
    if (targetRole) {
      users = await User.find({ role: targetRole });
    } else {
      users = await User.find({ role: { $ne: "admin" } });
    }

    // Send announcement to all target users
    const emailPromises = users.map((user) =>
      sendEmail(user.email, "System Announcement", message)
    );
    await Promise.all(emailPromises);

    res.status(200).json({ message: "Announcement sent successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Quiz Management
export const bulkApproveQuizzes = async (req, res) => {
  try {
    const { quizIds, approved, feedback } = req.body;

    await Quiz.updateMany(
      { _id: { $in: quizIds } },
      {
        $set: {
          approved,
          feedback: feedback || "",
        },
      }
    );

    // Notify teachers about quiz approval status
    const quizzes = await Quiz.find({ _id: { $in: quizIds } }).populate(
      "uploader",
      "email"
    );

    const emailPromises = quizzes.map((quiz) =>
      sendEmail(
        quiz.uploader.email,
        `Quiz ${approved ? "Approved" : "Rejected"}`,
        `Your quiz "${quiz.title}" has been ${
          approved ? "approved" : "rejected"
        }.${feedback ? `\n\nFeedback: ${feedback}` : ""}`
      )
    );
    await Promise.all(emailPromises);

    res.status(200).json({ message: "Quizzes updated successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
