import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthContext";
import "./Header.css";
// Import Material UI icons
import QuizIcon from "@mui/icons-material/Quiz";
import PeopleIcon from "@mui/icons-material/People";
import AnalyticsIcon from "@mui/icons-material/Analytics";
import AnnouncementIcon from "@mui/icons-material/Announcement";
import SettingsIcon from "@mui/icons-material/Settings";
import PersonIcon from "@mui/icons-material/Person";
import HomeIcon from "@mui/icons-material/Home";
import InfoIcon from "@mui/icons-material/Info";
import ContactMailIcon from "@mui/icons-material/ContactMail";
import LogoutIcon from "@mui/icons-material/Logout";
import LoginIcon from "@mui/icons-material/Login";
import HowToRegIcon from "@mui/icons-material/HowToReg";
import AssessmentIcon from "@mui/icons-material/Assessment";
import AddCircleIcon from "@mui/icons-material/AddCircle";

const Header = () => {
  const { isAuthenticated, userRole, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const getDashboardPath = () => {
    if (!isAuthenticated) return "/";
    switch (userRole) {
      case "admin":
        return "/admin/dashboard";
      case "teacher":
        return "/teacher/dashboard";
      case "student":
        return "/student/dashboard";
      default:
        return "/";
    }
  };

  const renderAdminNav = () => (
    <>
      <Link to="/admin/quizzes" className="nav-link">
        <QuizIcon className="nav-icon" />
        <span className="nav-text">Quizzes</span>
      </Link>
      <Link to="/admin/users" className="nav-link">
        <PeopleIcon className="nav-icon" />
        <span className="nav-text">Users</span>
      </Link>
      <Link to="/admin/analytics" className="nav-link">
        <AnalyticsIcon className="nav-icon" />
        <span className="nav-text">Analytics</span>
      </Link>
      <Link to="/admin/announcements" className="nav-link">
        <AnnouncementIcon className="nav-icon" />
        <span className="nav-text">Announcements</span>
      </Link>
      <Link to="/admin/quiz-management" className="nav-link">
        <SettingsIcon className="nav-icon" />
        <span className="nav-text">Quiz Management</span>
      </Link>
    </>
  );

  const renderTeacherNav = () => (
    <>
      <Link to="/teacher/quizzes" className="nav-link">
        <QuizIcon className="nav-icon" />
        <span className="nav-text">My Quizzes</span>
      </Link>
      <Link to="/teacher/create-quiz" className="nav-link">
        <AddCircleIcon className="nav-icon" />
        <span className="nav-text">Create Quiz</span>
      </Link>
      <Link to="/teacher/results" className="nav-link">
        <AssessmentIcon className="nav-icon" />
        <span className="nav-text">Results</span>
      </Link>
    </>
  );

  const renderStudentNav = () => (
    <>
      <Link to="/student/quizzes" className="nav-link">
        <QuizIcon className="nav-icon" />
        <span className="nav-text">Available Quizzes</span>
      </Link>
      <Link to="/student/results" className="nav-link">
        <AssessmentIcon className="nav-icon" />
        <span className="nav-text">My Results</span>
      </Link>
    </>
  );

  const renderAuthenticatedNav = () => {
    switch (userRole) {
      case "admin":
        return renderAdminNav();
      case "teacher":
        return renderTeacherNav();
      case "student":
        return renderStudentNav();
      default:
        return null;
    }
  };

  return (
    <header className="header">
      <div className="header-content">
        <Link to={getDashboardPath()} className="logo">
          QuizMaster
        </Link>
        <nav className="nav-links">
          {!isAuthenticated ? (
            <>
              <Link to="/" className="nav-link">
                <HomeIcon className="nav-icon" />
                <span className="nav-text">Home</span>
              </Link>
              <Link to="/about" className="nav-link">
                <InfoIcon className="nav-icon" />
                <span className="nav-text">About</span>
              </Link>
              <Link to="/contact" className="nav-link">
                <ContactMailIcon className="nav-icon" />
                <span className="nav-text">Contact</span>
              </Link>
            </>
          ) : (
            <>
              {renderAuthenticatedNav()}
              <div className="user-menu">
                <Link to="/profile" className="nav-link">
                  <PersonIcon className="nav-icon" />
                  <span className="nav-text">Profile</span>
                </Link>
                <Link to="/settings" className="nav-link">
                  <SettingsIcon className="nav-icon" />
                  <span className="nav-text">Settings</span>
                </Link>
              </div>
            </>
          )}
        </nav>
        <div className="auth-buttons">
          {!isAuthenticated ? (
            <>
              <Link to="/login" className="auth-button login">
                <LoginIcon className="auth-icon" />
                <span className="auth-text">Login</span>
              </Link>
              <Link to="/register" className="auth-button register">
                <HowToRegIcon className="auth-icon" />
                <span className="auth-text">Register</span>
              </Link>
            </>
          ) : (
            <button onClick={handleLogout} className="auth-button login">
              <LogoutIcon className="auth-icon" />
              <span className="auth-text">Logout</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
