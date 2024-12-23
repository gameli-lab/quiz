import React, { useState, useEffect } from "react";

const QuizPage = ({ quiz }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [quizStarted, setQuizStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(quiz.timeLimit * 60); // Initialize timer in seconds
  const [quizEnded, setQuizEnded] = useState(false);

  const currentQuestion = quiz.questions[currentQuestionIndex];

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
    setTimeLeft(quiz.timeLimit * 60); // Reset timer
    setQuizEnded(false);
  };
  const handleRestart = () => {
    setQuizStarted(true);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setTimeLeft(quiz.timeLimit * 60); // Reset timer
    setQuizEnded(false);
  };

  const handleAnswerChange = (e) => {
    setAnswers({ ...answers, [currentQuestionIndex]: e.target.value });
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) setCurrentQuestionIndex(currentQuestionIndex - 1);
  };

  const handleNext = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handleSubmit = () => {
    setQuizEnded(true);
    alert("Quiz submitted successfully!");
    console.log("Submitted Answers:", answers);
  };

  if (!quizStarted) {
    return (
      <div>
        <h1>{quiz.title}</h1>
        <p>{quiz.description}</p>
        <button onClick={handleStart}>Start Quiz</button>
      </div>
    );
  }

  if (quizEnded) {
    return (
      <div>
        <h1>{quiz.title}</h1>
        <p>Time's up or you ended the quiz!</p>
        <button onClick={handleSubmit}>Submit Quiz</button>
      </div>
    );
  }

  return (
    <div>
      <h1>{quiz.title}</h1>
      <p>
        Time Left: {Math.floor(timeLeft / 60)}:
        {String(timeLeft % 60).padStart(2, "0")}
      </p>
      <div>
        <p>
          Question {currentQuestionIndex + 1} of {quiz.questions.length}
        </p>
        <p>{currentQuestion.text}</p>
        <input
          type="text"
          value={answers[currentQuestionIndex] || ""}
          onChange={handleAnswerChange}
        />
      </div>
      <div>
        <button onClick={handlePrev} disabled={currentQuestionIndex === 0}>
          Prev
        </button>
        <button
          onClick={handleNext}
          disabled={currentQuestionIndex === quiz.questions.length - 1}
        >
          Next
        </button>
      </div>
      <div>
        <button onClick={handlePause}>Pause</button>
        <button onClick={handleStop}>Stop</button>
        <button onClick={handleRestart}>Restart</button>
      </div>
      {currentQuestionIndex === quiz.questions.length - 1 && (
        <button onClick={handleSubmit}>Submit</button>
      )}
    </div>
  );
};

export default QuizPage;
