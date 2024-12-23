import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  IconButton,
  CircularProgress,
  Chip,
} from "@mui/material";
import {
  Backup as BackupIcon,
  Restore as RestoreIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon,
  Schedule as ScheduleIcon,
} from "@mui/icons-material";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider, DateTimePicker } from "@mui/x-date-pickers";

const BackupManagement = () => {
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [openScheduleDialog, setOpenScheduleDialog] = useState(false);
  const [openRestoreDialog, setOpenRestoreDialog] = useState(false);
  const [selectedBackup, setSelectedBackup] = useState(null);
  const [scheduleTime, setScheduleTime] = useState(new Date());
  const [backupInProgress, setBackupInProgress] = useState(false);

  const fetchBackups = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/system/backups", {
        headers: { Authorization: localStorage.getItem("token") },
      });
      setBackups(response.data);
      setError("");
    } catch (err) {
      setError("Failed to fetch backups");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBackups();
  }, []);

  const createBackup = async () => {
    try {
      setBackupInProgress(true);
      setError("");
      await axios.post(
        "/api/system/backup",
        {},
        {
          headers: { Authorization: localStorage.getItem("token") },
        }
      );
      setSuccess("Backup created successfully");
      fetchBackups();
    } catch (err) {
      setError("Failed to create backup");
    } finally {
      setBackupInProgress(false);
    }
  };

  const scheduleBackup = async () => {
    try {
      await axios.post(
        "/api/system/backup/schedule",
        {
          scheduledTime: scheduleTime,
        },
        {
          headers: { Authorization: localStorage.getItem("token") },
        }
      );
      setSuccess("Backup scheduled successfully");
      setOpenScheduleDialog(false);
    } catch (err) {
      setError("Failed to schedule backup");
    }
  };

  const restoreBackup = async () => {
    try {
      setError("");
      await axios.post(
        "/api/system/restore",
        {
          filepath: selectedBackup.path,
        },
        {
          headers: { Authorization: localStorage.getItem("token") },
        }
      );
      setSuccess("System restored successfully");
      setOpenRestoreDialog(false);
    } catch (err) {
      setError("Failed to restore backup");
    }
  };

  const deleteBackup = async (backup) => {
    if (!window.confirm("Are you sure you want to delete this backup?")) return;

    try {
      await axios.delete(`/api/system/backup/${backup._id}`, {
        headers: { Authorization: localStorage.getItem("token") },
      });
      setSuccess("Backup deleted successfully");
      fetchBackups();
    } catch (err) {
      setError("Failed to delete backup");
    }
  };

  const downloadBackup = async (backup) => {
    try {
      const response = await axios.get(
        `/api/system/backup/download/${backup._id}`,
        {
          headers: { Authorization: localStorage.getItem("token") },
          responseType: "blob",
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `backup-${backup.created}.gz`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError("Failed to download backup");
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {loading ? (
        <CircularProgress />
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography variant="h4">Backup Management</Typography>
              <Box>
                <Button
                  variant="contained"
                  startIcon={<BackupIcon />}
                  onClick={createBackup}
                  disabled={backupInProgress}
                  sx={{ mr: 2 }}
                >
                  {backupInProgress ? (
                    <CircularProgress size={24} />
                  ) : (
                    "Create Backup"
                  )}
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<ScheduleIcon />}
                  onClick={() => setOpenScheduleDialog(true)}
                >
                  Schedule Backup
                </Button>
              </Box>
            </Box>
          </Grid>

          {error && (
            <Grid item xs={12}>
              <Alert severity="error">{error}</Alert>
            </Grid>
          )}

          {success && (
            <Grid item xs={12}>
              <Alert severity="success">{success}</Alert>
            </Grid>
          )}

          <Grid item xs={12}>
            <Card>
              <CardContent>
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Backup Date</TableCell>
                        <TableCell>Size</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {backups.map((backup) => (
                        <TableRow key={backup._id}>
                          <TableCell>
                            {new Date(backup.created).toLocaleString()}
                          </TableCell>
                          <TableCell>{backup.size}</TableCell>
                          <TableCell>
                            <Chip
                              label={backup.status}
                              color={
                                backup.status === "completed"
                                  ? "success"
                                  : "warning"
                              }
                            />
                          </TableCell>
                          <TableCell>
                            <IconButton
                              onClick={() => downloadBackup(backup)}
                              title="Download"
                            >
                              <DownloadIcon />
                            </IconButton>
                            <IconButton
                              onClick={() => {
                                setSelectedBackup(backup);
                                setOpenRestoreDialog(true);
                              }}
                              title="Restore"
                            >
                              <RestoreIcon />
                            </IconButton>
                            <IconButton
                              onClick={() => deleteBackup(backup)}
                              title="Delete"
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
        </Grid>
      )}

      {/* Schedule Backup Dialog */}
      <Dialog
        open={openScheduleDialog}
        onClose={() => setOpenScheduleDialog(false)}
      >
        <DialogTitle>Schedule Backup</DialogTitle>
        <DialogContent>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DateTimePicker
              label="Backup Time"
              value={scheduleTime}
              onChange={setScheduleTime}
              renderInput={(params) => (
                <TextField {...params} fullWidth sx={{ mt: 2 }} />
              )}
              minDateTime={new Date()}
            />
          </LocalizationProvider>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenScheduleDialog(false)}>Cancel</Button>
          <Button onClick={scheduleBackup} variant="contained">
            Schedule
          </Button>
        </DialogActions>
      </Dialog>

      {/* Restore Confirmation Dialog */}
      <Dialog
        open={openRestoreDialog}
        onClose={() => setOpenRestoreDialog(false)}
      >
        <DialogTitle>Confirm Restore</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to restore the system to this backup point?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenRestoreDialog(false)}>Cancel</Button>
          <Button onClick={restoreBackup} variant="contained" color="warning">
            Restore
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BackupManagement;
