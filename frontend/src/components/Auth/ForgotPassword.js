import React, { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EmailIcon from "@mui/icons-material/Email";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email address");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await axios.post(
        "https://quiz-master-2hwm.onrender.com/api/auth/forgot-password",
        { email }
      );
      setSuccess(true);
    } catch (error) {
      setError(
        error.response?.data?.message || "Failed to process your request"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Paper elevation={3} sx={{ p: 4, mt: 8, borderRadius: 2 }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          {success ? (
            <>
              <Box
                sx={{
                  backgroundColor: "success.light",
                  borderRadius: "50%",
                  p: 2,
                  mb: 2,
                }}
              >
                <EmailIcon sx={{ fontSize: 40, color: "white" }} />
              </Box>

              <Typography
                component="h1"
                variant="h5"
                gutterBottom
                align="center"
              >
                Reset Link Sent
              </Typography>

              <Typography variant="body1" align="center" paragraph>
                We've sent a password reset link to {email}. Please check your
                email and follow the instructions.
              </Typography>

              <Typography variant="body2" align="center" paragraph>
                If you don't receive an email within a few minutes, please check
                your spam folder.
              </Typography>

              <Box sx={{ mt: 2 }}>
                <Link to="/login" style={{ textDecoration: "none" }}>
                  <Button startIcon={<ArrowBackIcon />} variant="text">
                    Return to login
                  </Button>
                </Link>
              </Box>
            </>
          ) : (
            <>
              <Typography component="h1" variant="h5" gutterBottom>
                Reset Your Password
              </Typography>

              <Typography
                variant="body2"
                color="textSecondary"
                align="center"
                paragraph
              >
                Enter your email address and we'll send you a link to reset your
                password
              </Typography>

              {error && (
                <Alert severity="error" sx={{ width: "100%", mb: 2 }}>
                  {error}
                </Alert>
              )}

              <Box
                component="form"
                onSubmit={handleSubmit}
                sx={{ width: "100%" }}
              >
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  color="primary"
                  disabled={loading}
                  sx={{ mt: 3, mb: 2, py: 1.5 }}
                >
                  {loading ? <CircularProgress size={24} /> : "Send Reset Link"}
                </Button>

                <Box sx={{ textAlign: "center", mt: 2 }}>
                  <Link to="/login" style={{ textDecoration: "none" }}>
                    <Button startIcon={<ArrowBackIcon />} variant="text">
                      Back to login
                    </Button>
                  </Link>
                </Box>
              </Box>
            </>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default ForgotPassword;
