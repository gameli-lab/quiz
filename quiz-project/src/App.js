import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import LandingPage from "./components/LandingPage";
import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";
import TeacherDashboard from "./components/Dashboards/TeacherDashboard";
import AdminDashboard from "./components/Dashboards/AdminDashboard";
import StudentDashboard from "./components/Dashboards/StudentDashboard";
import QuizPage from "./components/QuizPage";

const App = () => {
  return (
    <Router>
      <Switch>
        <Route path="/" exact component={LandingPage} />
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
        <Route path="/teacher/dashboard" component={TeacherDashboard} />
        <Route path="/admin/dashboard" component={AdminDashboard} />
        <Route path="/student/dashboard" component={StudentDashboard} />
        <Route path="/quiz/:id" component={QuizPage} />
      </Switch>
    </Router>
  );
};

export default App;
