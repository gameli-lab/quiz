import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Admin.css";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const fetchUsers = async () => {
    try {
      const response = await axios.get("/api/admin/users", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setUsers(response.data.users);
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch users");
      setLoading(false);
      console.error("Error fetching users:", err);
    }
  };

  const handleUserAction = async (userId, action) => {
    try {
      if (action === "delete") {
        await axios.delete(`/api/admin/users/${userId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
      } else {
        await axios.post(
          `/api/admin/users/${userId}/${action}`,
          {},
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
      }
      setMessage(`User ${action} successful`);
      fetchUsers(); // Refresh user list
    } catch (err) {
      setError(`Failed to ${action} user`);
      console.error(`Error ${action} user:`, err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  if (loading) return <div className="loading">Loading users...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="admin-container">
      <h1>User Management</h1>
      {message && <div className="success-message">{message}</div>}
      <div className="admin-content">
        <div className="admin-card">
          <h2>All Users</h2>
          <div className="users-grid">
            {users.map((user) => (
              <div key={user._id} className="user-card">
                <div className="user-info">
                  <h3>{user.name}</h3>
                  <p>Email: {user.email}</p>
                  <p>Role: {user.role}</p>
                  <p>Status: {user.suspended ? "Suspended" : "Active"}</p>
                </div>
                <div className="user-actions">
                  <button
                    onClick={() =>
                      handleUserAction(
                        user._id,
                        user.suspended ? "activate" : "suspend"
                      )
                    }
                    className={`btn ${
                      user.suspended ? "btn-success" : "btn-warning"
                    }`}
                  >
                    {user.suspended ? "Activate" : "Suspend"}
                  </button>
                  <button
                    onClick={() => handleUserAction(user._id, "delete")}
                    className="btn btn-danger"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
