import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { jsPDF } from "jspdf";
import "./StudentDashboard.css";
import AssessmentIcon from "@mui/icons-material/Assessment";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import DownloadIcon from "@mui/icons-material/Download";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
// import SchoolIcon from "@mui/icons-material/School";
import AnnouncementIcon from "@mui/icons-material/Announcement";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import NewReleasesIcon from "@mui/icons-material/NewReleases";

const StudentDashboard = () => {
  const [user, setUser] = useState(null);
  const [quizzes, setQuizzes] = useState({});
  const [completedQuizzes, setCompletedQuizzes] = useState([]);
  const [pendingQuizzes, setPendingQuizzes] = useState({});
  const [greeting, setGreeting] = useState("");
  const [time, setTime] = useState(new Date());
  const [announcements, setAnnouncements] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [userRes, quizzesRes, completedRes, announcementsRes] =
          await Promise.all([
            axios.get("/api/users/me", {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }),
            axios.get("/api/quizzes/approved", {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }),
            axios.get("/api/quizzes/completed", {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }),
            // Add this new request for announcements
            axios.get("/api/quizzes/announcements", {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }),
          ]);

        setUser(userRes.data);

        // Get array of completed quiz IDs
        const completedQuizIds = completedRes.data.map((item) => item.quiz._id);

        // Separate approved quizzes into completed and pending
        const allApprovedQuizzes = quizzesRes.data;
        const pendingQuizzes = allApprovedQuizzes.filter(
          (quiz) => !completedQuizIds.includes(quiz._id)
        );

        // Group by subject
        const groupedCompleted = groupQuizzesByCategory(
          allApprovedQuizzes.filter((quiz) =>
            completedQuizIds.includes(quiz._id)
          ),
          "subject"
        );
        const groupedPending = groupQuizzesByCategory(
          pendingQuizzes,
          "subject"
        );

        setQuizzes(groupedCompleted);
        setPendingQuizzes(groupedPending);
        setCompletedQuizzes(completedRes.data);
        setAnnouncements(announcementsRes.data.announcements || []);
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
          <NewReleasesIcon />
          <h2>Pending Quizzes</h2>
        </div>
        {Object.keys(pendingQuizzes).length === 0 ? (
          <p>
            No pending quizzes available. Great job on completing everything!
          </p>
        ) : (
          <div className="subjects-grid">
            {Object.entries(pendingQuizzes).map(([subject, subjectQuizzes]) => (
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
        )}
      </div>

      <div className="quizzes-section">
        <div className="section-header">
          <CheckCircleIcon />
          <h2>Completed Quizzes</h2>
        </div>
        {Object.keys(quizzes).length === 0 ? (
          <p>
            You haven't completed any quizzes yet. Start with the pending
            quizzes above!
          </p>
        ) : (
          <div className="subjects-grid">
            {Object.entries(quizzes).map(([subject, subjectQuizzes]) => (
              <div key={subject} className="subject-card">
                <h3>{subject}</h3>
                <div className="quiz-list">
                  {subjectQuizzes.map((quiz) => (
                    <div key={quiz._id} className="quiz-item completed-quiz">
                      <div className="quiz-info">
                        <h4>{quiz.title}</h4>
                        <span
                          className={`difficulty ${quiz.difficulty.toLowerCase()}`}
                        >
                          {quiz.difficulty}
                        </span>
                        {/* Find the score for this completed quiz */}
                        {completedQuizzes.find(
                          (cq) => cq.quiz._id === quiz._id
                        ) && (
                          <span className="score-badge">
                            Score:{" "}
                            {
                              completedQuizzes.find(
                                (cq) => cq.quiz._id === quiz._id
                              ).score
                            }
                            %
                          </span>
                        )}
                      </div>
                      <button
                        className="retake-quiz-btn"
                        onClick={() => handleStartQuiz(quiz._id)}
                      >
                        <PlayArrowIcon />
                        Retake
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="announcements-section">
        <div className="section-header">
          <AnnouncementIcon />
          <h2>Announcements</h2>
        </div>
        <div className="announcements-list">
          {announcements.length === 0 ? (
            <p>No announcements at this time</p>
          ) : (
            announcements.map((announcement) => (
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
    </div>
  );
};

export default StudentDashboard;
