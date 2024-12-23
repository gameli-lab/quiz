import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  MenuItem,
  Button,
  IconButton,
  Typography,
  Grid,
  CircularProgress,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import RefreshIcon from "@mui/icons-material/Refresh";

const ActivityLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filters, setFilters] = useState({
    startDate: null,
    endDate: null,
    action: "",
    userId: "",
  });

  const actionTypes = [
    "LOGIN",
    "LOGOUT",
    "QUIZ_CREATE",
    "QUIZ_APPROVE",
    "QUIZ_DELETE",
    "USER_SUSPEND",
    "SETTINGS_UPDATE",
  ];

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.startDate)
        params.append("startDate", filters.startDate.toISOString());
      if (filters.endDate)
        params.append("endDate", filters.endDate.toISOString());
      if (filters.action) params.append("action", filters.action);
      if (filters.userId) params.append("userId", filters.userId);

      const response = await axios.get(`/api/system/activity-logs?${params}`, {
        headers: { Authorization: localStorage.getItem("token") },
      });
      setLogs(response.data);
    } catch (error) {
      console.error("Failed to fetch logs:", error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const exportLogs = () => {
    const csv = [
      ["Timestamp", "User", "Action", "Details", "IP Address"],
      ...logs.map((log) => [
        new Date(log.timestamp).toLocaleString(),
        log.user.name,
        log.action,
        JSON.stringify(log.details),
        log.ipAddress,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "activity-logs.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Box sx={{ p: 3 }}>
      {loading ? (
        <CircularProgress />
      ) : (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12}>
            <Typography variant="h5" sx={{ mb: 2 }}>
              Activity Logs
              <IconButton onClick={fetchLogs} size="small" sx={{ ml: 1 }}>
                <RefreshIcon />
              </IconButton>
            </Typography>
          </Grid>

          <Grid item xs={12} md={3}>
            <DatePicker
              label="Start Date"
              value={filters.startDate}
              onChange={(date) =>
                setFilters((prev) => ({ ...prev, startDate: date }))
              }
              renderInput={(params) => <TextField {...params} fullWidth />}
            />
          </Grid>

          <Grid item xs={12} md={3}>
            <DatePicker
              label="End Date"
              value={filters.endDate}
              onChange={(date) =>
                setFilters((prev) => ({ ...prev, endDate: date }))
              }
              renderInput={(params) => <TextField {...params} fullWidth />}
            />
          </Grid>

          <Grid item xs={12} md={3}>
            <TextField
              select
              fullWidth
              label="Action Type"
              value={filters.action}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, action: e.target.value }))
              }
            >
              <MenuItem value="">All Actions</MenuItem>
              {actionTypes.map((action) => (
                <MenuItem key={action} value={action}>
                  {action}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} md={3}>
            <Button
              variant="contained"
              startIcon={<FileDownloadIcon />}
              onClick={exportLogs}
              fullWidth
            >
              Export Logs
            </Button>
          </Grid>
        </Grid>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Timestamp</TableCell>
              <TableCell>User</TableCell>
              <TableCell>Action</TableCell>
              <TableCell>Details</TableCell>
              <TableCell>IP Address</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {logs
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((log) => (
                <TableRow key={log._id}>
                  <TableCell>
                    {new Date(log.timestamp).toLocaleString()}
                  </TableCell>
                  <TableCell>{log.user.name}</TableCell>
                  <TableCell>{log.action}</TableCell>
                  <TableCell>{JSON.stringify(log.details)}</TableCell>
                  <TableCell>{log.ipAddress}</TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[10, 25, 50]}
          component="div"
          count={logs.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>
    </Box>
  );
};

export default ActivityLogs;
