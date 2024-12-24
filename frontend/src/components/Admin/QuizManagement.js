import React, { useState } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  MenuItem,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Divider,
} from "@mui/material";
import {
  Upload as UploadIcon,
  Delete as DeleteIcon,
  Description as FileIcon,
} from "@mui/icons-material";
import axios from "axios";

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (event) => {
    const newFiles = Array.from(event.target.files);
    const validFiles = newFiles.filter((file) => {
      const validTypes = [
        "text/plain",
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];
      if (!validTypes.includes(file.type)) {
        setError(
          `Invalid file type: ${file.name}. Only txt, pdf, doc, and docx files are allowed.`
        );
        return false;
      }
      return true;
    });
    setFiles((prev) => [...prev, ...validFiles]);
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    if (!formData.title.trim()) return "Title is required";
    if (!formData.subject) return "Subject is required";
    if (!formData.timeLimit || formData.timeLimit < 1)
      return "Valid time limit is required";
    if (!formData.difficulty) return "Difficulty level is required";
    if (files.length === 0) return "At least one question file is required";
    return null;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    const submitData = new FormData();
    Object.keys(formData).forEach((key) => {
      submitData.append(key, formData[key]);
    });
    files.forEach((file) => submitData.append("files", file));

    try {
      await axios.post("/api/admin/quizzes/create", submitData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: localStorage.getItem("token"),
        },
      });

      setSuccess("Quiz created successfully and processing has begun.");
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
    <Box sx={{ p: 3 }}>
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Create New Quiz
          </Typography>
          <Divider sx={{ mb: 3 }} />

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

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                name="title"
                label="Quiz Title"
                value={formData.title}
                onChange={handleInputChange}
                required
                error={!formData.title.trim()}
                helperText={!formData.title.trim() ? "Title is required" : ""}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                select
                fullWidth
                name="subject"
                label="Subject"
                value={formData.subject}
                onChange={handleInputChange}
                required
                error={!formData.subject}
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
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                name="timeLimit"
                label="Time Limit (minutes)"
                type="number"
                value={formData.timeLimit}
                onChange={handleInputChange}
                required
                InputProps={{ inputProps: { min: 1 } }}
                error={formData.timeLimit < 1}
                helperText={
                  formData.timeLimit < 1
                    ? "Time limit must be at least 1 minute"
                    : ""
                }
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                select
                fullWidth
                name="difficulty"
                label="Difficulty"
                value={formData.difficulty}
                onChange={handleInputChange}
                required
              >
                {["easy", "medium", "hard"].map((option) => (
                  <MenuItem key={option} value={option}>
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                name="description"
                label="Description"
                value={formData.description}
                onChange={handleInputChange}
                multiline
                rows={4}
              />
            </Grid>

            <Grid item xs={12}>
              <Button
                variant="contained"
                component="label"
                startIcon={<UploadIcon />}
              >
                Upload Question Files
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
                    <FileIcon sx={{ mr: 2 }} />
                    <ListItemText
                      primary={file.name}
                      secondary={`${(file.size / 1024).toFixed(2)} KB`}
                    />
                  </ListItem>
                ))}
              </List>
            </Grid>

            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={loading || files.length === 0}
                onClick={handleSubmit}
                startIcon={loading ? <CircularProgress size={20} /> : null}
              >
                {loading ? "Creating Quiz..." : "Create Quiz"}
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default QuizManagement;
