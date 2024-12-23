import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Chip,
  Menu,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Alert,
  Tooltip,
  Switch,
  CircularProgress,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  Timeline as TimelineIcon,
  Security as SecurityIcon,
  Mail as MailIcon,
} from "@mui/icons-material";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filters, setFilters] = useState({
    role: "",
    status: "",
    search: "",
  });
  const [selectedUser, setSelectedUser] = useState(null);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openTimelineDialog, setOpenTimelineDialog] = useState(false);
  const [userTimeline, setUserTimeline] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState([]);

  // Fetch users with filters
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        ...filters,
        page: page + 1,
        limit: rowsPerPage,
      });

      const response = await axios.get(`/api/admin/users?${params}`, {
        headers: { Authorization: localStorage.getItem("token") },
      });

      setUsers(response.data.users);
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch users");
      setLoading(false);
    }
  }, [page, rowsPerPage, filters]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Handle bulk actions
  const handleBulkAction = async (action) => {
    try {
      await axios.post(
        "/api/admin/users/bulk-action",
        {
          userIds: selectedUsers,
          action,
        },
        {
          headers: { Authorization: localStorage.getItem("token") },
        }
      );

      setSuccess(`Bulk ${action} completed successfully`);
      fetchUsers();
      setSelectedUsers([]);
    } catch (err) {
      setError(`Failed to perform bulk ${action}`);
    }
  };

  // Handle user update
  const handleUserUpdate = async (userData) => {
    try {
      await axios.put(`/api/admin/users/${selectedUser._id}`, userData, {
        headers: { Authorization: localStorage.getItem("token") },
      });

      setSuccess("User updated successfully");
      setOpenEditDialog(false);
      fetchUsers();
    } catch (err) {
      setError("Failed to update user");
    }
  };

  // Fetch user timeline
  const fetchUserTimeline = async (userId) => {
    try {
      const response = await axios.get(`/api/admin/users/${userId}/timeline`, {
        headers: { Authorization: localStorage.getItem("token") },
      });
      setUserTimeline(response.data);
      setOpenTimelineDialog(true);
    } catch (err) {
      setError("Failed to fetch user timeline");
    }
  };

  // Send notification to user
  const sendNotification = async (userId, message) => {
    try {
      await axios.post(
        `/api/admin/users/${userId}/notify`,
        {
          message,
        },
        {
          headers: { Authorization: localStorage.getItem("token") },
        }
      );
      setSuccess("Notification sent successfully");
    } catch (err) {
      setError("Failed to send notification");
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {loading ? (
        <CircularProgress />
      ) : (
        <>
          {error && (
            <Alert severity="error" onClose={() => setError("")} sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert
              severity="success"
              onClose={() => setSuccess("")}
              sx={{ mb: 2 }}
            >
              {success}
            </Alert>
          )}
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography variant="h4">User Management</Typography>
                <Box>
                  {selectedUsers.length > 0 && (
                    <Box sx={{ display: "inline-flex", gap: 1, mr: 2 }}>
                      <Button
                        variant="outlined"
                        onClick={() => handleBulkAction("suspend")}
                      >
                        Suspend Selected
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        onClick={() => handleBulkAction("delete")}
                      >
                        Delete Selected
                      </Button>
                    </Box>
                  )}
                </Box>
              </Box>
            </Grid>

            {/* Filters */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label="Search Users"
                        value={filters.search}
                        onChange={(e) =>
                          setFilters({ ...filters, search: e.target.value })
                        }
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <FormControl fullWidth>
                        <InputLabel>Role</InputLabel>
                        <Select
                          value={filters.role}
                          onChange={(e) =>
                            setFilters({ ...filters, role: e.target.value })
                          }
                        >
                          <MenuItem value="">All Roles</MenuItem>
                          <MenuItem value="student">Student</MenuItem>
                          <MenuItem value="teacher">Teacher</MenuItem>
                          <MenuItem value="admin">Admin</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <FormControl fullWidth>
                        <InputLabel>Status</InputLabel>
                        <Select
                          value={filters.status}
                          onChange={(e) =>
                            setFilters({ ...filters, status: e.target.value })
                          }
                        >
                          <MenuItem value="">All Status</MenuItem>
                          <MenuItem value="active">Active</MenuItem>
                          <MenuItem value="suspended">Suspended</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Users Table */}
            <Grid item xs={12}>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell padding="checkbox">
                        <Switch
                          checked={selectedUsers.length === users.length}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedUsers(users.map((user) => user._id));
                            } else {
                              setSelectedUsers([]);
                            }
                          }}
                        />
                      </TableCell>
                      <TableCell>Name</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Role</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Last Active</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user._id}>
                        <TableCell padding="checkbox">
                          <Switch
                            checked={selectedUsers.includes(user._id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedUsers([...selectedUsers, user._id]);
                              } else {
                                setSelectedUsers(
                                  selectedUsers.filter((id) => id !== user._id)
                                );
                              }
                            }}
                          />
                        </TableCell>
                        <TableCell>{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Chip
                            label={user.role}
                            color="primary"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={user.suspended ? "Suspended" : "Active"}
                            color={user.suspended ? "error" : "success"}
                          />
                        </TableCell>
                        <TableCell>
                          {user.lastActive
                            ? new Date(user.lastActive).toLocaleString()
                            : "Never"}
                        </TableCell>
                        <TableCell>
                          <Tooltip title="Edit">
                            <IconButton
                              onClick={() => {
                                setSelectedUser(user);
                                setOpenEditDialog(true);
                              }}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="View Timeline">
                            <IconButton
                              onClick={() => fetchUserTimeline(user._id)}
                            >
                              <TimelineIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="More Actions">
                            <IconButton
                              onClick={(e) => {
                                setSelectedUser(user);
                                setAnchorEl(e.currentTarget);
                              }}
                            >
                              <MoreVertIcon />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25]}
                  component="div"
                  count={users.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={(e, newPage) => setPage(newPage)}
                  onRowsPerPageChange={(e) => {
                    setRowsPerPage(parseInt(e.target.value, 10));
                    setPage(0);
                  }}
                />
              </TableContainer>
            </Grid>
          </Grid>

          {/* Context Menu */}
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
          >
            <MenuItem
              onClick={() => {
                sendNotification(selectedUser._id);
                setAnchorEl(null);
              }}
            >
              <MailIcon sx={{ mr: 1 }} /> Send Notification
            </MenuItem>
            <MenuItem
              onClick={() => {
                // Handle reset password
                setAnchorEl(null);
              }}
            >
              <SecurityIcon sx={{ mr: 1 }} /> Reset Password
            </MenuItem>
            <MenuItem
              onClick={() => {
                // Handle delete user
                setAnchorEl(null);
              }}
            >
              <DeleteIcon sx={{ mr: 1 }} /> Delete User
            </MenuItem>
          </Menu>

          {/* Edit User Dialog */}
          <Dialog
            open={openEditDialog}
            onClose={() => setOpenEditDialog(false)}
          >
            <DialogTitle>Edit User</DialogTitle>
            <DialogContent>
              {/* Add form fields for editing user */}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenEditDialog(false)}>Cancel</Button>
              <Button
                onClick={() => handleUserUpdate(selectedUser)}
                variant="contained"
              >
                Save Changes
              </Button>
            </DialogActions>
          </Dialog>

          {/* User Timeline Dialog */}
          <Dialog
            open={openTimelineDialog}
            onClose={() => setOpenTimelineDialog(false)}
            maxWidth="md"
            fullWidth
          >
            <DialogTitle>User Activity Timeline</DialogTitle>
            <DialogContent>
              {userTimeline.map((activity, index) => (
                <Box key={index} sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="textSecondary">
                    {new Date(activity.timestamp).toLocaleString()}
                  </Typography>
                  <Typography>{activity.description}</Typography>
                </Box>
              ))}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenTimelineDialog(false)}>
                Close
              </Button>
            </DialogActions>
          </Dialog>
        </>
      )}
    </Box>
  );
};

export default UserManagement;
