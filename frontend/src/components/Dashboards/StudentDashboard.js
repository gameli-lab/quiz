import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { jsPDF } from "jspdf";

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

        const quizzesRes = await axios.get("/api/quiz/approved", {
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

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div>
      <button onClick={handleLogout}>Logout</button>
      {user && (
        <h1>
          {greeting}, {user.name}! It's{" "}
          {time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </h1>
      )}
      <div>
        <h2>Your Achievements</h2>
        <p>Badges: {getBadges()}</p>
      </div>
      <div>
        <h2>Your Progress</h2>
        <p>Progress: {calculateProgress()}%</p>
      </div>
      <div>
        <h2>Available Quizzes</h2>
        {Object.entries(quizzes).map(([subject, subjectQuizzes]) => (
          <div key={subject}>
            <h3>{subject}</h3>
            <ul>
              {subjectQuizzes.map((quiz) => (
                <li key={quiz._id}>
                  <p>{quiz.title}</p>
                  <p>Difficulty: {quiz.difficulty}</p>
                  <button onClick={() => handleStartQuiz(quiz._id)}>
                    Start Quiz
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div>
        <h2>Download Report</h2>
        <button onClick={handleDownloadReport}>Download Progress Report</button>
      </div>
    </div>
  );
};

export default StudentDashboard;
