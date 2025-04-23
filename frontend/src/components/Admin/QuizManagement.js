import React, { useState, useEffect } from "react";
import axios from "axios";
import "./QuizManagement.css";

const QuizManagement = () => {
  const [pendingQuizzes, setPendingQuizzes] = useState([]);
  const [approvedQuizzes, setApprovedQuizzes] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [quizzesPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateQuizForm, setShowCreateQuizForm] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [quizForm, setQuizForm] = useState({
    title: "",
    subject: "",
    description: "",
    timeLimit: "",
    difficulty: "",
    files: [],
  });

  const subjects = [
    "Math",
    "Science",
    "Computing",
    "English",
    "Creative Art and Design",
    "Social Studies",
    "French",
    "Career Technology",
    "Ghanaian Language",
    "Religious and Moral Education",
    "Other",
  ];

  const difficulties = ["easy", "medium", "hard"];

  // Fetch pending and approved quizzes
  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        const pendingResponse = await axios.get(
          "https://quiz-master-2hwm.onrender.com/api/quizzes/pending",
          {
            headers,
          }
        );
        setPendingQuizzes(pendingResponse.data);

        const approvedResponse = await axios.get(
          "https://quiz-master-2hwm.onrender.com/api/quizzes/approved",
          {
            headers,
          }
        );
        setApprovedQuizzes(approvedResponse.data);
      } catch (error) {
        console.error("Error fetching quizzes:", error);
      }
    };

    fetchQuizzes();
  }, []);

  // Handle quiz creation form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setQuizForm({ ...quizForm, [name]: value });
  };

  // Handle file upload for quiz creation
  const handleFileChange = (e) => {
    setQuizForm({ ...quizForm, files: e.target.files });
  };

  // Submit quiz creation form
  const handleCreateQuiz = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      const formData = new FormData();
      formData.append("title", quizForm.title);
      formData.append("subject", quizForm.subject);
      formData.append("description", quizForm.description);
      formData.append("timeLimit", quizForm.timeLimit);
      formData.append("difficulty", quizForm.difficulty);
      for (let file of quizForm.files) {
        formData.append("files", file);
      }

      await axios.post(
        "https://quiz-master-2hwm.onrender.com/api/quizzes/create",
        formData,
        { headers }
      );
      alert("Quiz created successfully!");
      setShowCreateQuizForm(false);
      window.location.reload();
    } catch (error) {
      console.error("Error creating quiz:", error);
    }
  };

  // Approve a quiz
  const handleApproveQuiz = async (quizId) => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      await axios.put(
        `https://quiz-master-2hwm.onrender.com/api/quizzes/approve/${quizId}`,
        {},
        { headers }
      );
      alert("Quiz approved successfully!");
      window.location.reload();
    } catch (error) {
      console.error("Error approving quiz:", error);
    }
  };

  // Delete a quiz
  const handleDeleteQuiz = async (quizId) => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      await axios.delete(
        `https://quiz-master-2hwm.onrender.com/api/quizzes/${quizId}`,
        { headers }
      );
      alert("Quiz deleted successfully!");
      window.location.reload();
    } catch (error) {
      console.error("Error deleting quiz:", error);
    }
  };

  // Detailed quiz preview
  const openQuizPreview = (quiz) => {
    setSelectedQuiz(quiz);
  };

  const closeQuizPreview = () => {
    setSelectedQuiz(null);
  };

  // Pagination logic
  const indexOfLastQuiz = currentPage * quizzesPerPage;
  const indexOfFirstQuiz = indexOfLastQuiz - quizzesPerPage;
  const currentPendingQuizzes = pendingQuizzes.slice(
    indexOfFirstQuiz,
    indexOfLastQuiz
  );
  const currentApprovedQuizzes = approvedQuizzes.slice(
    indexOfFirstQuiz,
    indexOfLastQuiz
  );

  // Search functionality
  const filteredPendingQuizzes = pendingQuizzes.filter(
    (quiz) =>
      quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quiz.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const filteredApprovedQuizzes = approvedQuizzes.filter(
    (quiz) =>
      quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quiz.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="quiz-management">
      <h1>Quiz Management</h1>

      {/* Search Bar */}
      <input
        type="text"
        placeholder="Search quizzes by title or subject..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="search-bar"
      />

      {/* Create Quiz Button */}
      <button onClick={() => setShowCreateQuizForm(!showCreateQuizForm)}>
        {showCreateQuizForm ? "Cancel" : "Create Quiz"}
      </button>

      {/* Create Quiz Form */}
      {showCreateQuizForm && (
        <form onSubmit={handleCreateQuiz} className="create-quiz-form">
          <input
            type="text"
            name="title"
            placeholder="Title"
            value={quizForm.title}
            onChange={handleInputChange}
            required
          />
          <select
            name="subject"
            value={quizForm.subject}
            onChange={handleInputChange}
            required
          >
            <option value="">Select Subject</option>
            {subjects.map((subject) => (
              <option key={subject} value={subject}>
                {subject}
              </option>
            ))}
          </select>
          <textarea
            name="description"
            placeholder="Description"
            value={quizForm.description}
            onChange={handleInputChange}
          />
          <input
            type="number"
            name="timeLimit"
            placeholder="Time Limit (minutes)"
            value={quizForm.timeLimit}
            onChange={handleInputChange}
            required
          />
          <select
            name="difficulty"
            value={quizForm.difficulty}
            onChange={handleInputChange}
            required
          >
            <option value="">Select Difficulty</option>
            {difficulties.map((difficulty) => (
              <option key={difficulty} value={difficulty}>
                {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
              </option>
            ))}
          </select>
          <input
            type="file"
            name="files"
            multiple
            onChange={handleFileChange}
            required
          />
          <button type="submit">Create Quiz</button>
        </form>
      )}

      {/* Pending Quizzes Section */}
      <section>
        <h2>Pending Quizzes</h2>
        {filteredPendingQuizzes.length === 0 ? (
          <p>No pending quizzes.</p>
        ) : (
          <ul>
            {filteredPendingQuizzes.map((quiz) => (
              <li key={quiz._id}>
                <h3 onClick={() => openQuizPreview(quiz)}>{quiz.title}</h3>
                <p>{quiz.description}</p>
                <p>Uploaded by: {quiz.uploader?.fullname || "Unknown"}</p>
                <button onClick={() => handleApproveQuiz(quiz._id)}>
                  Approve
                </button>
                <button onClick={() => handleDeleteQuiz(quiz._id)}>
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Approved Quizzes Section */}
      <section>
        <h2>Approved Quizzes</h2>
        {filteredApprovedQuizzes.length === 0 ? (
          <p>No approved quizzes.</p>
        ) : (
          <ul>
            {filteredApprovedQuizzes.map((quiz) => (
              <li key={quiz._id}>
                <h3 onClick={() => openQuizPreview(quiz)}>{quiz.title}</h3>
                <p>{quiz.description}</p>
                <button onClick={() => handleDeleteQuiz(quiz._id)}>
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Pagination */}
      <div className="pagination">
        <button
          onClick={() => setCurrentPage(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Previous
        </button>
        <span>Page {currentPage}</span>
        <button
          onClick={() => setCurrentPage(currentPage + 1)}
          disabled={
            currentPendingQuizzes.length < quizzesPerPage &&
            currentApprovedQuizzes.length < quizzesPerPage
          }
        >
          Next
        </button>
      </div>

      {/* Quiz Preview Modal */}
      {selectedQuiz && (
        <div className="quiz-preview-modal">
          <div className="modal-content">
            <h2>{selectedQuiz.title}</h2>
            <p>{selectedQuiz.description}</p>
            <p>Subject: {selectedQuiz.subject}</p>
            <p>Difficulty: {selectedQuiz.difficulty}</p>
            <p>Uploaded by: {selectedQuiz.uploader?.fullname || "Unknown"}</p>
            <button onClick={closeQuizPreview}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizManagement;
