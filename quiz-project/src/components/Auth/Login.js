import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import axios from "axios";
import "./Login.css"; // Import the CSS file

const Login = () => {
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const history = useHistory();

  const handleLogin = async () => {
    setError("");
    try {
      const res = await axios.post("/api/auth/login", credentials);
      localStorage.setItem("token", res.data.token);

      // Redirect based on role
      if (res.data.role === "student") {
        history.push("/student/dashboard");
      } else if (res.data.role === "teacher") {
        history.push("/teacher/dashboard");
      } else if (res.data.role === "admin") {
        history.push("/admin/dashboard");
      }
    } catch (error) {
      setError("Login failed. Please check your credentials.");
      console.error("Login failed:", error.message);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>Login</h1>
        {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}
        <input
          type="email"
          placeholder="Email"
          value={credentials.email}
          onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
        />
        <input
          type="password"
          placeholder="Password"
          value={credentials.password}
          onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
        />
        <button onClick={handleLogin}>Login</button>
        <p>
          Don't have an account? <a href="/register">Register here</a>
        </p>
      </div>
    </div>
  );
};

export default Login;
