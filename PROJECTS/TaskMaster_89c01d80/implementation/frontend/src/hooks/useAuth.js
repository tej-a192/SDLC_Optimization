import { useState, useEffect } from 'react';

/**
 * Custom hook for managing authentication state
 * @returns {Object} Authentication state and methods
 */
const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /**
   * Login user with email and password
   * @param {string} email - User's email
   * @param {string} password - User's password
   * @returns {Promise<Object>} Response object with success status and message
   */
  const login = async (email, password) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Login failed');
      }

      const userData = await response.json();
      localStorage.setItem('token', userData.access_token);
      setUser(userData.user);
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  /**
   * Register new user
   * @param {string} email - User's email
   * @param {string} password - User's password
   * @returns {Promise<Object>} Response object with success status and message
   */
  const register = async (email, password) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Registration failed');
      }

      const userData = await response.json();
      localStorage.setItem('token', userData.access_token);
      setUser(userData.user);
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  /**
   * Logout current user
   */
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  /**
   * Check if user is authenticated
   * @returns {boolean} True if user is authenticated
   */
  const isAuthenticated = () => {
    return !!user;
  };

  // Check for existing token on initial load
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // In a real app, you would validate the token with the backend
      // For now, we'll just set a mock user
      setUser({ id: 1, email: 'user@example.com' });
    }
    setLoading(false);
  }, []);

  return {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated,
  };
};

export default useAuth;