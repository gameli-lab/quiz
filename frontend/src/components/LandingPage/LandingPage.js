import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "./LandingPage.css";

const LandingPage = () => {
  const [activeUsers, setActiveUsers] = useState(0);
  const [quizzesCreated, setQuizzesCreated] = useState(0);

  const fetchActiveUsers = async () => {
    try {
      const response = await axios.get("/api/admin/analytics", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setActiveUsers(response.data.activeUsers);
    } catch (error) {
      console.error("Error fetching active users:", error);
    }
  };

  const fetchQuizzesCreated = async () => {
    try {
      const response = await axios.get("/api/admin/analytics", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setQuizzesCreated(response.data.totalQuizzes);
    } catch (error) {
      console.error("Error fetching quizzes created:", error);
    }
  };

  useEffect(() => {
    fetchActiveUsers();
    fetchQuizzesCreated();
  }, []);

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1 className="animate-fade-in">Welcome to QuizMaster</h1>
          <p className="animate-fade-in-delay-1">
            Transform your learning experience with interactive quizzes and
            real-time assessment
          </p>
          <div className="hero-buttons animate-fade-in-delay-2">
            <Link to="/register" className="btn btn-primary">
              Get Started
            </Link>
            <Link to="/about" className="btn btn-secondary">
              Learn More
            </Link>
          </div>
        </div>
        <div className="hero-image animate-fade-in-delay-1">
          {/* Add your hero image here */}
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <h2 className="section-title">Why Choose QuizMaster?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">📚</div>
            <h3>Interactive Learning</h3>
            <p>
              Engage with dynamic quizzes that make learning fun and effective
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Real-time Progress</h3>
            <p>Track your performance with detailed analytics and insights</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🎯</div>
            <h3>Personalized Experience</h3>
            <p>Adaptive learning paths tailored to your needs</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🤝</div>
            <h3>Collaborative Learning</h3>
            <p>Connect with peers and share knowledge</p>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="cta">
        <div className="cta-content">
          <h2>Ready to Start Learning?</h2>
          <p>
            Join thousands of students and teachers who are already using
            QuizMaster
          </p>
          <div className="cta-buttons">
            <Link to="/register" className="btn btn-primary">
              Create Account
            </Link>
            <Link to="/login" className="btn btn-secondary">
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="statistics">
        <div className="stat-card">
          <h3>{activeUsers}</h3>
          <p>Active Users</p>
        </div>
        <div className="stat-card">
          <h3>{quizzesCreated}</h3>
          <p>Quizzes Created</p>
        </div>
        <div className="stat-card">
          <h3> </h3>
          <p>Satisfaction Rate</p>
        </div>
        <div className="stat-card">
          <h3>24/7</h3>
          <p>Support</p>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
