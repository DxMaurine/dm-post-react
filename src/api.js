// src/api.js
import axios from "axios";
import { isValidTokenFormat, clearAuthData } from "./utils";

// Determine API_URL based on environment
const API_URL = import.meta.env.PROD
  ? 'http://localhost:5000' // Hardcode for Electron production
  : import.meta.env.VITE_API_URL; // Use Vite env var for development

// ---------------------------
// LOG FUNCTION
// ---------------------------
const logRequest = (method, url, options = {}) => {
  console.groupCollapsed(`📡 API Request → ${method.toUpperCase()} ${url}`);
  console.log("Full URL:", url);
  console.log("Method:", method.toUpperCase());
  console.log("Options:", options);
  console.log("Timestamp:", new Date().toLocaleTimeString());
  console.groupEnd();
};

// ---------------------------
// AXIOS INSTANCE + INTERCEPTOR
// ---------------------------
export const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && isValidTokenFormat(token)) {
    config.headers.Authorization = `Bearer ${token}`;
  } else if (token) {
    // Token exists but is invalid format
    console.warn('Invalid token format detected, clearing auth data');
    clearAuthData();
  }
  
  logRequest(config.method || "GET", `${config.baseURL}${config.url}`, {
    headers: config.headers,
    data: config.data,
  });
  return config;
});

// Add response interceptor to handle authentication errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 (Unauthorized) and 403 (Forbidden) errors
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      
      // If the error is from the login API call, just let it be handled by the component.
      // Don't trigger a global redirect.
      if (error.config && error.config.url.endsWith('/api/login')) {
        return Promise.reject(error);
      }

      console.warn('Authentication error detected, clearing stored tokens');
      clearAuthData();
      
      // For other pages, redirect to login.
      // This is a hard redirect, which is acceptable for a global auth failure.
      // We must use the hash format for the URL.
      window.location.href = '#/login';
    }
    return Promise.reject(error);
  }
);

// ---------------------------
// API MODULES
// ---------------------------

// AUTH API
export const authAPI = {
  login: (credentials) => api.post('/api/login', credentials),
  register: (userData) => api.post('/api/register', userData),
};

// PRODUCTS API
export const productAPI = {
  getAll: () => api.get('/api/products'),
  getById: (id) => api.get(`/api/products/${id}`),
  getByBarcode: (barcode) => api.get(`/api/products/barcode/${barcode}`),
  getLowStock: () => api.get('/api/products/low-stock'),
  getQuickProducts: () => api.get('/api/quick-products'),
  create: (productFormData) => api.post('/api/products', productFormData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  bulkCreate: (productsData) => api.post('/api/products/bulk', productsData),
  update: (id, productFormData) => api.put(`/api/products/${id}`, productFormData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  delete: (id) => api.delete(`/api/products/${id}`),
  search: (query) => api.get(`/api/products?search=${query}`),
  getStockCard: (productId) => api.get(`/api/stock-card/${productId}`),
  receiveStock: (data) => api.post('/api/stock/receive', data),
  adjustStock: (data) => api.post('/api/stock/adjustment', data),
};

// TRANSACTIONS API
export const transactionAPI = {
  getAll: (params) => api.get('/api/rekap', { params }),
  getById: (id) => api.get(`/api/transactions/${id}`),
  // Updated to indicate it can accept customer_id (or customer_uuid in 'customer' field) and redeem_points
  create: (transactionData) => api.post('/api/transactions', transactionData),
};

// SALES RETURNS API
export const salesReturnAPI = {
  getAll: () => api.get('/api/returns'),
  create: (returnData) => api.post('/api/returns', returnData),
};

// PURCHASE RETURNS API
export const purchaseReturnAPI = {
  getAll: () => api.get('/api/purchase-returns'),
  getById: (id) => api.get(`/api/purchase-returns/${id}`),
  create: (returnData) => api.post('/api/purchase-returns', returnData),
  updateStatus: (id, statusData) => api.put(`/api/purchase-returns/${id}/status`, statusData),
  delete: (id) => api.delete(`/api/purchase-returns/${id}`),
};

//USERS API
export const userAPI = {
  getAll: () => api.get('/api/users'),
  create: (userData) => api.post('/api/register', userData),
  update: (id, userData) => api.put(`/api/users/${id}`, userData),
  delete: (id) => api.delete(`/api/users/${id}`),
};

// SUPPLIERS API
export const supplierAPI = {
  getAll: () => api.get('/api/suppliers'),
  create: (supplierData) => api.post('/api/suppliers', supplierData),
  update: (id, supplierData) => api.put(`/api/suppliers/${id}`, supplierData),
  delete: (id) => api.delete(`/api/suppliers/${id}`),
};

// CUSTOMERS API
export const customerAPI = {
  getAll: () => api.get('/api/customers'),
  search: (query) => api.get(`/api/customers/search?q=${query}`),
  create: (customerData) => api.post('/api/customers', customerData),
  update: (id, customerData) => api.put(`/api/customers/${id}`, customerData),
  delete: (id) => api.delete(`/api/customers/${id}`),
};

// SHIFTS API
export const shiftAPI = {
  getStatus: () => api.get('/api/shifts/status'),
  start: (shiftData) => api.post('/api/shifts/start', shiftData),
  end: (shiftData) => api.post('/api/shifts/end', shiftData),
};

// EXPENSES API
export const expenseAPI = {
  getAll: (params) => api.get('/api/expenses', { params }),
  create: (expenseData) => api.post('/api/expenses', expenseData),
  delete: (id) => api.delete(`/api/expenses/${id}`),
};

// REPORTS API
export const reportAPI = {
  getProfitReport: (params) => api.get('/api/reports/profit', { params }),
  getBestSelling: () => api.get('/api/reports/best-selling'),
  getSalesByCashier: () => api.get('/api/reports/sales-by-cashier'),
  generateReports: (reportData) => api.post('/api/reports/print', reportData),
};

// DISCOUNTS API
export const discountAPI = {
  validate: (discountData) => api.post('/api/discounts/validate', discountData),
  getAll: () => api.get('/api/discounts'),
  create: (discountData) => api.post('/api/discounts', discountData),
  update: (id, discountData) => api.put(`/api/discounts/${id}`, discountData),
  delete: (id) => api.delete(`/api/discounts/${id}`),
};

// SETTINGS API
export const settingsAPI = {
  getQuickProducts: () => api.get('/api/settings/quick-products'),
  updateQuickProducts: (quickProducts) => api.post('/api/settings/quick-products', { quickProducts }),
};

// ---------------------------
// FETCH VERSION (optional)
// ---------------------------
export const getProductsFetch = (cacheBuster = "") => {
  const url = `${API_URL}/api/products${cacheBuster}`;
  logRequest("get", url);
  return fetch(url)
    .then((res) => {
      if (!res.ok) throw new Error("Gagal memuat data produk");
      return res.json();
    });
};

export default api;
