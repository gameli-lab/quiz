import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  //   Box,
  Button,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";

const TeacherResults = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const response = await axios.get(
          "https://quiz-master-2hwm.onrender.com/api/quiz/teacher",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setQuizzes(response.data);
      } catch (error) {
        console.error("Error fetching quizzes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, []);

  const handleViewResults = (quizId) => {
    navigate(`/teacher/quiz-results/${quizId}`);
  };

  if (loading) {
    return (
      <Container sx={{ textAlign: "center", mt: 5 }}>
        <CircularProgress />
        <Typography variant="h6" mt={2}>
          Loading results...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Quiz Results
      </Typography>

      {quizzes.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <Typography variant="h6">
            You haven't created any quizzes yet
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate("/teacher/create-quiz")}
            sx={{ mt: 2 }}
          >
            Create Your First Quiz
          </Button>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Quiz Title</TableCell>
                <TableCell>Subject</TableCell>
                <TableCell>Questions</TableCell>
                <TableCell>Submissions</TableCell>
                <TableCell>Average Score</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {quizzes.map((quiz) => (
                <TableRow key={quiz._id} hover>
                  <TableCell>{quiz.title}</TableCell>
                  <TableCell>{quiz.subject}</TableCell>
                  <TableCell>{quiz.questions?.length || 0}</TableCell>
                  <TableCell>{quiz.submissionCount || 0}</TableCell>
                  <TableCell>
                    {quiz.averageScore
                      ? `${Math.round(quiz.averageScore)}%`
                      : "N/A"}
                  </TableCell>
                  <TableCell align="center">
                    <Button
                      startIcon={<VisibilityIcon />}
                      onClick={() => handleViewResults(quiz._id)}
                      size="small"
                    >
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
};

export default TeacherResults;
