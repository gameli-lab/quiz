import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Box,
  Divider,
  Chip,
} from "@mui/material";
import {
  People as PeopleIcon,
  Quiz as QuizIcon,
  Pending as PendingIcon,
  Assessment as AssessmentIcon,
  Score as ScoreIcon,
  Announcement as AnnouncementIcon,
  ManageAccounts as ManageAccountsIcon,
  Analytics as AnalyticsIcon,
  // AddCircle as AddCircleIcon,
} from "@mui/icons-material";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState({
    totalUsers: 0,
    totalQuizzes: 0,
    pendingQuizzes: 0,
    activeUsers: 0,
    averageScore: 0,
    totalSubmissions: 0,
    quizzesBySubject: [],
    usersByRole: [],
  });
  const [recentAnnouncements, setRecentAnnouncements] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [analyticsRes, announcementsRes] = await Promise.all([
          axios.get(
            "https://quiz-master-2hwm.onrender.com/api/admin/analytics",
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          ),
          axios.get(
            "https://quiz-master-2hwm.onrender.com/api/admin/announcements/recent",
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          ),
        ]);

        // If the averageScore is an object, extract the avg value
        const averageScoreValue =
          typeof analyticsRes.data.averageScore === "object"
            ? analyticsRes.data.averageScore[0]?.avg || 0
            : analyticsRes.data.averageScore;

        // Format quizzes by subject for display
        const quizzesBySubject =
          analyticsRes.data.quizzesBySubject?.map((item) => ({
            subject: item._id || "Unknown",
            count: item.count || 0,
          })) || [];

        // Format users by role for display
        const usersByRole =
          analyticsRes.data.usersByRole?.map((item) => ({
            name: item._id
              ? item._id.charAt(0).toUpperCase() + item._id.slice(1)
              : "Unknown",
            value: item.count || 0,
          })) || [];

        setAnalytics({
          ...analyticsRes.data,
          averageScore: averageScoreValue,
          quizzesBySubject,
          usersByRole,
        });

        setRecentAnnouncements(announcementsRes.data.announcements || []);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error.message);
        setMessage("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <Container sx={{ textAlign: "center", mt: 5 }}>
        <CircularProgress />
        <Typography variant="h6" mt={2}>
          Loading dashboard data...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 5, mb: 8 }}>
      <Typography variant="h4" gutterBottom>
        Admin Dashboard
      </Typography>

      {message && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {message}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Dashboard Analytics */}
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              System Sammary
            </Typography>
            <Divider sx={{ mb: 3 }} />
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={4}>
                <Card>
                  <CardContent>
                    <PeopleIcon fontSize="large" color="primary" />
                    <Typography variant="h6">Total Users</Typography>
                    <Typography variant="h4">{analytics.totalUsers}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Card>
                  <CardContent>
                    <PeopleIcon fontSize="large" color="primary" />
                    <Typography variant="h6">Active Users</Typography>
                    <Typography variant="h4">
                      {analytics.activeUsers}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Card>
                  <CardContent>
                    <QuizIcon fontSize="large" color="primary" />
                    <Typography variant="h6">Total Quizzes</Typography>
                    <Typography variant="h4">
                      {analytics.totalQuizzes}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Card>
                  <CardContent>
                    <PendingIcon fontSize="large" color="primary" />
                    <Typography variant="h6">Pending Quizzes</Typography>
                    <Typography variant="h4">
                      {analytics.pendingQuizzes}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Card>
                  <CardContent>
                    <AssessmentIcon fontSize="large" color="primary" />
                    <Typography variant="h6">Quiz Submissions</Typography>
                    <Typography variant="h4">
                      {analytics.totalSubmissions}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Card>
                  <CardContent>
                    <ScoreIcon fontSize="large" color="primary" />
                    <Typography variant="h6">Average Score</Typography>
                    <Typography variant="h4">
                      {analytics.averageScore.toFixed(2)}%
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Quiz Distribution by Subject */}
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              Quiz Distribution by Subject
            </Typography>
            <Divider sx={{ mb: 3 }} />
            {analytics.quizzesBySubject.length > 0 ? (
              <Grid container spacing={2}>
                {analytics.quizzesBySubject.map((subject) => (
                  <Grid item key={subject.subject} xs={12} sm={6} md={4}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6">{subject.subject}</Typography>
                        <Typography variant="h4">{subject.count}</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Typography>No quiz data available</Typography>
            )}
          </Paper>
        </Grid>

        {/* User Role Distribution */}
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              User Role Distribution
            </Typography>
            <Divider sx={{ mb: 3 }} />
            {analytics.usersByRole.length > 0 ? (
              <Grid container spacing={2}>
                {analytics.usersByRole.map((role) => (
                  <Grid item key={role.name} xs={12} sm={6} md={4}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6">{role.name}</Typography>
                        <Typography variant="h4">{role.value}</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Typography>No user data available</Typography>
            )}
          </Paper>
        </Grid>

        {/* Recent Announcements */}
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              Recent Announcements
            </Typography>
            <Divider sx={{ mb: 3 }} />
            {recentAnnouncements.length === 0 ? (
              <Typography>No recent announcements</Typography>
            ) : (
              recentAnnouncements.map((announcement) => (
                <Box key={announcement._id} sx={{ mb: 2 }}>
                  <Typography variant="h6">{announcement.title}</Typography>
                  <Typography>{announcement.content}</Typography>
                  <Chip
                    label={new Date(
                      announcement.createdAt
                    ).toLocaleDateString()}
                    sx={{ mt: 1 }}
                  />
                </Box>
              ))
            )}
          </Paper>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              Quick Actions
            </Typography>
            <Divider sx={{ mb: 3 }} />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  variant="contained"
                  startIcon={<QuizIcon />}
                  fullWidth
                  onClick={() => navigate("/admin/quizzes")}
                >
                  Manage Quizzes
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  variant="contained"
                  startIcon={<ManageAccountsIcon />}
                  fullWidth
                  onClick={() => navigate("/admin/users")}
                >
                  Manage Users
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  variant="contained"
                  startIcon={<AnnouncementIcon />}
                  fullWidth
                  onClick={() => navigate("/admin/announcements")}
                >
                  Create Announcement
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  variant="contained"
                  startIcon={<AnalyticsIcon />}
                  fullWidth
                  onClick={() => navigate("/admin/analytics")}
                >
                  View Detailed Analytics
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AdminDashboard;
