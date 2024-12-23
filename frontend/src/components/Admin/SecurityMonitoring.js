import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  //   Paper,
  Button,
  IconButton,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  //   Switch,
  //   Chip,
  //   Tooltip,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  MenuItem,
} from "@mui/material";
import {
  Block as BlockIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  //   Security as SecurityIcon,
  //   Warning as WarningIcon,
  //   Timeline as TimelineIcon,
} from "@mui/icons-material";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  ResponsiveContainer,
} from "recharts";

const SecurityMonitoring = () => {
  const [loginAttempts, setLoginAttempts] = useState([]);
  const [activeSessions, setActiveSessions] = useState([]);
  const [blockedIPs, setBlockedIPs] = useState([]);
  const [securityAlerts, setSecurityAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [openBlockDialog, setOpenBlockDialog] = useState(false);
  const [ipToBlock, setIpToBlock] = useState("");
  const [blockReason, setBlockReason] = useState("");
  const [securityMetrics, setSecurityMetrics] = useState({});
  const [selectedTimeRange, setSelectedTimeRange] = useState("24h");

  // Fetch security data
  const fetchSecurityData = useCallback(async () => {
    try {
      setLoading(true);
      const [attemptsRes, sessionsRes, blockedRes, alertsRes, metricsRes] =
        await Promise.all(
          [
            axios.get(
              `/api/admin/security/login-attempts?range=${selectedTimeRange}`
            ),
            axios.get("/api/admin/security/active-sessions"),
            axios.get("/api/admin/security/blocked-ips"),
            axios.get("/api/admin/security/alerts"),
            axios.get(`/api/admin/security/metrics?range=${selectedTimeRange}`),
          ].map((request) => request.catch((err) => ({ data: [] })))
        );

      setLoginAttempts(attemptsRes.data);
      setActiveSessions(sessionsRes.data);
      setBlockedIPs(blockedRes.data);
      setSecurityAlerts(alertsRes.data);
      setSecurityMetrics(metricsRes.data);
      setError("");
    } catch (err) {
      setError("Failed to fetch security data");
    } finally {
      setLoading(false);
    }
  }, [selectedTimeRange]);

  useEffect(() => {
    fetchSecurityData();
    const interval = setInterval(fetchSecurityData, 30000);
    return () => clearInterval(interval);
  }, [fetchSecurityData]);

  // Handle IP blocking
  const handleBlockIP = async () => {
    try {
      await axios.post(
        "/api/admin/security/block-ip",
        {
          ip: ipToBlock,
          reason: blockReason,
        },
        {
          headers: { Authorization: localStorage.getItem("token") },
        }
      );
      setSuccess("IP blocked successfully");
      setOpenBlockDialog(false);
      fetchSecurityData();
    } catch (err) {
      setError("Failed to block IP");
    }
  };

  // Handle session termination
  const handleTerminateSession = async (sessionId) => {
    try {
      await axios.delete(`/api/admin/security/sessions/${sessionId}`, {
        headers: { Authorization: localStorage.getItem("token") },
      });
      setSuccess("Session terminated successfully");
      fetchSecurityData();
    } catch (err) {
      setError("Failed to terminate session");
    }
  };

  // Handle alert dismissal
  /*   const handleDismissAlert = async (alertId) => {
    try {
      await axios.put(
        `/api/admin/security/alerts/${alertId}/dismiss`,
        {},
        {
          headers: { Authorization: localStorage.getItem("token") },
        }
      );
      setSuccess("Alert dismissed");
      fetchSecurityData();
    } catch (err) {
      setError("Failed to dismiss alert");
    }
  };
 */
  return (
    <Box sx={{ p: 3 }}>
      {loading ? (
        <CircularProgress />
      ) : (
        <Grid container spacing={3}>
          {error && (
            <Grid item xs={12}>
              <Alert severity="error" onClose={() => setError("")}>
                {error}
              </Alert>
            </Grid>
          )}
          {success && (
            <Grid item xs={12}>
              <Alert severity="success" onClose={() => setSuccess("")}>
                {success}
              </Alert>
            </Grid>
          )}
          {/* Header */}
          <Grid item xs={12}>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography variant="h4">
                Security Monitoring
                <IconButton
                  onClick={fetchSecurityData}
                  size="small"
                  sx={{ ml: 1 }}
                >
                  <RefreshIcon />
                </IconButton>
              </Typography>
              <Box>
                <TextField
                  select
                  value={selectedTimeRange}
                  onChange={(e) => setSelectedTimeRange(e.target.value)}
                  sx={{ mr: 2 }}
                >
                  <MenuItem value="24h">Last 24 Hours</MenuItem>
                  <MenuItem value="7d">Last 7 Days</MenuItem>
                  <MenuItem value="30d">Last 30 Days</MenuItem>
                </TextField>
                <Button
                  variant="contained"
                  startIcon={<BlockIcon />}
                  onClick={() => setOpenBlockDialog(true)}
                >
                  Block IP
                </Button>
              </Box>
            </Box>
          </Grid>

          {/* Alerts */}
          {securityAlerts.length > 0 && (
            <Grid item xs={12}>
              <Alert
                severity="warning"
                action={
                  <Button color="inherit" size="small">
                    View All
                  </Button>
                }
              >
                {securityAlerts.length} active security alerts require attention
              </Alert>
            </Grid>
          )}

          {/* Security Metrics */}
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Failed Login Attempts
                </Typography>
                <Typography variant="h3">
                  {securityMetrics.failedLogins || 0}
                </Typography>
                <Typography color="textSecondary">Last 24 hours</Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Active Sessions
                </Typography>
                <Typography variant="h3">{activeSessions.length}</Typography>
                <Typography color="textSecondary">Current</Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Blocked IPs
                </Typography>
                <Typography variant="h3">{blockedIPs.length}</Typography>
                <Typography color="textSecondary">Total</Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Security Score
                </Typography>
                <Typography variant="h3">
                  {securityMetrics.securityScore || 0}/100
                </Typography>
                <Typography color="textSecondary">System Health</Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Login Attempts Chart */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Login Attempts Over Time
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={loginAttempts}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="timestamp" />
                    <YAxis />
                    <ChartTooltip />
                    <Line
                      type="monotone"
                      dataKey="successful"
                      stroke="#4caf50"
                      name="Successful"
                    />
                    <Line
                      type="monotone"
                      dataKey="failed"
                      stroke="#f44336"
                      name="Failed"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Active Sessions */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Active Sessions
                </Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>User</TableCell>
                        <TableCell>IP Address</TableCell>
                        <TableCell>Duration</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {activeSessions.map((session) => (
                        <TableRow key={session._id}>
                          <TableCell>{session.userName}</TableCell>
                          <TableCell>{session.ipAddress}</TableCell>
                          <TableCell>
                            {Math.round(
                              (Date.now() - new Date(session.startTime)) / 60000
                            )}
                            m
                          </TableCell>
                          <TableCell>
                            <IconButton
                              onClick={() =>
                                handleTerminateSession(session._id)
                              }
                              color="error"
                            >
                              <DeleteIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Blocked IPs */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Blocked IPs
                </Typography>
                <List>
                  {blockedIPs.map((ip) => (
                    <ListItem key={ip._id}>
                      <ListItemText
                        primary={ip.address}
                        secondary={`Blocked on: ${new Date(
                          ip.blockedAt
                        ).toLocaleString()}`}
                      />
                      <ListItemSecondaryAction>
                        <IconButton
                          edge="end"
                          onClick={() => {
                            // Handle unblock IP
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Block IP Dialog */}
      <Dialog open={openBlockDialog} onClose={() => setOpenBlockDialog(false)}>
        <DialogTitle>Block IP Address</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="IP Address"
            value={ipToBlock}
            onChange={(e) => setIpToBlock(e.target.value)}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Reason"
            value={blockReason}
            onChange={(e) => setBlockReason(e.target.value)}
            margin="normal"
            multiline
            rows={3}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenBlockDialog(false)}>Cancel</Button>
          <Button onClick={handleBlockIP} variant="contained" color="error">
            Block IP
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SecurityMonitoring;
