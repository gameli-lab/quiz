import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Chip,
} from "@mui/material";

const QuizResults = () => {
  const [completedQuizzes, setCompletedQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCompletedQuizzes = async () => {
      try {
        const response = await axios.get("/api/quizzes/completed", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setCompletedQuizzes(response.data);
      } catch (error) {
        console.error("Error fetching completed quizzes:", error);
        setError("Failed to load your quiz results. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchCompletedQuizzes();
  }, []);

  const getScoreColor = (score) => {
    if (score >= 80) return "success";
    if (score >= 60) return "warning";
    return "error";
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return (
      date.toLocaleDateString() +
      " at " +
      date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    );
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, textAlign: "center" }}>
        <CircularProgress />
        <Typography variant="h6" mt={2}>
          Loading your results...
        </Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Typography color="error" variant="h6">
          {error}
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        My Quiz Results
      </Typography>

      {completedQuizzes.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: "center" }}>
          <Typography>
            You haven't completed any quizzes yet. Start taking quizzes to see
            your results here!
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Quiz Title</TableCell>
                <TableCell>Subject</TableCell>
                <TableCell>Difficulty</TableCell>
                <TableCell align="center">Score</TableCell>
                <TableCell>Time Spent</TableCell>
                <TableCell>Completed On</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {completedQuizzes.map((item) => (
                <TableRow key={item._id} hover>
                  <TableCell>{item.quiz?.title || "Untitled Quiz"}</TableCell>
                  <TableCell>{item.quiz?.subject || "N/A"}</TableCell>
                  <TableCell>
                    {item.quiz?.difficulty ? (
                      <Chip
                        label={item.quiz.difficulty.toUpperCase()}
                        size="small"
                        color={
                          item.quiz.difficulty === "easy"
                            ? "success"
                            : item.quiz.difficulty === "medium"
                            ? "warning"
                            : "error"
                        }
                      />
                    ) : (
                      "N/A"
                    )}
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={`${item.score}%`}
                      color={getScoreColor(item.score)}
                    />
                  </TableCell>
                  <TableCell>
                    {Math.floor(item.timeSpent / 60)}m {item.timeSpent % 60}s
                  </TableCell>
                  <TableCell>{formatDate(item.completedAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
};

export default QuizResults;
