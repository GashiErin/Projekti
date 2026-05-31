import React, { useState, useEffect } from 'react';
import { orderAPI, supplierAPI, productAPI } from '../services/api';
import './OrderManagement.css';

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    supplierId: '',
    items: [{ productId: '', quantity: '', price: '' }],
  });
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [ordersRes, suppliersRes, productsRes] = await Promise.all([
        orderAPI.getAll(),
        supplierAPI.getAll(),
        productAPI.getAll(),
      ]);
      setOrders(ordersRes.data);
      setSuppliers(suppliersRes.data);
      setProducts(productsRes.data);
    } catch (error) {
      setError('Failed to load data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { productId: '', quantity: '', price: '' }],
    });
  };

  const handleRemoveItem = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    setFormData({ ...formData, items: newItems });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const orderData = {
        supplierId: parseInt(formData.supplierId),
        items: formData.items.map((item) => ({
          productId: parseInt(item.productId),
          quantity: parseInt(item.quantity),
          price: parseFloat(item.price),
        })),
      };

      await orderAPI.create(orderData);
      setShowForm(false);
      setFormData({
        supplierId: '',
        items: [{ productId: '', quantity: '', price: '' }],
      });
      loadData();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create order');
    }
  };

  const handleReceive = async (id) => {
    try {
      await orderAPI.receive(id);
      loadData();
    } catch (error) {
      setError('Failed to receive order');
    }
  };

  if (loading) {
    return <div className="loading">Loading orders...</div>;
  }

  return (
    <div className="order-management">
      <div className="management-header">
        <h2>Order Management</h2>
        <button onClick={() => setShowForm(true)} className="btn btn-primary">
          Create New Order
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {showForm && (
        <div className="form-modal">
          <div className="form-content large">
            <h3>Create New Order</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Supplier *</label>
                <select
                  value={formData.supplierId}
                  onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
                  required
                >
                  <option value="">Select a supplier</option>
                  {suppliers.map((supplier) => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Order Items *</label>
                {formData.items.map((item, index) => (
                  <div key={index} className="order-item-row">
                    <select
                      value={item.productId}
                      onChange={(e) => handleItemChange(index, 'productId', e.target.value)}
                      required
                    >
                      <option value="">Select product</option>
                      {products.map((product) => (
                        <option key={product.id} value={product.id}>
                          {product.name} - ${product.unitPrice?.toFixed(2)}
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      placeholder="Quantity"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                      required
                      min="1"
                    />
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Price"
                      value={item.price}
                      onChange={(e) => handleItemChange(index, 'price', e.target.value)}
                      required
                    />
                    {formData.items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        className="btn btn-remove"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="btn btn-add-item"
                >
                  Add Item
                </button>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  Create Order
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setFormData({
                      supplierId: '',
                      items: [{ productId: '', quantity: '', price: '' }],
                    });
                  }}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="table-container">
        <table className="data-table table table-sm">
          <thead>
            <tr>
              <th>ID</th>
              <th>Date</th>
              <th>Supplier</th>
              <th>Status</th>
              <th>Created By</th>
              <th>Items</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan="7" className="empty-state">
                  No orders found. Create your first order!
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id}>
                  <td>{order.id}</td>
                  <td>{order.orderDate || '-'}</td>
                  <td>{order.supplier?.name || '-'}</td>
                  <td>
                    <span className={`status-badge ${order.status?.toLowerCase()}`}>
                      {order.status}
                    </span>
                  </td>
                  <td>{order.createdBy?.username || '-'}</td>
                  <td>{order.items?.length || 0} items</td>
                  <td>
                    {order.status === 'CREATED' && (
                      <button
                        onClick={() => handleReceive(order.id)}
                        className="btn btn-receive"
                      >
                        Mark Received
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrderManagement;

