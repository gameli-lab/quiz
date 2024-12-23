import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Tabs,
  Tab,
  Typography,
  TextField,
  //   Switch,
  Button,
  Alert,
  CircularProgress,
  Grid,
  Card,
  CardContent,
} from "@mui/material";

const SystemSettings = () => {
  const [settings, setSettings] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await axios.get("/api/system/settings", {
        headers: { Authorization: localStorage.getItem("token") },
      });
      setSettings(res.data);
      setLoading(false);
    } catch (error) {
      setError("Failed to load settings");
      setLoading(false);
    }
  };

  const handleSettingChange = (section, field, value) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const saveSettings = async () => {
    try {
      await axios.put("/api/system/settings", settings, {
        headers: { Authorization: localStorage.getItem("token") },
      });
      setMessage("Settings saved successfully");
    } catch (error) {
      setError("Failed to save settings");
    }
  };

  if (loading) return <CircularProgress />;

  return (
    <Box sx={{ width: "100%" }}>
      {message && <Alert severity="success">{message}</Alert>}
      {error && <Alert severity="error">{error}</Alert>}

      <Tabs
        value={activeTab}
        onChange={(e, newValue) => setActiveTab(newValue)}
      >
        <Tab label="Quiz Settings" />
        <Tab label="Security" />
        <Tab label="Email" />
        <Tab label="Maintenance" />
        <Tab label="Branding" />
      </Tabs>

      <Box sx={{ mt: 3 }}>
        {activeTab === 0 && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6">Quiz Configuration</Typography>
                  <TextField
                    fullWidth
                    label="Max Questions Per Quiz"
                    type="number"
                    value={settings.quiz.maxQuestionsPerQuiz}
                    onChange={(e) =>
                      handleSettingChange(
                        "quiz",
                        "maxQuestionsPerQuiz",
                        e.target.value
                      )
                    }
                    margin="normal"
                  />
                  <TextField
                    fullWidth
                    label="Time Limit (minutes)"
                    type="number"
                    value={settings.quiz.timeLimit}
                    onChange={(e) =>
                      handleSettingChange("quiz", "timeLimit", e.target.value)
                    }
                    margin="normal"
                  />
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Add similar sections for other tabs */}

        <Box sx={{ mt: 3 }}>
          <Button variant="contained" color="primary" onClick={saveSettings}>
            Save Settings
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default SystemSettings;
