import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import {
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  TextField,
  CircularProgress,
  Box,
} from "@mui/material";

const QuizPage = () => {
  const { quizId } = useParams();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [quizStarted, setQuizStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0); // Initialize timer in seconds
  const [quizEnded, setQuizEnded] = useState(false);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const response = await axios.get(`/api/quizzes/questions/${quizId}`, {
          headers: { Authorization: localStorage.getItem("token") },
        });
        setQuiz(response.data);
        setTimeLeft(response.data.timeLimit * 60); // Set timer based on quiz time limit
      } catch (err) {
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
    setTimeLeft(quiz ? quiz.timeLimit * 60 : 0); // Reset timer
    setQuizEnded(false);
  };
  const handleRestart = () => {
    setQuizStarted(true);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setTimeLeft(quiz ? quiz.timeLimit * 60 : 0); // Reset timer
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
    if (quiz && currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handleSubmit = () => {
    setQuizEnded(true);
    alert("Quiz submitted successfully!");
    console.log("Submitted Answers:", answers);
  };

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">{error}</Typography>;

  if (!quizStarted) {
    return (
      <Container>
        <Typography variant="h4" gutterBottom>
          {quiz?.title}
        </Typography>
        <Typography variant="body1" gutterBottom>
          {quiz?.description}
        </Typography>
        <Button variant="contained" color="primary" onClick={handleStart}>
          Start Quiz
        </Button>
      </Container>
    );
  }

  if (quizEnded) {
    return (
      <Container>
        <Typography variant="h4" gutterBottom>
          {quiz?.title}
        </Typography>
        <Typography variant="body1" gutterBottom>
          Time's up or you ended the quiz!
        </Typography>
        <Button variant="contained" color="primary" onClick={handleSubmit}>
          Submit Quiz
        </Button>
      </Container>
    );
  }

  const currentQuestion = quiz?.questions?.[currentQuestionIndex];

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        {quiz?.title}
      </Typography>
      <Typography variant="h6" gutterBottom>
        Time Left: {Math.floor(timeLeft / 60)}:
        {String(timeLeft % 60).padStart(2, "0")}
      </Typography>
      <Card variant="outlined" sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Question {currentQuestionIndex + 1} of{" "}
            {quiz?.questions?.length || 0}
          </Typography>
          <Typography variant="body1" gutterBottom>
            {currentQuestion?.text || "No question text available"}
          </Typography>
          <TextField
            fullWidth
            variant="outlined"
            label="Your Answer"
            value={answers[currentQuestionIndex] || ""}
            onChange={handleAnswerChange}
            sx={{ mt: 2 }}
          />
        </CardContent>
      </Card>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Button
          variant="contained"
          onClick={handlePrev}
          disabled={currentQuestionIndex === 0}
        >
          Prev
        </Button>
        <Button
          variant="contained"
          onClick={handleNext}
          disabled={currentQuestionIndex === quiz?.questions?.length - 1}
        >
          Next
        </Button>
      </Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Button variant="contained" onClick={handlePause}>
          Pause
        </Button>
        <Button variant="contained" onClick={handleStop}>
          Stop
        </Button>
        <Button variant="contained" onClick={handleRestart}>
          Restart
        </Button>
      </Box>
      {currentQuestionIndex === quiz?.questions?.length - 1 && (
        <Button variant="contained" color="primary" onClick={handleSubmit}>
          Submit
        </Button>
      )}
    </Container>
  );
};

export default QuizPage;
