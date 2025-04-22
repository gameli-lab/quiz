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
  CardActions,
  Divider,
  Box,
  Chip,
  Avatar,
  TextField,
  InputAdornment,
  CircularProgress,
  Tabs,
  Tab,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import QuizIcon from "@mui/icons-material/Quiz";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AssessmentIcon from "@mui/icons-material/Assessment";
import PersonIcon from "@mui/icons-material/Person";
// import MoreVertIcon from "@mui/icons-material/MoreVert";
import SortIcon from "@mui/icons-material/Sort";
import "./TeacherDashboard.css";

const TeacherDashboard = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [filteredQuizzes, setFilteredQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [tabValue, setTabValue] = useState(0);
  const [stats, setStats] = useState({
    totalQuizzes: 0,
    totalStudents: 0,
    averageScore: 0,
    completionRate: 0,
  });
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [sortAnchorEl, setSortAnchorEl] = useState(null);
  const [activeFilter, setActiveFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    // Apply filters and search
    let result = [...quizzes];

    // Apply tab/status filter
    if (tabValue === 1) {
      result = result.filter((quiz) => quiz.status === "published");
    } else if (tabValue === 2) {
      result = result.filter((quiz) => quiz.status === "draft");
    } else if (tabValue === 3) {
      result = result.filter((quiz) => quiz.status === "archived");
    }

    // Apply search
    if (searchTerm) {
      result = result.filter(
        (quiz) =>
          quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          quiz.subject.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply sorting
    if (sortBy === "newest") {
      result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortBy === "oldest") {
      result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else if (sortBy === "name") {
      result.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === "popularity") {
      result.sort((a, b) => (b.attempts || 0) - (a.attempts || 0));
    }

    setFilteredQuizzes(result);
  }, [quizzes, searchTerm, tabValue, activeFilter, sortBy]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [quizzesRes, statsRes] = await Promise.all([
        axios.get("/api/quiz/teacher", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }),
        axios.get("/api/teacher/stats", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }),
      ]);

      setQuizzes(quizzesRes.data);
      setFilteredQuizzes(quizzesRes.data);
      setStats(statsRes.data);
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateQuiz = () => {
    navigate("/teacher/create-quiz");
  };

  const handleEditQuiz = (quizId) => {
    navigate(`/teacher/edit-quiz/${quizId}`);
  };

  const handleDeleteQuiz = async (quizId) => {
    if (window.confirm("Are you sure you want to delete this quiz?")) {
      try {
        await axios.delete(`/api/quiz/${quizId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        fetchDashboardData();
      } catch (err) {
        console.error("Failed to delete quiz:", err.message);
      }
    }
  };

  const handleViewResults = (quizId) => {
    navigate(`/teacher/quiz-results/${quizId}`);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleFilterClick = (event) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };

  const handleSortClick = (event) => {
    setSortAnchorEl(event.currentTarget);
  };

  const handleSortClose = () => {
    setSortAnchorEl(null);
  };

  const handleFilterSelect = (filter) => {
    setActiveFilter(filter);
    handleFilterClose();
  };

  const handleSortSelect = (sort) => {
    setSortBy(sort);
    handleSortClose();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "published":
        return "success";
      case "draft":
        return "warning";
      case "archived":
        return "default";
      default:
        return "primary";
    }
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4, textAlign: "center" }}>
        <CircularProgress />
        <Typography variant="h6" mt={2}>
          Loading dashboard...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 3, mb: 8 }}>
      {/* Welcome Section */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          sx={{ fontWeight: "bold" }}
        >
          Teacher Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your quizzes, track student performance, and create engaging
          learning experiences.
        </Typography>
      </Box>

      {/* Stats Overview */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} lg={3}>
          <Card
            variant="outlined"
            sx={{ height: "100%", display: "flex", flexDirection: "column" }}
          >
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <Avatar sx={{ bgcolor: "primary.main", mr: 1 }}>
                  <QuizIcon />
                </Avatar>
                <Typography variant="h6" component="div">
                  Total Quizzes
                </Typography>
              </Box>
              <Typography
                variant="h3"
                component="div"
                sx={{ fontWeight: "bold" }}
              >
                {stats.totalQuizzes}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <Card
            variant="outlined"
            sx={{ height: "100%", display: "flex", flexDirection: "column" }}
          >
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <Avatar sx={{ bgcolor: "info.main", mr: 1 }}>
                  <PersonIcon />
                </Avatar>
                <Typography variant="h6" component="div">
                  Total Students
                </Typography>
              </Box>
              <Typography
                variant="h3"
                component="div"
                sx={{ fontWeight: "bold" }}
              >
                {stats.totalStudents}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <Card
            variant="outlined"
            sx={{ height: "100%", display: "flex", flexDirection: "column" }}
          >
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <Avatar sx={{ bgcolor: "success.main", mr: 1 }}>
                  <AssessmentIcon />
                </Avatar>
                <Typography variant="h6" component="div">
                  Average Score
                </Typography>
              </Box>
              <Typography
                variant="h3"
                component="div"
                sx={{ fontWeight: "bold" }}
              >
                {stats.averageScore}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <Card
            variant="outlined"
            sx={{ height: "100%", display: "flex", flexDirection: "column" }}
          >
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <Avatar sx={{ bgcolor: "warning.main", mr: 1 }}>
                  <AssessmentIcon />
                </Avatar>
                <Typography variant="h6" component="div">
                  Completion Rate
                </Typography>
              </Box>
              <Typography
                variant="h3"
                component="div"
                sx={{ fontWeight: "bold" }}
              >
                {stats.completionRate}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Box sx={{ mb: 4 }}>
        <Button
          variant="contained"
          startIcon={<AddCircleIcon />}
          onClick={handleCreateQuiz}
          size="large"
          sx={{ mb: 2 }}
        >
          Create New Quiz
        </Button>
      </Box>

      {/* Quizzes Section */}
      <Paper
        elevation={0}
        variant="outlined"
        sx={{ p: 3, mb: 4, borderRadius: 2 }}
      >
        <Typography variant="h5" component="h2" gutterBottom>
          Your Quizzes
        </Typography>
        <Divider sx={{ mb: 2 }} />

        {/* Search and Filter Controls */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
            flexWrap: "wrap",
            gap: 1,
          }}
        >
          <TextField
            placeholder="Search quizzes..."
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ flexGrow: 1, maxWidth: { xs: "100%", sm: "300px" } }}
          />

          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              startIcon={<FilterListIcon />}
              variant="outlined"
              size="small"
              onClick={handleFilterClick}
            >
              Filter
            </Button>
            <Menu
              anchorEl={filterAnchorEl}
              open={Boolean(filterAnchorEl)}
              onClose={handleFilterClose}
            >
              <MenuItem
                onClick={() => handleFilterSelect("all")}
                selected={activeFilter === "all"}
              >
                All Quizzes
              </MenuItem>
              <MenuItem
                onClick={() => handleFilterSelect("recent")}
                selected={activeFilter === "recent"}
              >
                Recently Created
              </MenuItem>
              <MenuItem
                onClick={() => handleFilterSelect("popular")}
                selected={activeFilter === "popular"}
              >
                Most Popular
              </MenuItem>
            </Menu>

            <Button
              startIcon={<SortIcon />}
              variant="outlined"
              size="small"
              onClick={handleSortClick}
            >
              Sort
            </Button>
            <Menu
              anchorEl={sortAnchorEl}
              open={Boolean(sortAnchorEl)}
              onClose={handleSortClose}
            >
              <MenuItem
                onClick={() => handleSortSelect("newest")}
                selected={sortBy === "newest"}
              >
                Newest First
              </MenuItem>
              <MenuItem
                onClick={() => handleSortSelect("oldest")}
                selected={sortBy === "oldest"}
              >
                Oldest First
              </MenuItem>
              <MenuItem
                onClick={() => handleSortSelect("name")}
                selected={sortBy === "name"}
              >
                Name (A-Z)
              </MenuItem>
              <MenuItem
                onClick={() => handleSortSelect("popularity")}
                selected={sortBy === "popularity"}
              >
                Most Attempted
              </MenuItem>
            </Menu>
          </Box>
        </Box>

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="All Quizzes" />
            <Tab label="Published" />
            <Tab label="Drafts" />
            <Tab label="Archived" />
          </Tabs>
        </Box>

        {/* Quiz List */}
        {filteredQuizzes.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <Typography variant="body1" color="text.secondary">
              No quizzes found. Create your first quiz to get started!
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={2}>
            {filteredQuizzes.map((quiz) => (
              <Grid item xs={12} sm={6} md={4} key={quiz._id}>
                <Card
                  variant="outlined"
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    position: "relative",
                    transition: "transform 0.2s ease, box-shadow 0.2s ease",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: "0 6px 12px rgba(0,0,0,0.1)",
                    },
                  }}
                >
                  <Box
                    sx={{
                      position: "absolute",
                      top: 12,
                      right: 12,
                    }}
                  >
                    <Chip
                      label={quiz.status}
                      size="small"
                      color={getStatusColor(quiz.status)}
                    />
                  </Box>

                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" component="h3" gutterBottom>
                      {quiz.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 1 }}
                    >
                      {quiz.description?.slice(0, 80)}
                      {quiz.description?.length > 80 ? "..." : ""}
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                      <Chip
                        label={`Subject: ${quiz.subject}`}
                        size="small"
                        sx={{ mr: 1, mb: 1 }}
                      />
                      <Chip
                        label={`Questions: ${quiz.questions?.length || 0}`}
                        size="small"
                        sx={{ mb: 1 }}
                      />
                    </Box>
                  </CardContent>

                  <Divider />

                  <CardActions
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Tooltip title="View Results">
                      <Button
                        size="small"
                        color="primary"
                        startIcon={<AssessmentIcon />}
                        onClick={() => handleViewResults(quiz._id)}
                      >
                        Results
                      </Button>
                    </Tooltip>

                    <Box>
                      <Tooltip title="Edit Quiz">
                        <IconButton
                          size="small"
                          onClick={() => handleEditQuiz(quiz._id)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Quiz">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeleteQuiz(quiz._id)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Paper>
    </Container>
  );
};

export default TeacherDashboard;
