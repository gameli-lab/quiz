import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../contexts/AuthContext";
import axios from "axios";
import "./Profile.css";
import {
  Container,
  Paper,
  Grid,
  Avatar,
  Typography,
  TextField,
  Button,
  Box,
  Divider,
  IconButton,
  Snackbar,
  Alert,
  Card,
  CardContent,
  CircularProgress,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";

const Profile = () => {
  const { user, updateUser } = useContext(AuthContext);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    bio: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [avatar, setAvatar] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [message, setMessage] = useState({ type: "", text: "" });
  const [isEditing, setIsEditing] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);

  // Fetch user data directly if not available from context
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          "https://quiz-master-2hwm.onrender.com/api/users/me",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setUserData(response.data);
      } catch (error) {
        console.error("Error fetching user data:", error);
        setMessage({
          type: "error",
          text: "Failed to load profile data",
        });
        setOpenSnackbar(true);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      setUserData(user);
      setLoading(false);
    } else {
      fetchUserData();
    }
  }, [user]);

  // Update form when user data is available
  useEffect(() => {
    if (userData) {
      setFormData({
        name: userData.name || "",
        email: userData.email || "",
        bio: userData.bio || "",
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      const avatarUrl = userData.avatar
        ? `/uploads/avatars/${userData.avatar}`
        : "/default-avatar.png";
      setPreviewUrl(avatarUrl);
    }
  }, [userData]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatar(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach((key) => {
        if (formData[key]) formDataToSend.append(key, formData[key]);
      });
      if (avatar) {
        formDataToSend.append("avatar", avatar);
      }

      const response = await axios.put("/api/users/me", formDataToSend, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setUserData(response.data.user);
      if (updateUser) {
        updateUser(response.data.user);
      }
      setMessage({ type: "success", text: "Profile updated successfully!" });
      setOpenSnackbar(true);
      setIsEditing(false);
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Failed to update profile",
      });
      setOpenSnackbar(true);
    }
  };

  if (loading) {
    return (
      <Container sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
        <CircularProgress />
      </Container>
    );
  }

  if (!userData) {
    return (
      <Container sx={{ mt: 5, textAlign: "center" }}>
        <Typography variant="h5" color="error">
          Unable to load profile. Please try again later.
        </Typography>
      </Container>
    );
  }

  // Rest of your component remains the same...
  return (
    <Container maxWidth="md" sx={{ mt: 5, mb: 8 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Typography
          variant="h4"
          component="h1"
          sx={{ mb: 4, fontWeight: "bold", textAlign: "center" }}
        >
          My Profile
        </Typography>

        <form onSubmit={handleSubmit}>
          <Grid container spacing={4}>
            <Grid
              item
              xs={12}
              md={4}
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <Box sx={{ position: "relative", mb: 2 }}>
                <Avatar
                  src={previewUrl}
                  alt={formData.name || "Profile"}
                  sx={{
                    width: 180,
                    height: 180,
                    boxShadow: 3,
                    border: "4px solid #f0f0f0",
                  }}
                />
                {isEditing && (
                  <IconButton
                    component="label"
                    sx={{
                      position: "absolute",
                      bottom: 0,
                      right: 0,
                      backgroundColor: "primary.main",
                      color: "white",
                      "&:hover": {
                        backgroundColor: "primary.dark",
                      },
                    }}
                  >
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={handleAvatarChange}
                    />
                    <PhotoCameraIcon />
                  </IconButton>
                )}
              </Box>

              <Card variant="outlined" sx={{ width: "100%", mb: 2 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Account Information
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Role:{" "}
                    {user?.role &&
                      user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Member since:{" "}
                    {user?.createdAt
                      ? new Date(user.createdAt).toLocaleDateString()
                      : "N/A"}
                  </Typography>
                </CardContent>
              </Card>

              {!isEditing ? (
                <Button
                  variant="contained"
                  startIcon={<EditIcon />}
                  onClick={() => setIsEditing(true)}
                  fullWidth
                >
                  Edit Profile
                </Button>
              ) : null}
            </Grid>

            <Grid item xs={12} md={8}>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Personal Details
                </Typography>
                <TextField
                  fullWidth
                  margin="normal"
                  label="Full Name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  variant={isEditing ? "outlined" : "filled"}
                  InputProps={{ readOnly: !isEditing }}
                />
                <TextField
                  fullWidth
                  margin="normal"
                  label="Email Address"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  variant={isEditing ? "outlined" : "filled"}
                  InputProps={{ readOnly: !isEditing }}
                />
                <TextField
                  fullWidth
                  margin="normal"
                  label="Bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  multiline
                  rows={4}
                  variant={isEditing ? "outlined" : "filled"}
                  InputProps={{ readOnly: !isEditing }}
                  placeholder={isEditing ? "Tell us about yourself" : ""}
                />
              </Box>

              {isEditing && (
                <>
                  <Divider sx={{ my: 3 }} />
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" gutterBottom>
                      Change Password
                    </Typography>
                    <TextField
                      fullWidth
                      margin="normal"
                      label="Current Password"
                      name="currentPassword"
                      type="password"
                      value={formData.currentPassword}
                      onChange={handleInputChange}
                    />
                    <TextField
                      fullWidth
                      margin="normal"
                      label="New Password"
                      name="newPassword"
                      type="password"
                      value={formData.newPassword}
                      onChange={handleInputChange}
                    />
                    <TextField
                      fullWidth
                      margin="normal"
                      label="Confirm New Password"
                      name="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                    />
                  </Box>
                </>
              )}

              {isEditing && (
                <Box
                  sx={{
                    display: "flex",
                    gap: 2,
                    justifyContent: "flex-end",
                    mt: 3,
                  }}
                >
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<CancelIcon />}
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    type="submit"
                    startIcon={<SaveIcon />}
                  >
                    Save Changes
                  </Button>
                </Box>
              )}
            </Grid>
          </Grid>
        </form>
      </Paper>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={message.type === "success" ? "success" : "error"}
          sx={{ width: "100%" }}
        >
          {message.text}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Profile;
