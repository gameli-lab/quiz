import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
  CircularProgress,
  Box,
  LinearProgress,
  Paper,
  Divider,
  Grid,
  Chip,
} from "@mui/material";
import TimerIcon from "@mui/icons-material/Timer";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

const QuizPage = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [quizStarted, setQuizStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [quizEnded, setQuizEnded] = useState(false);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const response = await axios.get(`/api/quizzes/questions/${quizId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setQuiz(response.data);
        setTimeLeft(response.data.timeLimit * 60); // Set timer based on quiz time limit
      } catch (err) {
        console.error("Error fetching quiz:", err);
        setError("Failed to fetch quiz");
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [quizId]);

  // Start Timer when the quiz starts
  useEffect(() => {
    let timer;
    if (quizStarted && !quizEnded) {
      timer = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(timer);
            setQuizEnded(true); // End quiz if time runs out
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [quizStarted, quizEnded]);

  const handleStart = () => setQuizStarted(true);

  const handlePause = () => setQuizStarted(false);

  const handleStop = () => {
    setQuizStarted(false);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setTimeLeft(quiz ? quiz.timeLimit * 60 : 0);
    setQuizEnded(false);
  };

  const handleRestart = () => {
    setQuizStarted(true);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setTimeLeft(quiz ? quiz.timeLimit * 60 : 0);
    setQuizEnded(false);
  };

  const handleAnswerChange = (e) => {
    setAnswers({ ...answers, [currentQuestionIndex]: e.target.value });
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0)
      setCurrentQuestionIndex(currentQuestionIndex - 1);
  };

  const handleNext = () => {
    if (
      quiz &&
      quiz.questions &&
      currentQuestionIndex < quiz.questions.length - 1
    ) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handleSubmit = async () => {
    try {
      // Calculate time spent
      const timeSpent = quiz?.timeLimit * 60 - timeLeft;

      console.log("Submitting answers:", answers);

      // Submit answers to backend
      const response = await axios.post(
        `/api/quizzes/${quizId}/complete`,
        {
          answers,
          timeSpent,
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      console.log("Quiz submission response:", response.data);

      setQuizEnded(true);
      alert(`Quiz completed successfully! Your score: ${response.data.score}%`);
      navigate("/student/dashboard", { state: { quizCompleted: true } });
    } catch (error) {
      console.error(
        "Error submitting quiz:",
        error.response?.data || error.message
      );
      alert(
        `Failed to submit quiz: ${
          error.response?.data?.message || "Please try again."
        }`
      );
    }
  };

  const calculateProgress = () => {
    if (!quiz?.questions) return 0;
    return (currentQuestionIndex / quiz.questions.length) * 100;
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 5, textAlign: "center" }}>
        <CircularProgress size={60} thickness={4} />
        <Typography variant="h6" mt={2}>
          Loading quiz...
        </Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 5 }}>
        <Paper
          elevation={3}
          sx={{ p: 4, textAlign: "center", bgcolor: "#fff4f4" }}
        >
          <Typography color="error" variant="h5" gutterBottom>
            {error}
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate("/student/dashboard")}
          >
            Return to Dashboard
          </Button>
        </Paper>
      </Container>
    );
  }

  if (!quizStarted) {
    return (
      <Container maxWidth="md" sx={{ mt: 5 }}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
          <Typography
            variant="h4"
            gutterBottom
            sx={{ fontWeight: "bold", color: "#1976d2" }}
          >
            {quiz?.title}
          </Typography>
          <Divider sx={{ my: 2 }} />

          <Typography variant="body1" paragraph>
            {quiz?.description}
          </Typography>

          <Box sx={{ mb: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <Typography variant="subtitle2" color="text.secondary">
                  Subject:
                </Typography>
                <Typography variant="body1">{quiz?.subject}</Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="subtitle2" color="text.secondary">
                  Time Limit:
                </Typography>
                <Typography variant="body1">
                  {quiz?.timeLimit} minutes
                </Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="subtitle2" color="text.secondary">
                  Questions:
                </Typography>
                <Typography variant="body1">
                  {quiz?.questions?.length || 0}
                </Typography>
              </Grid>
            </Grid>
          </Box>

          <Box sx={{ mt: 4, textAlign: "center" }}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={handleStart}
              sx={{ px: 4, py: 1, borderRadius: 2 }}
            >
              Start Quiz
            </Button>
          </Box>
        </Paper>
      </Container>
    );
  }

  if (quizEnded) {
    return (
      <Container maxWidth="md" sx={{ mt: 5 }}>
        <Paper
          elevation={3}
          sx={{ p: 4, textAlign: "center", borderRadius: 2 }}
        >
          <CheckCircleIcon color="success" sx={{ fontSize: 60, mb: 2 }} />
          <Typography variant="h4" gutterBottom>
            Quiz Complete!
          </Typography>
          <Typography variant="body1" paragraph>
            You have completed the quiz "{quiz?.title}".
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            sx={{ mt: 2 }}
          >
            Submit Answers
          </Button>
        </Paper>
      </Container>
    );
  }

  const currentQuestion = quiz?.questions?.[currentQuestionIndex];

  return (
    <Container maxWidth="md" sx={{ my: 4 }}>
      <Paper elevation={3} sx={{ p: 3, borderRadius: 2, mb: 3 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: "bold" }}>
            {quiz?.title}
          </Typography>
          <Chip
            icon={<TimerIcon />}
            label={`${Math.floor(timeLeft / 60)}:${String(
              timeLeft % 60
            ).padStart(2, "0")}`}
            color="primary"
            variant="outlined"
          />
        </Box>

        <LinearProgress
          variant="determinate"
          value={calculateProgress()}
          sx={{ mb: 2, height: 8, borderRadius: 2 }}
        />

        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Question {currentQuestionIndex + 1} of {quiz?.questions?.length || 0}
        </Typography>
      </Paper>

      <Card variant="outlined" sx={{ mb: 3, borderRadius: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold" }}>
            {currentQuestion?.question || "No question available"}
          </Typography>

          <FormControl component="fieldset" sx={{ width: "100%", mt: 2 }}>
            <RadioGroup
              value={answers[currentQuestionIndex] || ""}
              onChange={handleAnswerChange}
            >
              {currentQuestion?.options?.map((option, index) => (
                <FormControlLabel
                  key={index}
                  value={String.fromCharCode(97 + index)} // 'a', 'b', 'c', 'd'
                  control={<Radio />}
                  label={`${String.fromCharCode(97 + index)}) ${option}`}
                  sx={{
                    mb: 1,
                    py: 1,
                    px: 2,
                    borderRadius: 1,
                    "&:hover": { bgcolor: "rgba(25, 118, 210, 0.04)" },
                  }}
                />
              ))}
            </RadioGroup>
          </FormControl>
        </CardContent>
      </Card>

      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
        <Button
          variant="outlined"
          startIcon={<NavigateBeforeIcon />}
          onClick={handlePrev}
          disabled={currentQuestionIndex === 0}
        >
          Previous
        </Button>

        <Box>
          <Button
            variant="outlined"
            color="secondary"
            onClick={handlePause}
            sx={{ mr: 1 }}
          >
            Pause
          </Button>
          <Button
            variant="outlined"
            color="error"
            onClick={handleStop}
            sx={{ mr: 1 }}
          >
            Stop
          </Button>
          <Button variant="outlined" onClick={handleRestart}>
            Restart
          </Button>
        </Box>

        {currentQuestionIndex === quiz?.questions?.length - 1 ? (
          <Button
            variant="contained"
            color="primary"
            endIcon={<CheckCircleIcon />}
            onClick={() => setQuizEnded(true)}
          >
            Finish
          </Button>
        ) : (
          <Button
            variant="contained"
            endIcon={<NavigateNextIcon />}
            onClick={handleNext}
          >
            Next
          </Button>
        )}
      </Box>
    </Container>
  );
};

export default QuizPage;
