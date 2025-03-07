import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { jsPDF } from "jspdf";
import "./StudentDashboard.css";
import AssessmentIcon from "@mui/icons-material/Assessment";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import DownloadIcon from "@mui/icons-material/Download";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import SchoolIcon from "@mui/icons-material/School";

const StudentDashboard = () => {
  const [user, setUser] = useState(null);
  const [quizzes, setQuizzes] = useState({});
  const [completedQuizzes, setCompletedQuizzes] = useState([]);
  const [greeting, setGreeting] = useState("");
  const [time, setTime] = useState(new Date());
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const userRes = await axios.get("/api/users/me", {
          headers: { Authorization: localStorage.getItem("token") },
        });
        setUser(userRes.data);

        const quizzesRes = await axios.get("/api/quizzes/approved", {
          headers: { Authorization: localStorage.getItem("token") },
        });
        const groupedBySubject = groupQuizzesByCategory(
          quizzesRes.data,
          "subject"
        );
        setQuizzes(groupedBySubject);

        const completedRes = await axios.get("/api/quiz/completed", {
          headers: { Authorization: localStorage.getItem("token") },
        });
        setCompletedQuizzes(completedRes.data);
      } catch (error) {
        console.error("Error fetching data:", error.message);
      }
    };

    const hour = new Date().getHours();
    setGreeting(
      hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening"
    );
    const timer = setInterval(() => setTime(new Date()), 60000);
    fetchDashboardData();

    return () => clearInterval(timer);
  }, []);

  const groupQuizzesByCategory = (quizzes, category) => {
    return quizzes.reduce((grouped, quiz) => {
      const key = quiz[category];
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(quiz);
      return grouped;
    }, {});
  };

  const calculateProgress = () => {
    if (!Object.keys(quizzes).length) return 0;
    return (
      (completedQuizzes.length / Object.values(quizzes).flat().length) *
      100
    ).toFixed(2);
  };

  const getBadges = () => {
    const milestones = [
      { threshold: 1, label: "Beginner", badge: "🎖️" },
      { threshold: 5, label: "Intermediate", badge: "🏅" },
      { threshold: 10, label: "Advanced", badge: "🥇" },
    ];
    const currentMilestone = milestones
      .reverse()
      .find((milestone) => completedQuizzes.length >= milestone.threshold);
    return currentMilestone
      ? `${currentMilestone.badge} ${currentMilestone.label}`
      : "No badges earned yet.";
  };

  const handleDownloadReport = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Quiz Progress Report", 10, 10);
    doc.setFontSize(12);
    if (user) {
      doc.text(`Name: ${user.name}`, 10, 20);
      doc.text(`Email: ${user.email}`, 10, 30);
    }
    doc.text(`Completed Quizzes: ${completedQuizzes.length}`, 10, 40);
    doc.text(`Total Quizzes: ${Object.values(quizzes).flat().length}`, 10, 50);
    doc.text(`Progress: ${calculateProgress()}%`, 10, 60);
    doc.save("Quiz_Progress_Report.pdf");
  };

  const handleStartQuiz = (quizId) => navigate(`/quiz/${quizId}`);

  return (
    <div className="student-dashboard">
      <div className="dashboard-header">
        {user && (
          <div className="greeting">
            <h1>
              {greeting}, {user.name}!
            </h1>
            <p className="time">
              {time.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        )}
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card achievements">
          <div className="card-header">
            <EmojiEventsIcon />
            <h2>Your Achievements</h2>
          </div>
          <div className="badge-display">
            <p>{getBadges()}</p>
          </div>
        </div>

        <div className="dashboard-card progress">
          <div className="card-header">
            <AssessmentIcon />
            <h2>Your Progress</h2>
          </div>
          <div className="progress-display">
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${calculateProgress()}%` }}
              ></div>
            </div>
            <p>{calculateProgress()}% Complete</p>
          </div>
        </div>

        <div className="dashboard-card report">
          <div className="card-header">
            <DownloadIcon />
            <h2>Progress Report</h2>
          </div>
          <button className="download-btn" onClick={handleDownloadReport}>
            Download Report
          </button>
        </div>
      </div>

      <div className="quizzes-section">
        <div className="section-header">
          <SchoolIcon />
          <h2>Available Quizzes</h2>
        </div>
        <div className="subjects-grid">
          {Object.entries(quizzes).map(([subject, subjectQuizzes]) => (
            <div key={subject} className="subject-card">
              <h3>{subject}</h3>
              <div className="quiz-list">
                {subjectQuizzes.map((quiz) => (
                  <div key={quiz._id} className="quiz-item">
                    <div className="quiz-info">
                      <h4>{quiz.title}</h4>
                      <span
                        className={`difficulty ${quiz.difficulty.toLowerCase()}`}
                      >
                        {quiz.difficulty}
                      </span>
                    </div>
                    <button
                      className="start-quiz-btn"
                      onClick={() => handleStartQuiz(quiz._id)}
                    >
                      <PlayArrowIcon />
                      Start Quiz
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
