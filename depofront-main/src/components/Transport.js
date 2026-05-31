import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { transportAPI, orderAPI, authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { FiArrowLeft, FiTruck, FiEdit, FiTrash2, FiPlus, FiX } from 'react-icons/fi';
import './Transport.css';

const Transport = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);

  const [transports, setTransports] = useState([]);
  const [ordersNeedingTransport, setOrdersNeedingTransport] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingTransport, setEditingTransport] = useState(null);
  const [selectedOrderForTransport, setSelectedOrderForTransport] = useState(null);

  const [formData, setFormData] = useState({
    orderId: '',
    transportCompany: '',
    trackingNumber: '',
    deliveryDate: '',
    status: 'PENDING',
  });

  useEffect(() => {
    checkAdminStatus();
    loadData();
  }, []);

  const checkAdminStatus = async () => {
    try {
      const authResponse = await authAPI.getCurrentUser();
      const userData = authResponse.data;
      const roles = userData.roles || [];
      if (roles.includes('ADMIN')) {
        setIsAdmin(true);
      }
    } catch (error) {
      console.error('Error checking user roles:', error);
    }
  };

  const loadData = async () => {
    await Promise.all([loadTransports(), loadOrdersNeedingTransport()]);
  };

  const loadTransports = async () => {
    try {
      setLoading(true);
      const response = await transportAPI.getAll();
      setTransports(response.data);
      setError('');
    } catch (err) {
      const serverMsg = err?.response?.data?.message || err?.response?.data || err.message;
      const status = err?.response?.status;
      setError(`Failed to load transports${status ? ` (status ${status})` : ''}`);
      console.error('loadTransports error:', { status, serverMsg, err });
    } finally {
      setLoading(false);
    }
  };

  const loadOrdersNeedingTransport = async () => {
    try {
      const response = await transportAPI.getOrdersNeedingTransport();
      setOrdersNeedingTransport(response.data);
    } catch (err) {
      console.error('Failed to load orders needing transport', err);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const transportData = {
        orderId: parseInt(formData.orderId),
        transportCompany: formData.transportCompany,
        trackingNumber: formData.trackingNumber,
        deliveryDate: formData.deliveryDate || null,
        status: formData.status,
      };

      if (editingTransport) {
        await transportAPI.update(editingTransport.id, transportData);
      } else {
        await transportAPI.create(transportData);
      }

      setShowForm(false);
      setEditingTransport(null);
      setFormData({
        orderId: '',
        transportCompany: '',
        trackingNumber: '',
        deliveryDate: '',
        status: 'PENDING',
      });
      setSelectedOrderForTransport(null);
      loadData();
    } catch (err) {
      const status = err?.response?.status;
      const serverMsg = err?.response?.data?.message || err?.response?.data || err.message;
      setError(`Failed to ${editingTransport ? 'update' : 'create'} transport${status ? ` (status ${status})` : ''}: ${serverMsg}`);
      console.error('transport error:', { status, serverMsg, err });
    }
  };

  const handleEdit = (transport) => {
    setEditingTransport(transport);
    setFormData({
      orderId: transport.order?.id?.toString() || '',
      transportCompany: transport.transportCompany || '',
      trackingNumber: transport.trackingNumber || '',
      deliveryDate: transport.deliveryDate || '',
      status: transport.status || 'PENDING',
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this transport record?')) {
      return;
    }
    try {
      await transportAPI.delete(id);
      loadTransports();
    } catch (err) {
      const status = err?.response?.status;
      const serverMsg = err?.response?.data?.message || err?.response?.data || err.message;
      setError(`Failed to delete transport${status ? ` (status ${status})` : ''}: ${serverMsg}`);
      console.error('delete transport error:', { status, serverMsg, err });
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingTransport(null);
    setSelectedOrderForTransport(null);
    setFormData({
      orderId: '',
      transportCompany: '',
      trackingNumber: '',
      deliveryDate: '',
      status: 'PENDING',
    });
  };

  const handleAssignTransport = (order) => {
    setSelectedOrderForTransport(order);
    setFormData({
      orderId: order.id.toString(),
      transportCompany: '',
      trackingNumber: '',
      deliveryDate: '',
      status: 'PENDING',
    });
    setShowForm(true);
  };

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case 'PENDING':
        return '#ff9800';
      case 'IN_TRANSIT':
        return '#2196f3';
      case 'DELIVERED':
        return '#4caf50';
      case 'CANCELLED':
        return '#f44336';
      default:
        return '#666';
    }
  };

  if (loading && transports.length === 0) {
    return <div className="loading">Loading transports...</div>;
  }

  return (
    <div className="transport-container">
      <div className="transport-header">
        <div>
          <button onClick={() => navigate('/dashboard')} className="btn-back">
            <FiArrowLeft className="back-icon" /> Back to Dashboard
          </button>
          <h2>Transportation Management</h2>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          {showForm ? <><FiX className="btn-icon" /> Cancel</> : <><FiPlus className="btn-icon" /> Add Transport</>}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Orders Needing Transport */}
      {ordersNeedingTransport.length > 0 && (
        <div className="orders-needing-transport-section">
          <h3>Orders Needing Transportation</h3>
          <p className="section-description">These orders are ready for transport. Assign a transport company to each order.</p>
          <div className="orders-needing-transport-list">
            {ordersNeedingTransport.map((order) => (
              <div key={order.id} className="order-needing-transport-card">
                <div className="order-needing-transport-info">
                  <div>
                    <h4>Order #{order.id}</h4>
                    <p><strong>Supplier:</strong> {order.supplier?.name}</p>
                    <p><strong>Order Date:</strong> {order.orderDate ? new Date(order.orderDate).toLocaleDateString() : 'N/A'}</p>
                    {order.items && order.items.length > 0 && (
                      <p><strong>Items:</strong> {order.items.length} item(s)</p>
                    )}
                  </div>
                  <button
                    onClick={() => handleAssignTransport(order)}
                    className="btn-primary"
                  >
                    Assign Transport Company
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showForm && (
        <div className="transport-form-card">
          <h3>{editingTransport ? 'Edit Transport' : selectedOrderForTransport ? `Assign Transport to Order #${selectedOrderForTransport.id}` : 'Create New Transport'}</h3>

          <form onSubmit={handleSubmit}>
            {!selectedOrderForTransport && !editingTransport && (
              <div className="form-group">
                <label>Order</label>
                <select
                  name="orderId"
                  value={formData.orderId}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Order</option>
                  {ordersNeedingTransport.map((order) => (
                    <option key={order.id} value={order.id}>
                      Order #{order.id} - {order.supplier?.name} ({order.status})
                    </option>
                  ))}
                </select>
              </div>
            )}
            {selectedOrderForTransport && (
              <div className="form-group">
                <label>Order</label>
                <input
                  type="text"
                  value={`Order #${selectedOrderForTransport.id} - ${selectedOrderForTransport.supplier?.name}`}
                  disabled
                  className="input-disabled"
                />
              </div>
            )}

            <div className="form-group">
              <label>Transport Company</label>
              <input
                type="text"
                name="transportCompany"
                value={formData.transportCompany}
                onChange={handleChange}
                placeholder="e.g., FedEx, UPS, DHL"
                required
              />
            </div>

            <div className="form-group">
              <label>Tracking Number</label>
              <input
                type="text"
                name="trackingNumber"
                value={formData.trackingNumber}
                onChange={handleChange}
                placeholder="Enter tracking number"
                required
              />
            </div>

            <div className="form-group">
              <label>Delivery Date</label>
              <input
                type="date"
                name="deliveryDate"
                value={formData.deliveryDate}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
              >
                <option value="PENDING">PENDING</option>
                <option value="IN_TRANSIT">IN_TRANSIT</option>
                <option value="DELIVERED">DELIVERED</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary">
                {editingTransport ? 'Update Transport' : 'Create Transport'}
              </button>
              <button type="button" onClick={handleCancel} className="btn-secondary">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Existing Transport Assignments */}
      {transports.length > 0 && (
        <div className="existing-transports-section">
          <h3>Existing Transport Assignments</h3>
          <div className="transports-list">
          {transports.map((transport) => (
            <div key={transport.id} className="transport-card">
              <div className="transport-header-info">
                <div>
                  <h3>Transport #{transport.id}</h3>
                  <p className="transport-order">
                    Order #{transport.order?.id} - {transport.order?.supplier?.name}
                  </p>
                </div>
                <span
                  className="transport-status"
                  style={{ backgroundColor: getStatusColor(transport.status) }}
                >
                  {transport.status}
                </span>
              </div>

              <div className="transport-details">
                <div className="transport-detail-item">
                  <strong>Transport Company:</strong> {transport.transportCompany || 'N/A'}
                </div>
                <div className="transport-detail-item">
                  <strong>Tracking Number:</strong> {transport.trackingNumber || 'N/A'}
                </div>
                <div className="transport-detail-item">
                  <strong>Delivery Date:</strong>{' '}
                  {transport.deliveryDate
                    ? new Date(transport.deliveryDate).toLocaleDateString()
                    : 'Not set'}
                </div>
                <div className="transport-detail-item">
                  <strong>Order Status:</strong> {transport.order?.status || 'N/A'}
                </div>
              </div>

              <div className="transport-actions">
                <button
                  onClick={() => handleEdit(transport)}
                  className="btn-secondary"
                >
                  <FiEdit className="btn-icon" /> Edit
                </button>
                {isAdmin && (
                  <button
                    onClick={() => handleDelete(transport.id)}
                    className="btn-remove"
                  >
                    <FiTrash2 className="btn-icon" /> Delete
                  </button>
                )}
              </div>
            </div>
          ))}
          </div>
        </div>
      )}

      {ordersNeedingTransport.length === 0 && transports.length === 0 && !loading && (
        <div className="empty-state">No orders need transportation at this time.</div>
      )}
    </div>
  );
};

export default Transport;

