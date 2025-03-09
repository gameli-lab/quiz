import Announcement from "../models/Announcement.js";

export const getAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find()
      .sort({ createdAt: -1 })
      .limit(5) // Get 5 most recent announcements
      .populate("createdBy", "name");

    res.status(200).json({ announcements });
  } catch (error) {
    console.error("Error getting announcements:", error);
    res.status(500).json({ message: "Error fetching announcements" });
  }
};
