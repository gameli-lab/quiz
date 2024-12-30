import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState({
    totalUsers: 0,
    totalQuizzes: 0,
    pendingQuizzes: 0,
    activeUsers: 0,
    averageScore: 0,
    totalSubmissions: 0,
  });
  const [recentAnnouncements, setRecentAnnouncements] = useState([]);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const fetchDashboardData = async () => {
    try {
      const [analyticsRes, announcementsRes] = await Promise.all([
        axios.get("/api/admin/analytics", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }),
        axios.get("/api/admin/announcements/recent", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }),
      ]);

      setAnalytics(analyticsRes.data);
      setRecentAnnouncements(announcementsRes.data.announcements || []);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error.message);
      setMessage("Failed to load dashboard data");
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
      </div>

      {message && <div className="message">{message}</div>}

      <div className="dashboard-summary">
        <div className="summary-section">
          <h2>System Overview</h2>
          <div className="analytics-grid">
            <div className="analytics-card">
              <h3>Total Users</h3>
              <p className="analytics-number">{analytics.totalUsers}</p>
            </div>
            <div className="analytics-card">
              <h3>Active Users</h3>
              <p className="analytics-number">{analytics.activeUsers}</p>
            </div>
            <div className="analytics-card">
              <h3>Total Quizzes</h3>
              <p className="analytics-number">{analytics.totalQuizzes}</p>
            </div>
            <div className="analytics-card">
              <h3>Pending Quizzes</h3>
              <p className="analytics-number">{analytics.pendingQuizzes}</p>
            </div>
            <div className="analytics-card">
              <h3>Quiz Submissions</h3>
              <p className="analytics-number">{analytics.totalSubmissions}</p>
            </div>
            <div className="analytics-card">
              <h3>Average Score</h3>
              <p className="analytics-number">{analytics.averageScore}%</p>
            </div>
          </div>
        </div>

        <div className="summary-section">
          <h2>Recent Announcements</h2>
          <div className="announcements-list">
            {recentAnnouncements.length === 0 ? (
              <p>No recent announcements</p>
            ) : (
              recentAnnouncements.map((announcement) => (
                <div key={announcement._id} className="announcement-card">
                  <h3>{announcement.title}</h3>
                  <p>{announcement.content}</p>
                  <span className="announcement-date">
                    {new Date(announcement.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="summary-section">
          <h2>Quick Actions</h2>
          <div className="quick-actions">
            <button
              onClick={() => navigate("/admin/quizzes")}
              className="action-btn"
            >
              Manage Quizzes
            </button>
            <button
              onClick={() => navigate("/admin/users")}
              className="action-btn"
            >
              Manage Users
            </button>
            <button
              onClick={() => navigate("/admin/announcements")}
              className="action-btn"
            >
              Create Announcement
            </button>
            <button
              onClick={() => navigate("/admin/analytics")}
              className="action-btn"
            >
              View Analytics
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
