import SystemSettings from "../models/SystemSettings.js";
import ActivityLog from "../models/ActivityLog.js";
import { BackupService } from "../services/backupService.js";
import User from "../models/User.js";
import Quiz from "../models/Quiz.js";
import CompletedQuiz from "../models/CompletedQuiz.js";

const backupService = new BackupService();

export const getSystemSettings = async (req, res) => {
  try {
    const settings = await SystemSettings.findOne();
    res.status(200).json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateSystemSettings = async (req, res) => {
  try {
    const settings = await SystemSettings.findOneAndUpdate(
      {},
      { $set: req.body },
      { new: true, upsert: true }
    );
    res.status(200).json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getActivityLogs = async (req, res) => {
  try {
    const { startDate, endDate, action, userId } = req.query;
    let query = {};

    if (startDate && endDate) {
      query.timestamp = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }
    if (action) query.action = action;
    if (userId) query.user = userId;

    const logs = await ActivityLog.find(query)
      .populate("user", "name email")
      .sort({ timestamp: -1 })
      .limit(100);

    res.status(200).json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getSystemAnalytics = async (req, res) => {
  try {
    const [
      totalUsers,
      activeUsers,
      totalQuizzes,
      completedQuizzes,
      usersByRole,
      quizzesBySubject,
      averageScore,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({
        lastActivity: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      }),
      Quiz.countDocuments(),
      CompletedQuiz.countDocuments(),
      User.aggregate([{ $group: { _id: "$role", count: { $sum: 1 } } }]),
      Quiz.aggregate([{ $group: { _id: "$subject", count: { $sum: 1 } } }]),
      CompletedQuiz.aggregate([
        { $group: { _id: null, avg: { $avg: "$score" } } },
      ]),
    ]);

    res.status(200).json({
      totalUsers,
      activeUsers,
      totalQuizzes,
      completedQuizzes,
      usersByRole,
      quizzesBySubject,
      averageScore: averageScore[0]?.avg || 0,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createBackup = async (req, res) => {
  try {
    const backupPath = await backupService.createBackup();
    res.status(200).json({
      message: "Backup created successfully",
      path: backupPath,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const restoreBackup = async (req, res) => {
  try {
    const { filepath } = req.body;
    await backupService.restoreBackup(filepath);
    res.status(200).json({ message: "Backup restored successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getBackups = async (req, res) => {
  try {
    const backups = await backupService.listBackups();
    res.status(200).json(backups);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
