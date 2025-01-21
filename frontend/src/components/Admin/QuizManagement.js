import React, { useState } from "react";
import axios from "axios";
import {
  Box,
  Button,
  TextField,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  IconButton,
  MenuItem,
} from "@mui/material";
import { Delete as DeleteIcon } from "@mui/icons-material";

const QuizManagement = () => {
  const [formData, setFormData] = useState({
    title: "",
    subject: "",
    description: "",
    timeLimit: 30,
    difficulty: "medium",
  });
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle file changes
  const handleFileChange = (event) => {
    const newFiles = Array.from(event.target.files);
    setFiles((prevFiles) => [...prevFiles, ...newFiles]);
  };

  // Remove file from the list
  const removeFile = (index) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  // Handle form submission
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
      // Send the data to the backend
      const response = await axios.post("/api/upload", submitData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "multipart/form-data",
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
      sx={{ maxWidth: 600, mx: "auto", mt: 3 }}
    >
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
          "Art",
          "Social Studies",
          "French",
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

export default QuizManagement;
