import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Admin.css";

const AdminAnalytics = () => {
  const [analytics, setAnalytics] = useState({
    totalUsers: 0,
    activeQuizzes: 0,
    quizzesTaken: 0,
    averageScore: 0,
    totalSubmissions: 0,
    activeUsers: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        // Get all analytics in one call
        const response = await axios.get(
          "https://quiz-master-2hwm.onrender.com/api/admin/dashboard/stats",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        setAnalytics({
          totalUsers: response.data.userStats.total || 0,
          activeUsers: response.data.userStats.active || 0,
          activeQuizzes: response.data.quizStats.active || 0,
          quizzesTaken: response.data.quizStats.taken || 0,
          totalSubmissions: response.data.quizStats.submissions || 0,
          averageScore: response.data.quizStats.averageScore || 0,
        });
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch analytics data");
        setLoading(false);
        console.error("Error fetching analytics:", err);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) return <div className="loading">Loading analytics...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="admin-container">
      <h1>Analytics Dashboard</h1>
      <div className="admin-content">
        <div className="admin-card">
          <h2>Overview</h2>
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
              <h3>Active Quizzes</h3>
              <p className="analytics-number">{analytics.activeQuizzes}</p>
            </div>
            <div className="analytics-card">
              <h3>Quizzes Taken</h3>
              <p className="analytics-number">{analytics.quizzesTaken}</p>
            </div>
            <div className="analytics-card">
              <h3>Total Submissions</h3>
              <p className="analytics-number">{analytics.totalSubmissions}</p>
            </div>
            <div className="analytics-card">
              <h3>Average Score</h3>
              <p className="analytics-number">{analytics.averageScore}%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
