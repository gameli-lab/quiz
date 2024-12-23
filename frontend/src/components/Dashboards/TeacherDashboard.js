import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const TeacherDashboard = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [newQuiz, setNewQuiz] = useState({
    subject: "",
    description: "",
    questions: [],
  });
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const fetchQuizzes = async () => {
    try {
      const res = await axios.get("/api/quiz/approved", {
        headers: { Authorization: localStorage.getItem("token") },
      });
      setQuizzes(res.data);
    } catch (err) {
      console.log("Failed to fetch quizzes", err.message);
    }
  };

  const uploadQuiz = async () => {
    try {
      await axios.post("/api/quiz/upload", newQuiz, {
        headers: {
          Authorization: localStorage.getItem("token"),
        },
      });
      alert("Quiz uploaded successfully!");
    } catch (err) {
      console.log("Failed to upload quiz", err.message);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, []);

  return (
    <div>
      <button onClick={handleLogout}>Logout</button>
      <h1>TeacherDashboard</h1>
      <h2>Your Quizzes</h2>
      <ul>
        {quizzes.map((quiz) => (
          <li key={quiz._id}>{quiz.subject}</li>
        ))}
      </ul>

      <h2>Upload New Quiz</h2>
      <input
        type="text"
        placeholder="Quiz Description"
        value={newQuiz.description}
        onChange={(e) =>
          setNewQuiz({ ...newQuiz, description: e.target.value })
        }
      />
      <textarea
        placeholder="Quiz Description"
        value={newQuiz.description}
        onChange={(e) => {
          setNewQuiz({ ...newQuiz, description: e.target.value });
        }}
      ></textarea>
      <button onClick={uploadQuiz}>Upload</button>
    </div>
  );
};

export default TeacherDashboard;
