import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { authAPI } from '../services/api';
import { 
  FiGrid, 
  FiPackage, 
  FiTruck, 
  FiSettings, 
  FiMessageCircle,
  FiUser,
  FiLogOut
} from 'react-icons/fi';
import './Dashboard.css';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState(false);
  const [hasTransportRole, setHasTransportRole] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUserRoles();
  }, []);

  const checkUserRoles = async () => {
    try {
      const authResponse = await authAPI.getCurrentUser();
      const userData = authResponse.data;
      const roles = userData.roles || [];
      
      if (roles.includes('ADMIN')) {
        setIsAdmin(true);
      }
      if (roles.includes('TRANSPORT') && !roles.includes('ADMIN')) {
        setHasTransportRole(true);
      }
    } catch (error) {
      console.error('Error checking user roles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="dashboard-layout">
      {/* Left Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2 className="brand-name">DEPO</h2>
        </div>
        <div className="user-avatar">
          <FiUser className="avatar-icon" />
        </div>
        <nav className="sidebar-nav">
          <button 
            className={`nav-item ${isActive('/dashboard') ? 'active' : ''}`}
            onClick={() => navigate('/dashboard')}
          >
            <FiGrid className="nav-icon" />
          </button>
          <button 
            className={`nav-item ${isActive('/products') ? 'active' : ''}`}
            onClick={() => navigate('/products')}
          >
            <FiPackage className="nav-icon" />
          </button>
          {hasTransportRole && (
            <button 
              className={`nav-item ${isActive('/transport') ? 'active' : ''}`}
              onClick={() => navigate('/transport')}
            >
              <FiTruck className="nav-icon" />
            </button>
          )}
          {isAdmin && (
            <button 
              className={`nav-item ${isActive('/admin') ? 'active' : ''}`}
              onClick={() => navigate('/admin')}
            >
              <FiSettings className="nav-icon" />
            </button>
          )}
        </nav>
        <div className="sidebar-footer">
          <button className="nav-item">
            <FiMessageCircle className="nav-icon" />
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="main-header">
          <div className="header-right">
            <span className="user-name">Welcome, {user?.username}</span>
            <button onClick={handleLogout} className="btn-logout-inline" aria-label="Logout">
              <FiLogOut className="logout-icon" />
              Logout
            </button>
          </div>
        </header>

        <div className="content-area">
          <div className="summary-cards">
            <div className="summary-card">
              <div className="summary-card-content">
                <h3>Shipped Today</h3>
                <p className="summary-value">0</p>
                <span className="summary-change positive">+0%</span>
              </div>
            </div>
            <div className="summary-card">
              <div className="summary-card-content">
                <h3>Order Cancelled</h3>
                <p className="summary-value">0</p>
                <span className="summary-change negative">+0%</span>
              </div>
            </div>
            <div className="summary-card">
              <div className="summary-card-content">
                <h3>Avg Pack Time</h3>
                <p className="summary-value">0 min</p>
                <span className="summary-change positive">+0%</span>
              </div>
            </div>
          </div>

          <div className="help-center-card">
            <div className="help-content">
              <FiMessageCircle className="help-icon" />
              <div>
                <h4>DEPO Help Center</h4>
                <p>If you need help or something wrong.</p>
              </div>
            </div>
          </div>

          <div className="quick-actions">
            <h2 className="section-title">Quick Actions</h2>
            <div className="action-cards">
              <div className="action-card" onClick={() => navigate('/orders')}>
                <FiPackage className="action-icon" />
                <h3>Orders</h3>
                <p>View and manage orders</p>
              </div>
              <div className="action-card" onClick={() => navigate('/products')}>
                <FiPackage className="action-icon" />
                <h3>Products</h3>
                <p>Manage your product inventory</p>
              </div>
              {hasTransportRole && (
                <div className="action-card" onClick={() => navigate('/transport')}>
                  <FiTruck className="action-icon" />
                  <h3>Transportation</h3>
                  <p>Assign transport companies to orders</p>
                </div>
              )}
              {isAdmin && (
                <div className="action-card" onClick={() => navigate('/admin')}>
                  <FiSettings className="action-icon" />
                  <h3>Admin Dashboard</h3>
                  <p>Manage suppliers, products, orders, and users</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;

