import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import Header from "./components/Layout/Header";
import Footer from "./components/Layout/Footer";
import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";
import StudentDashboard from "./components/Dashboards/StudentDashboard";
import TeacherDashboard from "./components/Dashboards/TeacherDashboard";
import TeacherQuizzes from "./components/Dashboards/TeacherQuizzes";
import TeacherResults from "./components/Dashboards/TeacherResults";
import QuizResultDetails from "./components/Dashboards/QuizResultDetails";
import QuizUpload from "./components/Quiz/QuizUpload";
import AdminDashboard from "./components/Dashboards/AdminDashboard";
import AdminQuizzes from "./components/Admin/AdminQuizzes";
import UserManagement from "./components/Admin/UserManagement";
import AdminAnalytics from "./components/Admin/AdminAnalytics";
import AdminAnnouncements from "./components/Admin/AdminAnnouncements";
import QuizManagement from "./components/Admin/QuizManagement";
import ProtectedRoute from "./components/Auth/ProtectedRoute";
import LandingPage from "./components/LandingPage/LandingPage";
import About from "./components/Pages/About";
import Contact from "./components/Pages/Contact";
import Profile from "./components/Profile/Profile";
import Settings from "./components/Settings/Settings";
import QuizPage from "./components/QuizPage"; // Import the QuizPage component
import AvailableQuizzes from "./components/Dashboards/AvailableQuizzes";
import QuizResults from "./components/Dashboards/QuizResults";
import ForgotPassword from "./components/Auth/ForgotPassword"; // Import the ForgotPassword component
import ResetPassword from "./components/Auth/ResetPassword"; // Import the ResetPassword component
import "./App.css";
import "./styles/themes.css";
import "./styles/theme.css";

function App() {
  return (
    <ThemeProvider>
      <Router>
        <AuthProvider>
          <div className="app-container">
            <Header />
            <main className="main-content">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route
                  path="/reset-password/:token"
                  element={<ResetPassword />}
                />

                {/* Admin Routes */}
                <Route
                  path="/admin/dashboard"
                  element={
                    <ProtectedRoute>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/quizzes"
                  element={
                    <ProtectedRoute>
                      <AdminQuizzes />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/users"
                  element={
                    <ProtectedRoute>
                      <UserManagement />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/analytics"
                  element={
                    <ProtectedRoute>
                      <AdminAnalytics />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/announcements"
                  element={
                    <ProtectedRoute>
                      <AdminAnnouncements />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/quiz-management"
                  element={
                    <ProtectedRoute>
                      <QuizManagement />
                    </ProtectedRoute>
                  }
                />

                {/* Teacher Routes */}
                <Route
                  path="/teacher/dashboard"
                  element={
                    <ProtectedRoute>
                      <TeacherDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/teacher/quizzes"
                  element={
                    <ProtectedRoute>
                      <TeacherQuizzes />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/teacher/create-quiz"
                  element={
                    <ProtectedRoute>
                      <QuizUpload />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/teacher/results"
                  element={
                    <ProtectedRoute>
                      <TeacherResults />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/teacher/quiz-results/:quizId"
                  element={
                    <ProtectedRoute>
                      <QuizResultDetails />
                    </ProtectedRoute>
                  }
                />

                {/* Student Routes */}
                <Route
                  path="/student/dashboard"
                  element={
                    <ProtectedRoute>
                      <StudentDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/student/quizzes"
                  element={
                    <ProtectedRoute>
                      <AvailableQuizzes />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/student/results"
                  element={
                    <ProtectedRoute>
                      <QuizResults />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/quiz/:quizId"
                  element={
                    <ProtectedRoute>
                      <QuizPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/settings"
                  element={
                    <ProtectedRoute>
                      <Settings />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </main>
            <Footer />
          </div>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
