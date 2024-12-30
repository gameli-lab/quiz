import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Admin.css";

const AdminAnnouncements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: "",
    content: "",
  });

  const fetchAnnouncements = async () => {
    try {
      const response = await axios.get("/api/admin/announcements", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setAnnouncements(response.data.announcements || []);
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch announcements");
      setLoading(false);
      console.error("Error fetching announcements:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("/api/admin/announcements", newAnnouncement, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setMessage("Announcement created successfully");
      setNewAnnouncement({ title: "", content: "" });
      fetchAnnouncements(); // Refresh announcements list
    } catch (err) {
      setError("Failed to create announcement");
      console.error("Error creating announcement:", err);
    }
  };

  const handleDelete = async (announcementId) => {
    try {
      await axios.delete(`/api/admin/announcements/${announcementId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setMessage("Announcement deleted successfully");
      fetchAnnouncements(); // Refresh announcements list
    } catch (err) {
      setError("Failed to delete announcement");
      console.error("Error deleting announcement:", err);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  if (loading) return <div className="loading">Loading announcements...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="admin-container">
      <h1>Announcements</h1>
      {message && <div className="success-message">{message}</div>}
      <div className="admin-content">
        <div className="admin-card">
          <h2>Create Announcement</h2>
          <form className="announcement-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <input
                type="text"
                placeholder="Announcement Title"
                className="form-control"
                value={newAnnouncement.title}
                onChange={(e) =>
                  setNewAnnouncement({
                    ...newAnnouncement,
                    title: e.target.value,
                  })
                }
                required
              />
            </div>
            <div className="form-group">
              <textarea
                placeholder="Announcement Content"
                className="form-control"
                rows="4"
                value={newAnnouncement.content}
                onChange={(e) =>
                  setNewAnnouncement({
                    ...newAnnouncement,
                    content: e.target.value,
                  })
                }
                required
              ></textarea>
            </div>
            <button type="submit" className="btn btn-primary">
              Post Announcement
            </button>
          </form>
        </div>

        <div className="admin-card">
          <h2>Recent Announcements</h2>
          <div className="announcements-list">
            {announcements.length === 0 ? (
              <p>No announcements yet</p>
            ) : (
              announcements.map((announcement) => (
                <div key={announcement._id} className="announcement-card">
                  <div className="announcement-header">
                    <h3>{announcement.title}</h3>
                    <button
                      onClick={() => handleDelete(announcement._id)}
                      className="btn btn-danger btn-sm"
                    >
                      Delete
                    </button>
                  </div>
                  <p>{announcement.content}</p>
                  <span className="announcement-date">
                    {new Date(announcement.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnnouncements;
