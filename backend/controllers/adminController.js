import User from "../models/User.js";
import Quiz from "../models/Quiz.js";
import CompletedQuiz from "../models/CompletedQuiz.js";
import sendEmail from "../utils/email.js";
import Announcement from "../models/Announcement.js";

// User Management
export const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    let filter = {};

    // Add search filter if provided
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: "i" } },
        { email: { $regex: req.query.search, $options: "i" } },
      ];
    }

    // Add role filter if provided
    if (req.query.role && req.query.role !== "") {
      filter.role = req.query.role;
    }

    // Add status filter if provided
    if (req.query.status && req.query.status !== "") {
      filter.suspended = req.query.status === "suspended";
    }

    // Debug log
    console.log("Filter:", filter);
    console.log("Skip:", skip);
    console.log("Limit:", limit);

    const [users, total] = await Promise.all([
      User.find(filter)
        .select("-password")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments(filter),
    ]);

    // Debug log
    console.log("Found users:", users.length);
    console.log("Total count:", total);

    res.status(200).json({
      users,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error in getAllUsers:", error);
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
    await User.deleteOne({ _id: user._id });

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
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
export const getAllQuizzes = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    let filter = {};

    // Add search filter if provided
    if (req.query.search) {
      filter.title = { $regex: req.query.search, $options: "i" };
    }

    // Add subject filter if provided
    if (req.query.subject) {
      filter.subject = req.query.subject;
    }

    // Add status filter if provided
    if (req.query.status) {
      filter.status = req.query.status;
    }

    const [quizzes, total] = await Promise.all([
      Quiz.find(filter)
        .populate("uploader", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Quiz.countDocuments(filter),
    ]);

    res.status(200).json({
      quizzes,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error in getAllQuizzes:", error);
    res.status(500).json({ message: error.message });
  }
};

export const updateQuizStatus = async (req, res) => {
  const { quizId, status } = req.params;
  try {
    const quiz = await Quiz.findById(quizId).populate("uploader", "email");

    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    quiz.status = status;
    await quiz.save();

    // Notify the quiz uploader about the status change
    if (quiz.uploader && quiz.uploader.email) {
      await sendEmail(
        quiz.uploader.email,
        `Quiz Status Updated`,
        `Your quiz "${quiz.title}" status has been updated to ${status}.`
      );
    } else {
      console.error("Uploader email not found for quiz:", quiz);
    }

    res.status(200).json({ message: "Quiz status updated successfully" });
  } catch (error) {
    console.error("Error updating quiz status:", error);
    res.status(500).json({ message: error.message });
  }
};

export const deleteQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.quizId);

    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    // Delete all completed quizzes associated with this quiz
    await CompletedQuiz.deleteMany({ quiz: quiz._id });

    // Delete the quiz itself using deleteOne instead of remove
    await Quiz.deleteOne({ _id: quiz._id });

    // Notify the quiz uploader about the deletion
    await sendEmail(
      quiz.uploader.email,
      "Quiz Deleted",
      `Your quiz "${quiz.title}" has been deleted by an administrator.`
    );

    res.status(200).json({ message: "Quiz deleted successfully" });
  } catch (error) {
    console.error("Error deleting quiz:", error);
    res.status(500).json({ message: error.message });
  }
};

// Dashboard Statistics
export const getDashboardStats = async (req, res) => {
  try {
    // Get user statistics
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });

    // Get quiz statistics
    const totalQuizzes = await Quiz.countDocuments();
    const activeQuizzes = await Quiz.countDocuments({ status: "active" });
    const quizSubmissions = await Quiz.aggregate([
      {
        $group: {
          _id: null,
          totalSubmissions: { $sum: "$submissions" },
          totalScores: { $sum: "$totalScore" },
        },
      },
    ]);

    const stats = {
      userStats: {
        total: totalUsers,
        active: activeUsers,
      },
      quizStats: {
        total: totalQuizzes,
        active: activeQuizzes,
        submissions: quizSubmissions[0]?.totalSubmissions || 0,
        averageScore: quizSubmissions[0]
          ? Math.round(
              (quizSubmissions[0].totalScores /
                quizSubmissions[0].totalSubmissions) *
                100
            ) / 100
          : 0,
      },
    };

    res.json(stats);
  } catch (error) {
    console.error("Error getting dashboard stats:", error);
    res.status(500).json({ message: "Error fetching dashboard statistics" });
  }
};

// Announcement Management
export const getAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find()
      .sort({ createdAt: -1 })
      .populate("createdBy", "name");
    res.json({ announcements });
  } catch (error) {
    console.error("Error getting announcements:", error);
    res.status(500).json({ message: "Error fetching announcements" });
  }
};

export const createAnnouncement = async (req, res) => {
  try {
    const { title, content } = req.body;
    const announcement = new Announcement({
      title,
      content,
      createdBy: req.user._id,
    });
    await announcement.save();
    res
      .status(201)
      .json({ message: "Announcement created successfully", announcement });
  } catch (error) {
    console.error("Error creating announcement:", error);
    res.status(500).json({ message: "Error creating announcement" });
  }
};

export const deleteAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({ message: "Announcement not found" });
    }
    // Use deleteOne instead of remove
    await Announcement.deleteOne({ _id: announcement._id });
    res.json({ message: "Announcement deleted successfully" });
  } catch (error) {
    console.error("Error deleting announcement:", error);
    res.status(500).json({ message: "Error deleting announcement" });
  }
};

export const getRecentAnnouncements = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5; // Default to 5 recent announcements
    const announcements = await Announcement.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate("createdBy", "name");
    res.json({ announcements });
  } catch (error) {
    console.error("Error getting recent announcements:", error);
    res.status(500).json({ message: "Error fetching recent announcements" });
  }
};
