import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor to add JWT token from localStorage and handle FormData
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('smis_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Let the browser set Content-Type with boundary for multipart/form-data
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
