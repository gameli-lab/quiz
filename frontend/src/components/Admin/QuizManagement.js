import React from "react";
import "./Admin.css";

const QuizManagement = () => {
  return (
    <div className="admin-container">
      <h1>Quiz Management</h1>
      <div className="admin-content">
        <div className="admin-card">
          <h2>Create Quiz</h2>
          <form className="quiz-form">
            <div className="form-group">
              <input
                type="text"
                placeholder="Quiz Title"
                className="form-control"
              />
            </div>
            <div className="form-group">
              <textarea
                placeholder="Quiz Description"
                className="form-control"
                rows="3"
              ></textarea>
            </div>
            <div className="form-group">
              <select className="form-control">
                <option value="">Select Category</option>
                <option value="math">Mathematics</option>
                <option value="science">Science</option>
                <option value="history">History</option>
                <option value="literature">Literature</option>
              </select>
            </div>
            <button type="submit" className="btn btn-primary">
              Create Quiz
            </button>
          </form>
        </div>

        <div className="admin-card">
          <h2>Quiz Categories</h2>
          <div className="categories-grid">
            <div className="category-card">
              <h3>Mathematics</h3>
              <p>15 Quizzes</p>
            </div>
            <div className="category-card">
              <h3>Science</h3>
              <p>12 Quizzes</p>
            </div>
            <div className="category-card">
              <h3>History</h3>
              <p>8 Quizzes</p>
            </div>
            <div className="category-card">
              <h3>Literature</h3>
              <p>10 Quizzes</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizManagement;
