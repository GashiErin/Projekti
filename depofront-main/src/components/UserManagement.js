import React, { useState, useEffect, useRef } from 'react';
import $ from 'jquery';
import 'datatables.net-dt';
import 'datatables.net-dt/css/dataTables.dataTables.css';
import { userAPI } from '../services/api';
import './UserManagement.css';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showRoleForm, setShowRoleForm] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [roleName, setRoleName] = useState('ADMIN');
  const tableRef = useRef(null);

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    if (!tableRef.current) {
      return;
    }

    if ($.fn.dataTable.isDataTable(tableRef.current)) {
      $(tableRef.current).DataTable().destroy();
    }

    $(tableRef.current).DataTable({
      pageLength: 10,
      lengthMenu: [5, 10, 25, 50],
      order: [[0, 'asc']],
      columnDefs: [
        { orderable: false, targets: [6] }
      ]
    });

    return () => {
      if ($.fn.dataTable.isDataTable(tableRef.current)) {
        $(tableRef.current).DataTable().destroy();
      }
    };
  }, [users]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await userAPI.getAll();
      setUsers(response.data);
    } catch (error) {
      setError('Failed to load users. Make sure you have ADMIN role.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignRole = async (userId, role) => {
    try {
      setError('');
      setSuccess('');
      await userAPI.assignRole({ userId, roleName: role });
      setSuccess(`Role "${role}" assigned successfully!`);
      loadUsers();
      setShowRoleForm(false);
      setSelectedUser(null);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to assign role');
    }
  };

  const handleRemoveRole = async (userId, roleName) => {
    if (!window.confirm(`Are you sure you want to remove the "${roleName}" role from this user?`)) {
      return;
    }

    try {
      setError('');
      setSuccess('');
      await userAPI.removeRole(userId, roleName);
      setSuccess(`Role "${roleName}" removed successfully!`);
      loadUsers();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to remove role');
    }
  };

  if (loading) {
    return <div className="loading">Loading users...</div>;
  }

  return (
    <div className="user-management">
      <div className="management-header">
        <h2>User & Role Management</h2>
        <p className="subtitle">View all users and their associated roles</p>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {showRoleForm && selectedUser && (
        <div className="form-modal">
          <div className="form-content">
            <h3>Assign Role to {selectedUser.username}</h3>
            <div className="form-group">
              <label>Role</label>
              <select
                value={roleName}
                onChange={(e) => setRoleName(e.target.value)}
              >
                <option value="ADMIN">ADMIN</option>
                <option value="EMPLOYEE">EMPLOYEE</option>
                <option value="MANAGER">MANAGER</option>
              </select>
            </div>
            <div className="form-actions">
              <button
                onClick={() => handleAssignRole(selectedUser.id, roleName)}
                className="btn btn-primary"
              >
                Assign Role
              </button>
              <button
                onClick={() => {
                  setShowRoleForm(false);
                  setSelectedUser(null);
                }}
                className="btn btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="info-box">
        <h3>Role Verification</h3>
        <p>This page displays all users in the system and their associated roles. 
           Verify that users are correctly associated with their roles.</p>
      </div>

      <div className="table-container">
        <table className="data-table display table table-sm" ref={tableRef}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Username</th>
              <th>Email</th>
              <th>Enabled</th>
              <th>Roles</th>
              <th>Role Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan="7" className="empty-state">
                  No users found.
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.username}</td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`status-badge ${user.enabled ? 'enabled' : 'disabled'}`}>
                      {user.enabled ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td>
                    <div className="roles-container">
                      {user.roles && user.roles.length > 0 ? (
                        user.roles.map((role, index) => (
                          <span key={index} className="role-badge">
                            {role}
                          </span>
                        ))
                      ) : (
                        <span className="no-roles">No roles assigned</span>
                      )}
                    </div>
                  </td>
                  <td>
                    {user.roles && user.roles.length > 0 ? (
                      <span className="status-ok">✓ Roles Assigned</span>
                    ) : (
                      <span className="status-warning">⚠ No Roles</span>
                    )}
                  </td>
                  <td>
                    <button
                      onClick={() => {
                        setSelectedUser(user);
                        setShowRoleForm(true);
                      }}
                      className="btn btn-assign"
                    >
                      Assign Role
                    </button>
                    {user.roles && user.roles.length > 0 && (
                      <div className="role-actions">
                        {user.roles.map((role, index) => (
                          <button
                            key={index}
                            onClick={() => handleRemoveRole(user.id, role)}
                            className="btn btn-remove-role"
                            title={`Remove ${role} role`}
                          >
                            Remove {role}
                          </button>
                        ))}
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="summary-box">
        <h3>Summary</h3>
        <div className="summary-stats">
          <div className="stat-item">
            <span className="stat-label">Total Users:</span>
            <span className="stat-value">{users.length}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Users with Roles:</span>
            <span className="stat-value">
              {users.filter(u => u.roles && u.roles.length > 0).length}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Users without Roles:</span>
            <span className="stat-value warning">
              {users.filter(u => !u.roles || u.roles.length === 0).length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;

