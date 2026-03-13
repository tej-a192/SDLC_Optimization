import api from './api';

/**
 * Registers a new user
 * @param {Object} userData - User registration data
 * @param {string} userData.email - User's email
 * @param {string} userData.password - User's password
 * @returns {Promise<Object>} Registered user data
 */
export const register = async (userData) => {
  try {
    const response = await api.post('/auth/register', userData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || 'Registration failed');
  }
};

/**
 * Logs in a user
 * @param {Object} credentials - User login credentials
 * @param {string} credentials.email - User's email
 * @param {string} credentials.password - User's password
 * @returns {Promise<Object>} Login response with token
 */
export const login = async (credentials) => {
  try {
    const response = await api.post('/auth/login', credentials);
    const { access_token } = response.data;
    if (access_token) {
      localStorage.setItem('token', access_token);
    }
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || 'Login failed');
  }
};

/**
 * Logs out the current user
 */
export const logout = () => {
  localStorage.removeItem('token');
};

/**
 * Gets the current authenticated user
 * @returns {Promise<Object>} Current user data
 */
export const getCurrentUser = async () => {
  try {
    const response = await api.get('/users/me');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || 'Failed to fetch user');
  }
};

/**
 * Checks if user is authenticated
 * @returns {boolean} True if user is authenticated
 */
export const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};

/**
 * Gets the authentication token
 * @returns {string|null} Authentication token
 */
export const getToken = () => {
  return localStorage.getItem('token');
};