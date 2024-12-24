import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import QuizManagement from "../Admin/QuizManagement";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("quizzes");
  const [users, setUsers] = useState([]);
  const [pendingQuizzes, setPendingQuizzes] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [systemMessage, setSystemMessage] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  // Add logout handler
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  // Fetch pending quizzes
  const fetchPendingQuizzes = async () => {
    try {
      const res = await axios.get("/api/quiz/pending", {
        headers: { Authorization: localStorage.getItem("token") },
      });
      setPendingQuizzes(res.data);
    } catch (error) {
      console.error("Failed to fetch pending quizzes:", error.message);
    }
  };

  // Approve a quiz
  const approveQuiz = async (quizId) => {
    try {
      await axios.put(
        `/api/quiz/approve/${quizId}`,
        {},
        {
          headers: { Authorization: localStorage.getItem("token") },
        }
      );
      setMessage("Quiz approved successfully.");
      fetchPendingQuizzes();
    } catch (error) {
      console.error("Failed to approve quiz:", error.message);
    }
  };

  // Reject/Delete a quiz
  const deleteQuiz = async (quizId) => {
    try {
      await axios.delete(`/api/quiz/${quizId}`, {
        headers: { Authorization: localStorage.getItem("token") },
      });
      setMessage("Quiz deleted successfully.");
      fetchPendingQuizzes();
    } catch (error) {
      console.error("Failed to delete quiz:", error.message);
    }
  };

  // Add new API functions
  const fetchUsers = async () => {
    try {
      const res = await axios.get("/api/admin/users", {
        headers: { Authorization: localStorage.getItem("token") },
      });
      setUsers(res.data);
    } catch (error) {
      console.error("Failed to fetch users:", error.message);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const res = await axios.get("/api/admin/analytics", {
        headers: { Authorization: localStorage.getItem("token") },
      });
      setAnalytics(res.data);
    } catch (error) {
      console.error("Failed to fetch analytics:", error.message);
    }
  };

  const handleUserAction = async (userId, action) => {
    try {
      await axios.post(
        `/api/admin/users/${userId}/${action}`,
        {},
        {
          headers: { Authorization: localStorage.getItem("token") },
        }
      );
      fetchUsers();
      setMessage(`User ${action} successful`);
    } catch (error) {
      console.error(`Failed to ${action} user:`, error.message);
    }
  };

  const sendAnnouncement = async () => {
    try {
      await axios.post(
        "/api/admin/announcement",
        { message: systemMessage },
        { headers: { Authorization: localStorage.getItem("token") } }
      );
      setMessage("Announcement sent successfully");
      setSystemMessage("");
    } catch (error) {
      console.error("Failed to send announcement:", error.message);
    }
  };

  useEffect(() => {
    fetchPendingQuizzes();
    fetchUsers();
    fetchAnalytics();
  }, []);

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <nav className="dashboard-nav">
          <button
            className={`nav-btn ${activeTab === "quizzes" ? "active" : ""}`}
            onClick={() => setActiveTab("quizzes")}
          >
            Quizzes
          </button>
          <button
            className={`nav-btn ${activeTab === "users" ? "active" : ""}`}
            onClick={() => setActiveTab("users")}
          >
            Users
          </button>
          <button
            className={`nav-btn ${activeTab === "analytics" ? "active" : ""}`}
            onClick={() => setActiveTab("analytics")}
          >
            Analytics
          </button>
          <button
            className={`nav-btn ${
              activeTab === "announcements" ? "active" : ""
            }`}
            onClick={() => setActiveTab("announcements")}
          >
            Announcements
          </button>
          <button
            className={`nav-btn ${
              activeTab === "quiz-management" ? "active" : ""
            }`}
            onClick={() => setActiveTab("quiz-management")}
          >
            Quiz Management
          </button>
        </nav>
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>

      {message && <div className="message">{message}</div>}

      {activeTab === "quizzes" && (
        <div className="section">
          <h2>Pending Quizzes for Approval</h2>
          {pendingQuizzes.length === 0 ? (
            <div className="no-quizzes">
              No pending quizzes to review at this time.
            </div>
          ) : (
            <ul className="pending-quizzes">
              {pendingQuizzes.map((quiz) => (
                <li key={quiz._id} className="quiz-card">
                  <h3>{quiz.title}</h3>
                  <p>{quiz.description}</p>
                  <div className="quiz-actions">
                    <button
                      className="approve-btn"
                      onClick={() => approveQuiz(quiz._id)}
                    >
                      Approve
                    </button>
                    <button
                      className="reject-btn"
                      onClick={() => deleteQuiz(quiz._id)}
                    >
                      Reject
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {activeTab === "users" && (
        <div className="section">
          <h2>User Management</h2>
          <div className="users-grid">
            {users.map((user) => (
              <div key={user._id} className="user-card">
                <h3>{user.name}</h3>
                <p>Role: {user.role}</p>
                <p>Email: {user.email}</p>
                <div className="user-actions">
                  <button
                    className="suspend-btn"
                    onClick={() => handleUserAction(user._id, "suspend")}
                  >
                    {user.suspended ? "Activate" : "Suspend"}
                  </button>
                  <button
                    className="delete-btn"
                    onClick={() => handleUserAction(user._id, "delete")}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "analytics" && (
        <div className="section">
          <h2>System Analytics</h2>
          <div className="analytics-grid">
            <div className="analytics-card">
              <h3>Total Users</h3>
              <p>{analytics.totalUsers || 0}</p>
            </div>
            <div className="analytics-card">
              <h3>Total Quizzes</h3>
              <p>{analytics.totalQuizzes || 0}</p>
            </div>
            <div className="analytics-card">
              <h3>Average Score</h3>
              <p>{analytics.averageScore || 0}%</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === "announcements" && (
        <div className="section">
          <h2>System Announcements</h2>
          <div className="announcement-form">
            <textarea
              value={systemMessage}
              onChange={(e) => setSystemMessage(e.target.value)}
              placeholder="Type your announcement here..."
            />
            <button className="send-btn" onClick={sendAnnouncement}>
              Send Announcement
            </button>
          </div>
        </div>
      )}

      {activeTab === "quiz-management" && (
        <div className="section">
          <h2>Quiz Management</h2>
          <QuizManagement />
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
