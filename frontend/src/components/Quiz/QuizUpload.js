import React, { useState } from "react";
import axios from "axios";
import {
  Box,
  TextField,
  Typography,
  Button,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Alert,
  CircularProgress,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

const QuizUpload = () => {
  const [formData, setFormData] = useState({
    title: "",
    subject: "",
    description: "",
    timeLimit: 30,
    difficulty: "medium",
  });
  const [files, setFiles] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleFileChange = (event) => {
    const newFiles = Array.from(event.target.files);
    setFiles((prevFiles) => [...prevFiles, ...newFiles]);
  };

  const removeFile = (index) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    const submitData = new FormData();
    // Append all form fields
    Object.keys(formData).forEach((key) => {
      submitData.append(key, formData[key]);
    });
    // Append files
    files.forEach((file) => submitData.append("files", file));

    try {
      const response = await axios.post("/api/quizzes/create", submitData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      setSuccess(response.data.message);
      setFormData({
        title: "",
        subject: "",
        description: "",
        timeLimit: 30,
        difficulty: "medium",
      });
      setFiles([]);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create quiz");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{ maxWidth: 600, mx: "auto", mt: 3, p: 3 }}
    >
      <Typography variant="h4" component="h1" gutterBottom>
        Create New Quiz
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <TextField
        fullWidth
        name="title"
        label="Quiz Title"
        value={formData.title}
        onChange={handleInputChange}
        required
        sx={{ mb: 2 }}
      />

      <TextField
        select
        fullWidth
        name="subject"
        label="Subject"
        value={formData.subject}
        onChange={handleInputChange}
        required
        sx={{ mb: 2 }}
      >
        {[
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
        ].map((option) => (
          <MenuItem key={option} value={option}>
            {option}
          </MenuItem>
        ))}
      </TextField>

      <TextField
        fullWidth
        name="description"
        label="Description"
        value={formData.description}
        onChange={handleInputChange}
        multiline
        rows={4}
        sx={{ mb: 2 }}
      />

      <TextField
        fullWidth
        name="timeLimit"
        label="Time Limit (minutes)"
        type="number"
        value={formData.timeLimit}
        onChange={handleInputChange}
        required
        InputProps={{ inputProps: { min: 1 } }}
        sx={{ mb: 2 }}
      />

      <TextField
        select
        fullWidth
        name="difficulty"
        label="Difficulty"
        value={formData.difficulty}
        onChange={handleInputChange}
        required
        sx={{ mb: 2 }}
      >
        {["easy", "medium", "hard"].map((option) => (
          <MenuItem key={option} value={option}>
            {option.charAt(0).toUpperCase() + option.slice(1)}
          </MenuItem>
        ))}
      </TextField>

      <Button variant="contained" component="label" sx={{ mb: 2 }}>
        Upload Files
        <input
          type="file"
          hidden
          multiple
          accept=".txt,.pdf,.doc,.docx"
          onChange={handleFileChange}
        />
      </Button>

      <List>
        {files.map((file, index) => (
          <ListItem
            key={index}
            secondaryAction={
              <IconButton edge="end" onClick={() => removeFile(index)}>
                <DeleteIcon />
              </IconButton>
            }
          >
            <ListItemText
              primary={file.name}
              secondary={`${(file.size / 1024).toFixed(2)} KB`}
            />
          </ListItem>
        ))}
      </List>

      <Button
        type="submit"
        variant="contained"
        color="primary"
        disabled={loading || files.length === 0}
        sx={{ mt: 2 }}
      >
        {loading ? <CircularProgress size={24} /> : "Create Quiz"}
      </Button>
    </Box>
  );
};

export default QuizUpload;
