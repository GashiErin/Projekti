import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth credentials
api.interceptors.request.use(
  (config) => {
    const auth = localStorage.getItem('auth');
    if (auth) {
      const { username, password } = JSON.parse(auth);
      config.auth = {
        username,
        password,
      };
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  getCurrentUser: () => api.get('/auth/me'),
};

// Product API
export const productAPI = {
  getAll: () => api.get('/products'),
  create: (data) => api.post('/products', data),
  updatePrice: (id, price) => api.put(`/products/${id}/price`, { price }),
};

// Order API
export const orderAPI = {
  getAll: () => api.get('/orders'),
  create: (data) => api.post('/orders', data),
  receive: (id) => api.put(`/orders/${id}/receive`),
};

// Supplier API
export const supplierAPI = {
  getAll: () => api.get('/suppliers'),
  create: (data) => api.post('/suppliers', data),
  update: (id, data) => api.put(`/suppliers/${id}`, data),
  delete: (id) => api.delete(`/suppliers/${id}`),
};

// Category API
export const categoryAPI = {
  getAll: () => api.get('/categories'),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`),
};

// User API
export const userAPI = {
  getAll: () => api.get('/users'),
  getById: (id) => api.get(`/users/${id}`),
  assignRole: (data) => api.post('/users/assign-role', data),
  removeRole: (userId, roleName) => api.delete(`/users/${userId}/roles/${roleName}`),
};

// Transport API
export const transportAPI = {
  getAll: () => api.get('/transport'),
  getById: (id) => api.get(`/transport/${id}`),
  create: (data) => api.post('/transport', data),
  update: (id, data) => api.put(`/transport/${id}`, data),
  delete: (id) => api.delete(`/transport/${id}`),
  getOrdersNeedingTransport: () => api.get('/transport/orders-needing-transport'),
};

export default api;

