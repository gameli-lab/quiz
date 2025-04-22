import User from "../models/User.js";
import UserSettings from "../models/UserSettings.js";
import bcrypt from "bcryptjs";
import fs from "fs/promises";
import path from "path";

export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update basic info
    if (req.body.name) user.name = req.body.name;
    if (req.body.email) user.email = req.body.email;
    if (req.body.bio) user.bio = req.body.bio;

    // Handle password update
    if (req.body.currentPassword && req.body.newPassword) {
      const isMatch = await bcrypt.compare(
        req.body.currentPassword,
        user.password
      );
      if (!isMatch) {
        return res
          .status(400)
          .json({ message: "Current password is incorrect" });
      }
      if (req.body.newPassword !== req.body.confirmPassword) {
        return res.status(400).json({ message: "New passwords do not match" });
      }
      user.password = await bcrypt.hash(req.body.newPassword, 10);
    }

    // Handle avatar upload
    if (req.file) {
      // Delete old avatar if it exists
      if (user.avatar && !user.avatar.includes("default-avatar")) {
        try {
          await fs.unlink(path.join("uploads/avatars", user.avatar));
        } catch (error) {
          console.error("Error deleting old avatar:", error);
        }
      }
      user.avatar = req.file.filename;
    }

    await user.save();

    // Remove sensitive data before sending response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({
      message: "Profile updated successfully",
      user: userResponse,
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Error updating profile" });
  }
};

export const getSettings = async (req, res) => {
  try {
    let settings = await UserSettings.findOne({ user: req.user.id });

    if (!settings) {
      // Create default settings if none exist
      settings = await UserSettings.create({
        user: req.user.id,
      });
    }

    res.json({ settings });
  } catch (error) {
    console.error("Error fetching settings:", error);
    res.status(500).json({ message: "Error fetching settings" });
  }
};

export const updateSettings = async (req, res) => {
  try {
    const { settings } = req.body;
    let userSettings = await UserSettings.findOne({ user: req.user.id });

    if (!userSettings) {
      userSettings = new UserSettings({
        user: req.user.id,
        ...settings,
      });
    } else {
      // Update existing settings
      Object.assign(userSettings, settings);
    }

    await userSettings.save();
    res.json({
      message: "Settings updated successfully",
      settings: userSettings,
    });
  } catch (error) {
    console.error("Error updating settings:", error);
    res.status(500).json({ message: "Error updating settings" });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
