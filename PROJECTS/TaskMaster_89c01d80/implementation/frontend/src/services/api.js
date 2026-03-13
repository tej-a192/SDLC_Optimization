import axios from 'axios';

/**
 * Axios instance with base configuration for API requests
 * @type {import('axios').AxiosInstance}
 */
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      console.error('Network error: Please check your connection');
    } else if (error.response.status === 401) {
      // Redirect to login or refresh token
      localStorage.removeItem('accessToken');
      window.location.href = '/login';
    } else if (error.response.status === 403) {
      console.error('Access forbidden');
    } else if (error.response.status >= 500) {
      console.error('Server error');
    }
    return Promise.reject(error);
  }
);

export default api;