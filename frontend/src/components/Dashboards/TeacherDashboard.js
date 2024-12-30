import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./TeacherDashboard.css";
import QuizIcon from "@mui/icons-material/Quiz";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AssessmentIcon from "@mui/icons-material/Assessment";
import PersonIcon from "@mui/icons-material/Person";

const TeacherDashboard = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [stats, setStats] = useState({
    totalQuizzes: 0,
    totalStudents: 0,
    averageScore: 0,
    completionRate: 0,
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [quizzesRes, statsRes] = await Promise.all([
        axios.get("/api/quiz/teacher", {
          headers: { Authorization: localStorage.getItem("token") },
        }),
        axios.get("/api/teacher/stats", {
          headers: { Authorization: localStorage.getItem("token") },
        }),
      ]);
      setQuizzes(quizzesRes.data);
      setStats(statsRes.data);
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err.message);
    }
  };

  const handleCreateQuiz = () => {
    navigate("/teacher/create-quiz");
  };

  const handleEditQuiz = (quizId) => {
    navigate(`/teacher/edit-quiz/${quizId}`);
  };

  const handleDeleteQuiz = async (quizId) => {
    if (window.confirm("Are you sure you want to delete this quiz?")) {
      try {
        await axios.delete(`/api/quiz/${quizId}`, {
          headers: { Authorization: localStorage.getItem("token") },
        });
        fetchDashboardData();
      } catch (err) {
        console.error("Failed to delete quiz:", err.message);
      }
    }
  };

  const handleViewResults = (quizId) => {
    navigate(`/teacher/quiz-results/${quizId}`);
  };

  return (
    <div className="teacher-dashboard">
      <div className="dashboard-header">
        <h1>Teacher Dashboard</h1>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <QuizIcon />
          <div className="stat-content">
            <h3>Total Quizzes</h3>
            <p>{stats.totalQuizzes}</p>
          </div>
        </div>
        <div className="stat-card">
          <PersonIcon />
          <div className="stat-content">
            <h3>Total Students</h3>
            <p>{stats.totalStudents}</p>
          </div>
        </div>
        <div className="stat-card">
          <AssessmentIcon />
          <div className="stat-content">
            <h3>Average Score</h3>
            <p>{stats.averageScore}%</p>
          </div>
        </div>
        <div className="stat-card">
          <QuizIcon />
          <div className="stat-content">
            <h3>Completion Rate</h3>
            <p>{stats.completionRate}%</p>
          </div>
        </div>
      </div>

      <div className="actions-section">
        <button className="create-quiz-btn" onClick={handleCreateQuiz}>
          <AddCircleIcon />
          Create New Quiz
        </button>
      </div>

      <div className="quizzes-section">
        <div className="section-header">
          <QuizIcon />
          <h2>Your Quizzes</h2>
        </div>
        <div className="quizzes-grid">
          {quizzes.map((quiz) => (
            <div key={quiz._id} className="quiz-card">
              <div className="quiz-card-header">
                <h3>{quiz.title}</h3>
                <span className={`status ${quiz.status.toLowerCase()}`}>
                  {quiz.status}
                </span>
              </div>
              <p className="quiz-description">{quiz.description}</p>
              <div className="quiz-meta">
                <span>Questions: {quiz.questions?.length || 0}</span>
                <span>Subject: {quiz.subject}</span>
              </div>
              <div className="quiz-actions">
                <button
                  className="action-btn edit"
                  onClick={() => handleEditQuiz(quiz._id)}
                >
                  <EditIcon />
                  Edit
                </button>
                <button
                  className="action-btn results"
                  onClick={() => handleViewResults(quiz._id)}
                >
                  <AssessmentIcon />
                  Results
                </button>
                <button
                  className="action-btn delete"
                  onClick={() => handleDeleteQuiz(quiz._id)}
                >
                  <DeleteIcon />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
