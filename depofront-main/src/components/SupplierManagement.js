import React, { useState, useEffect } from 'react';
import { supplierAPI } from '../services/api';
import './SupplierManagement.css';

const SupplierManagement = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    loadSuppliers();
  }, []);

  const loadSuppliers = async () => {
    try {
      setLoading(true);
      const response = await supplierAPI.getAll();
      setSuppliers(response.data);
    } catch (error) {
      setError('Failed to load suppliers');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (editingSupplier) {
        await supplierAPI.update(editingSupplier.id, formData);
      } else {
        await supplierAPI.create(formData);
      }
      setShowForm(false);
      setEditingSupplier(null);
      setFormData({ name: '', phone: '', email: '' });
      loadSuppliers();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to save supplier');
    }
  };

  const handleEdit = (supplier) => {
    setEditingSupplier(supplier);
    setFormData({
      name: supplier.name || '',
      phone: supplier.phone || '',
      email: supplier.email || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this supplier?')) {
      return;
    }

    try {
      await supplierAPI.delete(id);
      loadSuppliers();
    } catch (error) {
      setError('Failed to delete supplier');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingSupplier(null);
    setFormData({ name: '', phone: '', email: '' });
  };

  if (loading) {
    return <div className="loading">Loading suppliers...</div>;
  }

  return (
    <div className="supplier-management">
      <div className="management-header">
        <h2>Supplier Management</h2>
        <button onClick={() => setShowForm(true)} className="btn btn-primary">
          Add New Supplier
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {showForm && (
        <div className="form-modal">
          <div className="form-content">
            <h3>{editingSupplier ? 'Edit Supplier' : 'Add New Supplier'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  {editingSupplier ? 'Update' : 'Create'}
                </button>
                <button type="button" onClick={handleCancel} className="btn btn-secondary">
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
              <th>Name</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {suppliers.length === 0 ? (
              <tr>
                <td colSpan="5" className="empty-state">
                  No suppliers found. Add your first supplier!
                </td>
              </tr>
            ) : (
              suppliers.map((supplier) => (
                <tr key={supplier.id}>
                  <td>{supplier.id}</td>
                  <td>{supplier.name}</td>
                  <td>{supplier.phone || '-'}</td>
                  <td>{supplier.email || '-'}</td>
                  <td>
                    <button
                      onClick={() => handleEdit(supplier)}
                      className="btn btn-edit"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(supplier.id)}
                      className="btn btn-delete"
                    >
                      Delete
                    </button>
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

export default SupplierManagement;

