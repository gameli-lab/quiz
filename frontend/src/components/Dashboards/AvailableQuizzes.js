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
  CircularProgress,
} from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";

const AvailableQuizzes = () => {
  const [quizzes, setQuizzes] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const response = await axios.get("/api/quizzes/approved", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        const groupedBySubject = groupQuizzesByCategory(
          response.data,
          "subject"
        );
        setQuizzes(groupedBySubject);
      } catch (error) {
        console.error("Error fetching quizzes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, []);

  const groupQuizzesByCategory = (quizzes, category) => {
    return quizzes.reduce((grouped, quiz) => {
      const key = quiz[category];
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(quiz);
      return grouped;
    }, {});
  };

  const handleStartQuiz = (quizId) => navigate(`/quiz/${quizId}`);

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, textAlign: "center" }}>
        <CircularProgress />
        <Typography variant="h6" mt={2}>
          Loading quizzes...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Available Quizzes
      </Typography>

      {Object.keys(quizzes).length === 0 ? (
        <Typography>No quizzes available at the moment.</Typography>
      ) : (
        Object.entries(quizzes).map(([subject, subjectQuizzes]) => (
          <Box key={subject} mb={4}>
            <Typography variant="h5" component="h2" gutterBottom>
              {subject}
            </Typography>
            <Grid container spacing={3}>
              {subjectQuizzes.map((quiz) => (
                <Grid item xs={12} sm={6} md={4} key={quiz._id}>
                  <Card
                    variant="outlined"
                    sx={{
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      transition: "transform 0.2s",
                      "&:hover": { transform: "translateY(-5px)" },
                    }}
                  >
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" component="h3" gutterBottom>
                        {quiz.title}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        paragraph
                      >
                        {quiz.description || "No description available"}
                      </Typography>
                      <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                      >
                        <Chip
                          label={quiz.difficulty.toUpperCase()}
                          color={
                            quiz.difficulty === "easy"
                              ? "success"
                              : quiz.difficulty === "medium"
                              ? "warning"
                              : "error"
                          }
                          size="small"
                        />
                        <Typography variant="body2" color="text.secondary">
                          {quiz.timeLimit} mins
                        </Typography>
                      </Box>
                    </CardContent>
                    <Box p={2} pt={0}>
                      <Button
                        variant="contained"
                        fullWidth
                        startIcon={<PlayArrowIcon />}
                        onClick={() => handleStartQuiz(quiz._id)}
                      >
                        Start Quiz
                      </Button>
                    </Box>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        ))
      )}
    </Container>
  );
};

export default AvailableQuizzes;
