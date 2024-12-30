import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthContext";
import "./Footer.css";

const Footer = () => {
  const { isAuthenticated, userRole } = useContext(AuthContext);

  const getDashboardLink = () => {
    switch (userRole) {
      case "student":
        return "/student/dashboard";
      case "teacher":
        return "/teacher/dashboard";
      case "admin":
        return "/admin/dashboard";
      default:
        return "/";
    }
  };

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>QuizMaster</h3>
          <p>
            Empowering education through interactive learning and assessment.
          </p>
        </div>

        <div className="footer-section">
          <h4>Quick Links</h4>
          <ul>
            {!isAuthenticated ? (
              <>
                <li>
                  <Link to="/">Home</Link>
                </li>
                <li>
                  <Link to="/about">About</Link>
                </li>
                <li>
                  <Link to="/contact">Contact</Link>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link to={getDashboardLink()}>Dashboard</Link>
                </li>
                <li>
                  <Link to={`${getDashboardLink()}/profile`}>Profile</Link>
                </li>
                <li>
                  <Link to={`${getDashboardLink()}/settings`}>Settings</Link>
                </li>
              </>
            )}
          </ul>
        </div>

        {!isAuthenticated && (
          <div className="footer-section">
            <h4>For Teachers</h4>
            <ul>
              <li>
                <Link to="/register">Create Account</Link>
              </li>
              <li>
                <Link to="/features">Features</Link>
              </li>
              <li>
                <Link to="/pricing">Pricing</Link>
              </li>
              <li>
                <Link to="/resources">Resources</Link>
              </li>
            </ul>
          </div>
        )}

        <div className="footer-section">
          <h4>Contact Us</h4>
          <ul>
            <li>Email: support@quizmaster.com</li>
            <li>Phone: (555) 123-4567</li>
            <li>Address: 123 Education St</li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>
          &copy; {new Date().getFullYear()} QuizMaster. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
