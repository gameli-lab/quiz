import React, { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../../contexts/AuthContext";
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Divider,
} from "@mui/material";
import "./Login.css";

const Login = () => {
  const { login } = useContext(AuthContext);
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await axios.post("/api/auth/login", credentials);
      login(res.data.token);
      localStorage.setItem("token", res.data.token);

      // Redirect based on role
      if (res.data.role === "student") {
        navigate("/student/dashboard");
      } else if (res.data.role === "teacher") {
        navigate("/teacher/dashboard");
      } else if (res.data.role === "admin") {
        navigate("/admin/dashboard");
      }
    } catch (error) {
      setError(error.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <Container component="main" maxWidth="xs">
      <Paper elevation={3} className="login-paper">
        <Typography component="h1" variant="h5">
          Sign in to your account
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
            value={credentials.email}
            onChange={handleChange}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            value={credentials.password}
            onChange={handleChange}
          />
          <Button
            fullWidth
            variant="contained"
            color="primary"
            onClick={handleLogin}
            disabled={loading}
            sx={{ mt: 3, mb: 2 }}
          >
            {loading ? "Signing in..." : "Sign In"}
          </Button>

          <Box sx={{ mt: 2, textAlign: "center" }}>
            <Link
              to="/forgot-password"
              style={{ color: "inherit", textDecoration: "none" }}
            >
              <Typography color="primary" variant="body2">
                Forgot password?
              </Typography>
            </Link>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Box sx={{ textAlign: "center" }}>
            <Typography variant="body2">
              Don't have an account?{" "}
              <Link
                to="/register"
                style={{ color: "primary", textDecoration: "none" }}
              >
                Sign up
              </Link>
            </Typography>
          </Box>

          <div class="login-divider">
            <span>or</span>
          </div>
          <div class="social-login-buttons">
            <button class="social-button">G</button>
            <button class="social-button">f</button>
          </div>
        </Box>
      </Paper>
    </Container>
  );
};

export default Login;
