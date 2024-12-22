import React, { useState, useEffect } from "react";
import axios from "axios";

const AdminDashboard = () => {
  const [pendingQuizzes, setPendingQuizzes] = useState([]);
  const [message, setMessage] = useState("");

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
      await axios.put(`/api/quiz/approve/${quizId}`, {}, {
        headers: { Authorization: localStorage.getItem("token") },
      });
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

  useEffect(() => {
    fetchPendingQuizzes();
  }, []);

  return (
    <div>
      <h1>Admin Dashboard</h1>
      {message && <p>{message}</p>}
      <h2>Pending Quizzes for Approval</h2>
      <ul>
        {pendingQuizzes.map((quiz) => (
          <li key={quiz._id}>
            <h3>{quiz.title}</h3>
            <p>{quiz.description}</p>
            <button onClick={() => approveQuiz(quiz._id)}>Approve</button>
            <button onClick={() => deleteQuiz(quiz._id)}>Reject</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminDashboard;
