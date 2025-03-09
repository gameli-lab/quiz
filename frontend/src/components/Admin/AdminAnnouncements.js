import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Container,
  // Grid,
  Paper,
  Typography,
  Button,
  TextField,
  // CircularProgress,
  Alert,
  Box,
  Divider,
  Chip,
} from "@mui/material";
import { Add as AddIcon, Delete as DeleteIcon } from "@mui/icons-material";
import "./Admin.css";

const AdminAnnouncements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: "",
    content: "",
  });

  const fetchAnnouncements = async () => {
    try {
      const response = await axios.get("/api/admin/announcements", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setAnnouncements(response.data.announcements || []);
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch announcements");
      setLoading(false);
      console.error("Error fetching announcements:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("/api/admin/announcements", newAnnouncement, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setMessage("Announcement created successfully");
      setNewAnnouncement({ title: "", content: "" });
      fetchAnnouncements(); // Refresh announcements list
    } catch (err) {
      setError("Failed to create announcement");
      console.error("Error creating announcement:", err);
    }
  };

  const handleDelete = async (announcementId) => {
    try {
      await axios.delete(`/api/admin/announcements/${announcementId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setMessage("Announcement deleted successfully");
      fetchAnnouncements(); // Refresh announcements list
    } catch (err) {
      setError("Failed to delete announcement");
      console.error("Error deleting announcement:", err);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  if (loading) return <div className="loading">Loading announcements...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <Container maxWidth="lg" sx={{ mt: 5, mb: 8 }}>
      <Typography variant="h4" gutterBottom>
        Announcements
      </Typography>

      {message && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {message}
        </Alert>
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          Create Announcement
        </Typography>
        <Divider sx={{ mb: 3 }} />
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Title"
            value={newAnnouncement.title}
            onChange={(e) =>
              setNewAnnouncement({ ...newAnnouncement, title: e.target.value })
            }
            required
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Content"
            value={newAnnouncement.content}
            onChange={(e) =>
              setNewAnnouncement({
                ...newAnnouncement,
                content: e.target.value,
              })
            }
            required
            multiline
            rows={4}
            sx={{ mb: 2 }}
          />
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            type="submit"
          >
            Post Announcement
          </Button>
        </form>
      </Paper>

      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Recent Announcements
        </Typography>
        <Divider sx={{ mb: 3 }} />
        {announcements.length === 0 ? (
          <Typography>No recent announcements</Typography>
        ) : (
          announcements.map((announcement) => (
            <Box key={announcement._id} sx={{ mb: 2 }}>
              <Typography variant="h6">{announcement.title}</Typography>
              <Typography>{announcement.content}</Typography>
              <Chip
                label={new Date(announcement.createdAt).toLocaleDateString()}
                sx={{ mt: 1 }}
              />
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={() => handleDelete(announcement._id)}
                sx={{ mt: 1 }}
              >
                Delete
              </Button>
            </Box>
          ))
        )}
      </Paper>
    </Container>
  );
};

export default AdminAnnouncements;
