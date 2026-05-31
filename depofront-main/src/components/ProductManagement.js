import React, { useState, useEffect } from 'react';
import { productAPI, supplierAPI, categoryAPI } from '../services/api';
import './ProductManagement.css';

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    unitPrice: '',
    supplierId: '',
    categoryId: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [productsRes, suppliersRes, categoriesRes] = await Promise.all([
        productAPI.getAll(),
        supplierAPI.getAll(),
        categoryAPI.getAll(),
      ]);
      setProducts(productsRes.data);
      setSuppliers(suppliersRes.data);
      setCategories(categoriesRes.data);
    } catch (error) {
      setError('Failed to load data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await productAPI.create({
        ...formData,
        unitPrice: parseFloat(formData.unitPrice),
        supplierId: parseInt(formData.supplierId),
        categoryId: parseInt(formData.categoryId),
      });
      setShowForm(false);
      setFormData({ name: '', unitPrice: '', supplierId: '', categoryId: '' });
      loadData();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create product');
    }
  };

  if (loading) {
    return <div className="loading">Loading products...</div>;
  }

  return (
    <div className="product-management">
      <div className="management-header">
        <h2>Product Management</h2>
        <button onClick={() => setShowForm(true)} className="btn btn-primary">
          Add New Product
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {showForm && (
        <div className="form-modal">
          <div className="form-content">
            <h3>Add New Product</h3>
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
                <label>Unit Price *</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.unitPrice}
                  onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
                  required
                />
              </div>
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
                <label>Category *</label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setFormData({ name: '', unitPrice: '', supplierId: '', categoryId: '' });
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
              <th>Name</th>
              <th>Unit Price</th>
              <th>Supplier</th>
              <th>Category</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan="5" className="empty-state">
                  No products found. Add your first product!
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product.id}>
                  <td>{product.id}</td>
                  <td>{product.name}</td>
                  <td>${product.unitPrice?.toFixed(2) || '0.00'}</td>
                  <td>{product.supplier?.name || '-'}</td>
                  <td>{product.category?.name || '-'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductManagement;

