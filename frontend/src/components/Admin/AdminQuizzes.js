import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Admin.css";

const AdminQuizzes = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const fetchQuizzes = async () => {
    try {
      const response = await axios.get("/api/admin/quizzes", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setQuizzes(response.data.quizzes);
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch quizzes");
      setLoading(false);
      console.error("Error fetching quizzes:", err);
    }
  };

  const handleQuizAction = async (quizId, action) => {
    try {
      if (action === "delete") {
        await axios.delete(`/api/admin/quizzes/${quizId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
      } else {
        await axios.post(
          `/api/admin/quizzes/${quizId}/${action}`,
          {},
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
      }
      setMessage(`Quiz ${action} successful`);
      fetchQuizzes(); // Refresh quiz list
    } catch (err) {
      setError(`Failed to ${action} quiz`);
      console.error(`Error ${action} quiz:`, err);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, []);

  if (loading) return <div className="loading">Loading quizzes...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="admin-container">
      <h1>Quiz Management</h1>
      {message && <div className="success-message">{message}</div>}
      <div className="admin-content">
        <div className="admin-card">
          <h2>All Quizzes</h2>
          <div className="quizzes-grid">
            {quizzes.map((quiz) => (
              <div key={quiz._id} className="quiz-card">
                <div className="quiz-info">
                  <h3>{quiz.title}</h3>
                  <p>{quiz.description}</p>
                  <div className="quiz-details">
                    <span>Subject: {quiz.subject}</span>
                    <span>Difficulty: {quiz.difficulty}</span>
                    <span>Status: {quiz.status}</span>
                  </div>
                </div>
                <div className="quiz-actions">
                  {quiz.status === "pending" && (
                    <button
                      onClick={() => handleQuizAction(quiz._id, "approve")}
                      className="btn btn-success"
                    >
                      Approve
                    </button>
                  )}
                  <button
                    onClick={() =>
                      handleQuizAction(
                        quiz._id,
                        quiz.active ? "deactivate" : "activate"
                      )
                    }
                    className={`btn ${
                      quiz.active ? "btn-warning" : "btn-success"
                    }`}
                  >
                    {quiz.active ? "Deactivate" : "Activate"}
                  </button>
                  <button
                    onClick={() => handleQuizAction(quiz._id, "delete")}
                    className="btn btn-danger"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminQuizzes;
