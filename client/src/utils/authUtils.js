import api from '../services/api.js';

/**
 * Validate token and fetch current user from server.
 * @returns {Promise<Object|null>} User data or null if invalid.
 */
export const validateTokenAndFetchUser = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return null;
    
    const response = await api.get('/auth/me');
    return response.data.user;
  } catch {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return null;
  }
};

