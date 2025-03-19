import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const QuizResultDetails = () => {
  const { quizId } = useParams();
  const [quiz, setQuiz] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [quizResponse, resultsResponse] = await Promise.all([
          axios.get(`/api/quiz/${quizId}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }),
          axios.get(`/api/quizzes/results/${quizId}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }),
        ]);

        setQuiz(quizResponse.data);
        setResults(resultsResponse.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [quizId]);

  const calculateAverageScore = () => {
    if (!results.length) return 0;
    const sum = results.reduce((acc, result) => acc + result.score, 0);
    return Math.round(sum / results.length);
  };

  if (loading) {
    return (
      <Container sx={{ textAlign: "center", mt: 5 }}>
        <CircularProgress />
        <Typography variant="h6" mt={2}>
          Loading quiz results...
        </Typography>
      </Container>
    );
  }

  if (!quiz) {
    return (
      <Container sx={{ mt: 5 }}>
        <Typography variant="h5" color="error">
          Quiz not found
        </Typography>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/teacher/results")}
          sx={{ mt: 2 }}
        >
          Back to Results
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <Box sx={{ mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/teacher/results")}
        >
          Back to Results
        </Button>
      </Box>

      <Typography variant="h4" gutterBottom>
        {quiz.title} - Results
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6">Total Submissions</Typography>
              <Typography variant="h3">{results.length}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6">Average Score</Typography>
              <Typography variant="h3">{calculateAverageScore()}%</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6">Passing Rate</Typography>
              <Typography variant="h3">
                {results.length
                  ? Math.round(
                      (results.filter((r) => r.score >= 60).length /
                        results.length) *
                        100
                    )
                  : 0}
                %
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Typography variant="h5" gutterBottom>
        Student Submissions
      </Typography>

      {results.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <Typography>No submissions for this quiz yet.</Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Student</TableCell>
                <TableCell>Score</TableCell>
                <TableCell>Time Spent</TableCell>
                <TableCell>Date Completed</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {results.map((result) => (
                <TableRow key={result._id} hover>
                  <TableCell>{result.user?.name || "Anonymous"}</TableCell>
                  <TableCell>
                    <Chip
                      label={`${result.score}%`}
                      color={
                        result.score >= 80
                          ? "success"
                          : result.score >= 60
                          ? "warning"
                          : "error"
                      }
                    />
                  </TableCell>
                  <TableCell>
                    {Math.floor(result.timeSpent / 60)}m {result.timeSpent % 60}
                    s
                  </TableCell>
                  <TableCell>
                    {new Date(result.completedAt).toLocaleString()}
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

export default QuizResultDetails;
