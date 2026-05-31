import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { orderAPI, productAPI, supplierAPI } from '../services/api';
import { FiArrowLeft, FiPlus, FiX, FiCheck } from 'react-icons/fi';
import './Orders.css';

const Orders = () => {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    supplierId: '',
    items: [{ productId: '', quantity: '', price: '' }],
  });

  useEffect(() => {
    loadOrders();
    loadProducts();
    loadSuppliers();
  }, []);

  // ================= LOAD DATA =================

  const loadOrders = async () => {
    try {
      setLoading(true);
      console.debug('Requesting GET /orders');
      const response = await orderAPI.getAll();
      console.debug('GET /orders response:', response);
      setOrders(response.data);
      setError('');
    } catch (err) {
      const serverMsg = err?.response?.data?.message || err?.response?.data || err.message;
      const status = err?.response?.status;
      setError(`Failed to load orders${status ? ` (status ${status})` : ''}`);
      console.error('loadOrders error:', { status, serverMsg, err });
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      const response = await productAPI.getAll();
      setProducts(response.data);
    } catch (err) {
      const status = err?.response?.status;
      const serverMsg = err?.response?.data || err.message;
      console.error('Failed to load products', { status, serverMsg, err });
    }
  };

  const loadSuppliers = async () => {
    try {
      const response = await supplierAPI.getAll();
      setSuppliers(response.data);
    } catch (err) {
      const status = err?.response?.status;
      const serverMsg = err?.response?.data || err.message;
      console.error('Failed to load suppliers', { status, serverMsg, err });
    }
  };

  // ================= FORM HANDLERS =================

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index] = {
      ...newItems[index],
      [field]: value,
    };
    setFormData({ ...formData, items: newItems });
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { productId: '', quantity: '', price: '' }],
    });
  };

  const removeItem = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const orderData = {
        supplierId: parseInt(formData.supplierId),
        items: formData.items.map((item) => ({
          productId: parseInt(item.productId),
          quantity: parseInt(item.quantity),
          price: parseFloat(item.price),
        })),
      };

      console.debug('Creating order with payload:', orderData);
      await orderAPI.create(orderData);

      setShowForm(false);
      setFormData({
        supplierId: '',
        items: [{ productId: '', quantity: '', price: '' }],
      });

      loadOrders();
    } catch (err) {
      const status = err?.response?.status;
      const serverMsg = err?.response?.data || err.message;
      setError(`Failed to create order${status ? ` (status ${status})` : ''}`);
      console.error('create order error:', { status, serverMsg, err });
    }
  };

  const handleReceive = async (id) => {
    try {
      await orderAPI.receive(id);
      loadOrders();
    } catch (err) {
      const status = err?.response?.status;
      const serverMsg = err?.response?.data || err.message;
      setError(`Failed to receive order${status ? ` (status ${status})` : ''}`);
      console.error('receive order error:', { status, serverMsg, err });
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return '#ff9800';
      case 'received':
        return '#4caf50';
      case 'completed':
        return '#2196f3';
      default:
        return '#666';
    }
  };

  if (loading && orders.length === 0) {
    return <div className="loading">Loading orders...</div>;
  }

  // ================= UI =================

  return (
    <div className="orders-container">
      <div className="orders-header">
        <div>
          <button onClick={() => navigate('/dashboard')} className="btn-back">
            <FiArrowLeft className="back-icon" /> Back to Dashboard
          </button>
          <h2>Orders</h2>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          {showForm ? <><FiX className="btn-icon" /> Cancel</> : <><FiPlus className="btn-icon" /> Create Order</>}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {showForm && (
        <div className="order-form-card">
          <h3>Create New Order</h3>

          <form onSubmit={handleSubmit}>
            {/* SUPPLIER */}
            <div className="form-group">
              <label>Supplier</label>
              <select
                name="supplierId"
                value={formData.supplierId}
                onChange={handleChange}
                required
              >
                <option value="">Select Supplier</option>
                {suppliers.map((supplier) => (
                  <option key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </option>
                ))}
              </select>
            </div>

            {/* ITEMS */}
            <div className="order-items">
              <div className="order-items-header">
                <h4>Order Items</h4>
                <button type="button" onClick={addItem} className="btn-secondary">
                  Add Item
                </button>
              </div>

              {formData.items.map((item, index) => (
                <div key={index} className="order-item">
                  <div className="form-group">
                    <label>Product</label>
                    <select
                      value={item.productId}
                      onChange={(e) =>
                        handleItemChange(index, 'productId', e.target.value)
                      }
                      required
                    >
                      <option value="">Select Product</option>
                      {products.map((product) => (
                        <option key={product.id} value={product.id}>
                          {product.name} - ${product.unitPrice}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Quantity</label>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) =>
                        handleItemChange(index, 'quantity', e.target.value)
                      }
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Price</label>
                    <input
                      type="number"
                      step="0.01"
                      value={item.price}
                      onChange={(e) =>
                        handleItemChange(index, 'price', e.target.value)
                      }
                      required
                    />
                  </div>

                  {formData.items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="btn-remove"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>

            <button type="submit" className="btn-primary">
              Create Order
            </button>
          </form>
        </div>
      )}

      {/* ORDERS LIST */}
      <div className="orders-list">
        {orders.length === 0 ? (
          <div className="empty-state">No orders found</div>
        ) : (
          orders.map((order) => (
            <div key={order.id} className="order-card">
              <div className="order-header">
                <div>
                  <h3>Order #{order.id}</h3>
                  <p className="order-date">
                    {order.orderDate
                      ? new Date(order.orderDate).toLocaleDateString()
                      : 'N/A'}
                  </p>
                </div>
                <span
                  className="order-status"
                  style={{ backgroundColor: getStatusColor(order.status) }}
                >
                  {order.status}
                </span>
              </div>

              {order.supplier && (
                <p className="order-supplier">
                  Supplier: {order.supplier.name}
                </p>
              )}

              {order.createdBy && (
                <p className="order-creator">
                  Created by: {order.createdBy.username}
                </p>
              )}

              {order.items?.length > 0 && (
                <div className="order-items-list">
                  <h4>Items:</h4>
                  <ul>
                    {order.items
                      .filter((item) => item.product) // Filter out items with deleted products
                      .map((item, idx) => (
                        <li key={idx}>
                          {item.product.name} – Qty: {item.quantity} – $
                          {item.price.toFixed(2)}
                        </li>
                      ))}
                  </ul>
                </div>
              )}

              {order.status?.toLowerCase() !== 'received' && (
                <button
                  onClick={() => handleReceive(order.id)}
                  className="btn-success"
                >
                  <FiCheck className="btn-icon" /> Mark as Received
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Orders;