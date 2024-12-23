import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  //   Dialog,
  //   DialogTitle,
  //   DialogContent,
  //   DialogActions,
  Alert,
  Paper,
  //   Divider,
  Tab,
  Tabs,
  Tooltip,
  Chip,
  CircularProgress,
} from "@mui/material";
import {
  Edit as EditIcon,
  //   Preview as PreviewIcon,
  Send as SendIcon,
  Save as SaveIcon,
  //   Delete as DeleteIcon,
  FileCopy as CloneIcon,
} from "@mui/icons-material";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

const EmailTemplates = () => {
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [editMode, setEditMode] = useState(false);
  //   const [previewMode, setPreviewMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [testEmail, setTestEmail] = useState("");
  const [currentTab, setCurrentTab] = useState(0);

  // Template variables for different types
  const templateVariables = {
    welcome: ["{{userName}}", "{{userEmail}}", "{{loginLink}}"],
    quizApproved: ["{{quizTitle}}", "{{teacherName}}", "{{approvalDate}}"],
    quizRejected: ["{{quizTitle}}", "{{teacherName}}", "{{rejectionReason}}"],
    accountSuspended: [
      "{{userName}}",
      "{{suspensionReason}}",
      "{{contactEmail}}",
    ],
  };

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/admin/email-templates", {
        headers: { Authorization: localStorage.getItem("token") },
      });
      setTemplates(response.data);
      setError("");
    } catch (err) {
      setError("Failed to fetch email templates");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleSaveTemplate = async () => {
    try {
      await axios.put(
        `/api/admin/email-templates/${selectedTemplate._id}`,
        selectedTemplate,
        {
          headers: { Authorization: localStorage.getItem("token") },
        }
      );
      setSuccess("Template saved successfully");
      fetchTemplates();
      setEditMode(false);
    } catch (err) {
      setError("Failed to save template");
    }
  };

  const handleTestEmail = async () => {
    try {
      await axios.post(
        "/api/admin/email-templates/test",
        {
          templateId: selectedTemplate._id,
          testEmail,
          testData: generateTestData(selectedTemplate.type),
        },
        {
          headers: { Authorization: localStorage.getItem("token") },
        }
      );
      setSuccess("Test email sent successfully");
    } catch (err) {
      setError("Failed to send test email");
    }
  };

  const generateTestData = (templateType) => {
    const testData = {
      welcome: {
        userName: "John Doe",
        userEmail: "john@example.com",
        loginLink: "https://example.com/login",
      },
      quizApproved: {
        quizTitle: "Mathematics 101",
        teacherName: "Prof. Smith",
        approvalDate: new Date().toLocaleDateString(),
      },
      // Add more test data for other template types
    };
    return testData[templateType] || {};
  };

  const handleCloneTemplate = async (template) => {
    try {
      await axios.post(
        "/api/admin/email-templates/clone",
        { templateId: template._id },
        {
          headers: { Authorization: localStorage.getItem("token") },
        }
      );
      setSuccess("Template cloned successfully");
      fetchTemplates();
    } catch (err) {
      setError("Failed to clone template");
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {loading ? (
        <CircularProgress />
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h4" gutterBottom>
              Email Templates
            </Typography>
          </Grid>

          {(error || success) && (
            <Grid item xs={12}>
              {error && <Alert severity="error">{error}</Alert>}
              {success && <Alert severity="success">{success}</Alert>}
            </Grid>
          )}

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Template List
                </Typography>
                <List>
                  {templates.map((template) => (
                    <ListItem
                      key={template._id}
                      button
                      selected={selectedTemplate?._id === template._id}
                      onClick={() => setSelectedTemplate(template)}
                    >
                      <ListItemText
                        primary={template.name}
                        secondary={template.description}
                      />
                      <ListItemSecondaryAction>
                        <Tooltip title="Clone Template">
                          <IconButton
                            edge="end"
                            onClick={() => handleCloneTemplate(template)}
                          >
                            <CloneIcon />
                          </IconButton>
                        </Tooltip>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={8}>
            {selectedTemplate && (
              <Card>
                <CardContent>
                  <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
                    <Tabs
                      value={currentTab}
                      onChange={(e, newValue) => setCurrentTab(newValue)}
                    >
                      <Tab label="Edit" />
                      <Tab label="Preview" />
                      <Tab label="Test" />
                    </Tabs>
                  </Box>

                  {currentTab === 0 && (
                    <Box>
                      <TextField
                        fullWidth
                        label="Template Name"
                        value={selectedTemplate.name}
                        onChange={(e) =>
                          setSelectedTemplate({
                            ...selectedTemplate,
                            name: e.target.value,
                          })
                        }
                        disabled={!editMode}
                        margin="normal"
                      />
                      <Box sx={{ my: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Available Variables:
                        </Typography>
                        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                          {templateVariables[selectedTemplate.type]?.map(
                            (variable) => (
                              <Chip
                                key={variable}
                                label={variable}
                                onClick={() => {
                                  // Insert variable at cursor position in editor
                                }}
                              />
                            )
                          )}
                        </Box>
                      </Box>
                      <ReactQuill
                        value={selectedTemplate.content}
                        onChange={(content) =>
                          setSelectedTemplate({
                            ...selectedTemplate,
                            content,
                          })
                        }
                        readOnly={!editMode}
                        modules={{
                          toolbar: editMode
                            ? [
                                [{ header: [1, 2, false] }],
                                ["bold", "italic", "underline", "strike"],
                                [{ color: [] }, { background: [] }],
                                [{ list: "ordered" }, { list: "bullet" }],
                                ["link", "image"],
                                ["clean"],
                              ]
                            : false,
                        }}
                      />
                    </Box>
                  )}

                  {currentTab === 1 && (
                    <Box>
                      <Paper sx={{ p: 3 }}>
                        <div
                          dangerouslySetInnerHTML={{
                            __html: selectedTemplate.content.replace(
                              /{{(\w+)}}/g,
                              (match, variable) => {
                                const testData = generateTestData(
                                  selectedTemplate.type
                                );
                                return testData[variable] || match;
                              }
                            ),
                          }}
                        />
                      </Paper>
                    </Box>
                  )}

                  {currentTab === 2 && (
                    <Box>
                      <TextField
                        fullWidth
                        label="Test Email Address"
                        value={testEmail}
                        onChange={(e) => setTestEmail(e.target.value)}
                        margin="normal"
                      />
                      <Button
                        variant="contained"
                        startIcon={<SendIcon />}
                        onClick={handleTestEmail}
                        sx={{ mt: 2 }}
                      >
                        Send Test Email
                      </Button>
                    </Box>
                  )}

                  <Box
                    sx={{
                      mt: 2,
                      display: "flex",
                      justifyContent: "flex-end",
                      gap: 1,
                    }}
                  >
                    {!editMode ? (
                      <Button
                        variant="contained"
                        startIcon={<EditIcon />}
                        onClick={() => setEditMode(true)}
                      >
                        Edit Template
                      </Button>
                    ) : (
                      <>
                        <Button
                          variant="outlined"
                          onClick={() => setEditMode(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="contained"
                          startIcon={<SaveIcon />}
                          onClick={handleSaveTemplate}
                        >
                          Save Changes
                        </Button>
                      </>
                    )}
                  </Box>
                </CardContent>
              </Card>
            )}
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default EmailTemplates;
