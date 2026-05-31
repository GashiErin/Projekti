import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { userAPI, authAPI } from '../services/api';
import SupplierManagement from './SupplierManagement';
import ProductManagement from './ProductManagement';
import OrderManagement from './OrderManagement';
import UserManagement from './UserManagement';
import CategoryManagement from './CategoryManagement';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('suppliers');
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user has ADMIN role
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    // First check current user's roles
    try {
      const authResponse = await authAPI.getCurrentUser();
      const userData = authResponse.data;
      const roles = userData.roles || [];
      
      if (roles.includes('ADMIN')) {
        setIsAdmin(true);
        setLoading(false);
        return;
      }
    } catch (error) {
      console.error('Error checking user roles:', error);
    }

    // Fallback: try to access admin endpoint
    try {
      const response = await userAPI.getAll();
      // If we can access this endpoint, user is admin
      setIsAdmin(true);
    } catch (error) {
      if (error.response?.status === 403 || error.response?.status === 401) {
        setIsAdmin(false);
        // Show helpful message before redirecting
        setTimeout(() => {
          alert('Access Denied. You need ADMIN role to access this page.\n\nTo assign ADMIN role:\n1. Go to your database (pgAdmin)\n2. Find the "roles" table and note the ID for "ADMIN" role\n3. In the "user_roles" table, insert:\n   - user_id: your user ID\n   - role_id: the ADMIN role ID\n\nOr ask an existing admin to assign you the role through the User Management page.');
          navigate('/dashboard');
        }, 100);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!isAdmin) {
    return <div className="error">Access Denied. Admin privileges required.</div>;
  }

  return (
    <div className="admin-dashboard">
      <nav className="admin-navbar">
        <div className="nav-content">
          <h1>Admin Dashboard</h1>
          <div className="nav-user">
            <span>Welcome, {user?.username}</span>
            <button onClick={handleLogout} className="btn-logout">
              Logout
            </button>
          </div>
        </div>
      </nav>
      
      <div className="admin-container">
        <div className="admin-sidebar">
          <button
            className={activeTab === 'suppliers' ? 'active' : ''}
            onClick={() => setActiveTab('suppliers')}
          >
            Suppliers
          </button>
          <button
            className={activeTab === 'categories' ? 'active' : ''}
            onClick={() => setActiveTab('categories')}
          >
            Categories
          </button>
          <button
            className={activeTab === 'products' ? 'active' : ''}
            onClick={() => setActiveTab('products')}
          >
            Products
          </button>
          <button
            className={activeTab === 'orders' ? 'active' : ''}
            onClick={() => setActiveTab('orders')}
          >
            Orders
          </button>
          <button
            className={activeTab === 'users' ? 'active' : ''}
            onClick={() => setActiveTab('users')}
          >
            Users & Roles
          </button>
        </div>
        
        <div className="admin-content">
          {activeTab === 'suppliers' && <SupplierManagement />}
          {activeTab === 'categories' && <CategoryManagement />}
          {activeTab === 'products' && <ProductManagement />}
          {activeTab === 'orders' && <OrderManagement />}
          {activeTab === 'users' && <UserManagement />}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

