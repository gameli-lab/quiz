import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  Button,
  Chip,
  Divider,
  CircularProgress,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AssessmentIcon from "@mui/icons-material/Assessment";
import AddCircleIcon from "@mui/icons-material/AddCircle";

const TeacherQuizzes = () => {
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

  const handleCreateQuiz = () => {
    navigate("/teacher/create-quiz");
  };

  const handleEditQuiz = (quizId) => {
    navigate(`/teacher/edit-quiz/${quizId}`);
  };

  const handleViewResults = (quizId) => {
    navigate(`/teacher/quiz-results/${quizId}`);
  };

  const handleDeleteQuiz = async (quizId) => {
    if (window.confirm("Are you sure you want to delete this quiz?")) {
      try {
        await axios.delete(
          `https://quiz-master-2hwm.onrender.com/api/quiz/${quizId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setQuizzes(quizzes.filter((quiz) => quiz._id !== quizId));
      } catch (err) {
        console.error("Failed to delete quiz:", err.message);
      }
    }
  };

  if (loading) {
    return (
      <Container sx={{ textAlign: "center", mt: 5 }}>
        <CircularProgress />
        <Typography variant="h6" mt={2}>
          Loading quizzes...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4" component="h1">
          My Quizzes
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddCircleIcon />}
          onClick={handleCreateQuiz}
        >
          Create New Quiz
        </Button>
      </Box>

      {quizzes.length === 0 ? (
        <Card sx={{ p: 4, textAlign: "center" }}>
          <Typography variant="h6" gutterBottom>
            You haven't created any quizzes yet
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddCircleIcon />}
            onClick={handleCreateQuiz}
            sx={{ mt: 2 }}
          >
            Create Your First Quiz
          </Button>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {quizzes.map((quiz) => (
            <Grid item xs={12} sm={6} md={4} key={quiz._id}>
              <Card
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h5" component="h2" gutterBottom>
                    {quiz.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {quiz.description}
                  </Typography>
                  <Box sx={{ mt: 2, mb: 2 }}>
                    <Chip label={quiz.subject} sx={{ mr: 1 }} />
                    <Chip
                      label={quiz.difficulty.toUpperCase()}
                      color={
                        quiz.difficulty === "easy"
                          ? "success"
                          : quiz.difficulty === "medium"
                          ? "warning"
                          : "error"
                      }
                    />
                  </Box>
                  <Typography variant="body2">
                    Questions: {quiz.questions?.length || 0}
                  </Typography>
                  <Typography variant="body2">
                    Time Limit: {quiz.timeLimit} minutes
                  </Typography>
                </CardContent>
                <Divider />
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-around",
                    p: 1.5,
                  }}
                >
                  <Button
                    startIcon={<AssessmentIcon />}
                    onClick={() => handleViewResults(quiz._id)}
                    size="small"
                  >
                    Results
                  </Button>
                  <Button
                    startIcon={<EditIcon />}
                    onClick={() => handleEditQuiz(quiz._id)}
                    size="small"
                  >
                    Edit
                  </Button>
                  <Button
                    startIcon={<DeleteIcon />}
                    color="error"
                    onClick={() => handleDeleteQuiz(quiz._id)}
                    size="small"
                  >
                    Delete
                  </Button>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default TeacherQuizzes;
