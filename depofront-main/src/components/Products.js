import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { productAPI, authAPI } from '../services/api';
import { FiArrowLeft, FiPlus, FiX, FiSearch } from 'react-icons/fi';
import './Products.css';

const Products = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [canCreateProduct, setCanCreateProduct] = useState(false);
  const [roleLoading, setRoleLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    unitPrice: '',
    supplierId: '',
    categoryId: '',
  });

  useEffect(() => {
    loadProducts();
    checkUserRoles();
  }, []);

  useEffect(() => {
    if (!roleLoading && !canCreateProduct && showForm) {
      setShowForm(false);
    }
  }, [roleLoading, canCreateProduct, showForm]);

  const checkUserRoles = async () => {
    try {
      const authResponse = await authAPI.getCurrentUser();
      const userData = authResponse.data;
      const roles = userData.roles || [];
      setCanCreateProduct(!roles.includes('EMPLOYEE'));
    } catch (error) {
      console.error('Error checking user roles:', error);
      setCanCreateProduct(false);
    } finally {
      setRoleLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await productAPI.getAll();
      setProducts(response.data);
      setError('');
    } catch (err) {
      setError('Failed to load products');
      console.error(err);
    } finally {
      setLoading(false);
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
    if (!canCreateProduct) {
      setError('You do not have permission to create products.');
      return;
    }
    try {
      const productData = {
        ...formData,
        unitPrice: parseFloat(formData.unitPrice),
        supplierId: formData.supplierId ? parseInt(formData.supplierId) : null,
        categoryId: formData.categoryId ? parseInt(formData.categoryId) : null,
      };
      await productAPI.create(productData);
      setShowForm(false);
      setFormData({ name: '', unitPrice: '', supplierId: '', categoryId: '' });
      loadProducts();
    } catch (err) {
      setError('Failed to create product');
      console.error(err);
    }
  };

  if (loading && products.length === 0) {
    return <div className="loading">Loading products...</div>;
  }

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredProducts = normalizedQuery
    ? products.filter((product) => {
        const name = product.name?.toLowerCase() || '';
        const supplier = product.supplier?.name?.toLowerCase() || '';
        const category = product.category?.name?.toLowerCase() || '';
        const supplierId = product.supplier?.id?.toString() || '';
        const categoryId = product.category?.id?.toString() || '';
        return [name, supplier, category, supplierId, categoryId].some((value) =>
          value.includes(normalizedQuery)
        );
      })
    : products;

  return (
    <div className="products-container">
      <div className="products-header">
        <div>
          <button onClick={() => navigate('/dashboard')} className="btn-back">
            <FiArrowLeft className="back-icon" /> Back to Dashboard
          </button>
          <h2>Products</h2>
        </div>
        <div className="products-actions">
          <div className="products-search">
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search products"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search products"
            />
          </div>
          {!roleLoading && canCreateProduct && (
            <button onClick={() => setShowForm(!showForm)} className="btn-primary">
              {showForm ? <><FiX className="btn-icon" /> Cancel</> : <><FiPlus className="btn-icon" /> Add Product</>}
            </button>
          )}
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {showForm && canCreateProduct && (
        <div className="product-form-card">
          <h3>Create New Product</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Product Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Unit Price</label>
              <input
                type="number"
                step="0.01"
                name="unitPrice"
                value={formData.unitPrice}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Supplier ID (optional)</label>
              <input
                type="number"
                name="supplierId"
                value={formData.supplierId}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Category ID (optional)</label>
              <input
                type="number"
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
              />
            </div>
            <button type="submit" className="btn-primary">
              Create Product
            </button>
          </form>
        </div>
      )}

      <div className="products-grid">
        {filteredProducts.length === 0 ? (
          <div className="empty-state">
            {products.length === 0 ? 'No products found' : 'No products match your search'}
          </div>
        ) : (
          filteredProducts.map((product) => (
            <div key={product.id} className="product-card">
              <h3>{product.name}</h3>
              <p className="product-price">${product.unitPrice?.toFixed(2)}</p>
              {product.supplier && (
                <p className="product-supplier">Supplier: {product.supplier.name || `ID: ${product.supplier.id}`}</p>
              )}
              {product.category && (
                <p className="product-category">Category: {product.category.name || `ID: ${product.category.id}`}</p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Products;

