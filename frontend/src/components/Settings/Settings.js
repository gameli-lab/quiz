import React, { useState, useEffect } from "react";
import axios from "axios";
import { useTheme } from "../../contexts/ThemeContext";
import "./Settings.css";
import {
  Switch,
  FormControlLabel,
  Paper,
  Typography,
  Button,
  Snackbar,
} from "@mui/material";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import NotificationsIcon from "@mui/icons-material/Notifications";

const Settings = () => {
  const { darkMode, toggleTheme } = useTheme();
  const [settings, setSettings] = useState({
    emailNotifications: false,
    quizReminders: false,
    resultNotifications: false,
  });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [showMessage, setShowMessage] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await axios.get(
        "https://quiz-master-2hwm.onrender.com/api/users/settings",
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setSettings(response.data.settings);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching settings:", error);
      setMessage("Error loading settings");
      setShowMessage(true);
      setLoading(false);
    }
  };

  const handleSettingChange = (setting) => {
    setSettings((prev) => ({
      ...prev,
      [setting]: !prev[setting],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(
        "/api/users/settings",
        { settings },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setMessage("Settings saved successfully");
      setShowMessage(true);
    } catch (error) {
      console.error("Error saving settings:", error);
      setMessage("Error saving settings");
      setShowMessage(true);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="settings-container">
      <Paper elevation={3} className="settings-paper">
        <Typography variant="h4" gutterBottom>
          Settings
        </Typography>

        <div className="settings-section">
          <Typography variant="h6" gutterBottom>
            Theme
          </Typography>
          <FormControlLabel
            control={
              <Switch
                checked={darkMode}
                onChange={toggleTheme}
                color="primary"
              />
            }
            label={
              <div className="setting-label">
                <DarkModeIcon />
                <span>Dark Mode</span>
              </div>
            }
          />
        </div>

        <div className="settings-section">
          <Typography variant="h6" gutterBottom>
            Notifications
          </Typography>
          <form onSubmit={handleSubmit}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.emailNotifications}
                  onChange={() => handleSettingChange("emailNotifications")}
                  color="primary"
                />
              }
              label={
                <div className="setting-label">
                  <NotificationsIcon />
                  <span>Email Notifications</span>
                </div>
              }
            />
            <FormControlLabel
              control={
                <Switch
                  checked={settings.quizReminders}
                  onChange={() => handleSettingChange("quizReminders")}
                  color="primary"
                />
              }
              label={
                <div className="setting-label">
                  <NotificationsIcon />
                  <span>Quiz Reminders</span>
                </div>
              }
            />
            <FormControlLabel
              control={
                <Switch
                  checked={settings.resultNotifications}
                  onChange={() => handleSettingChange("resultNotifications")}
                  color="primary"
                />
              }
              label={
                <div className="setting-label">
                  <NotificationsIcon />
                  <span>Result Notifications</span>
                </div>
              }
            />
            <Button
              variant="contained"
              color="primary"
              type="submit"
              className="save-button"
            >
              Save Settings
            </Button>
          </form>
        </div>
      </Paper>

      <Snackbar
        open={showMessage}
        autoHideDuration={6000}
        onClose={() => setShowMessage(false)}
        message={message}
      />
    </div>
  );
};

export default Settings;
