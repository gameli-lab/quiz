import React from "react";
import { Link } from "react-router-dom";
import "./LandingPage.css"; // Add custom styles for a polished look

const LandingPage = () => {
  return (
    <div className="landing-page">
      <header className="header">
        <h1>QuizMaster</h1>
        <p>Your gateway to fun and interactive learning!</p>
        <div className="cta-buttons">
          <Link to="/login" className="btn btn-primary">Login</Link>
          <Link to="/register" className="btn btn-secondary">Register</Link>
        </div>
      </header>
      <section className="features">
        <h2>Why QuizMaster?</h2>
        <div className="feature-list">
          <div className="feature">
            <h3>For Students</h3>
            <p>Track progress, take quizzes, and boost your knowledge!</p>
          </div>
          <div className="feature">
            <h3>For Teachers</h3>
            <p>Create and manage quizzes effortlessly. Engage your students.</p>
          </div>
          <div className="feature">
            <h3>For Admins</h3>
            <p>Oversee the system, approve content, and ensure quality.</p>
          </div>
        </div>
      </section>
      <footer className="footer">
        <p>&copy; 2024 QuizMaster. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
