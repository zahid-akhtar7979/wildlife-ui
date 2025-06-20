import axios from 'axios';

// Base URL for API - In production, this would be your actual backend URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  // Set auth token
  setAuthToken: (token) => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common['Authorization'];
    }
  },

  // Remove auth token
  removeAuthToken: () => {
    delete api.defaults.headers.common['Authorization'];
  },

  // Login
  login: async (email, password) => {
    try {
      // Mock login for development - replace with actual API call
      if (email === 'admin@wildlife.com' && password === 'admin123') {
        return {
          data: {
            user: {
              id: 1,
              email: 'admin@wildlife.com',
              name: 'Admin User',
              role: 'admin',
              approved: true,
            },
            token: 'mock-admin-token-123',
          },
        };
      } else if (email === 'researcher@wildlife.com' && password === 'researcher123') {
        return {
          data: {
            user: {
              id: 2,
              email: 'researcher@wildlife.com',
              name: 'Wildlife Researcher',
              role: 'contributor',
              approved: true,
            },
            token: 'mock-researcher-token-456',
          },
        };
      } else {
        throw new Error('Invalid credentials');
      }
      
      // Actual API call would be:
      // return await api.post('/auth/login', { email, password });
    } catch (error) {
      throw error;
    }
  },

  // Register (for admin to create new users)
  register: async (userData) => {
    try {
      // Mock registration - replace with actual API call
      return {
        data: {
          message: 'User registered successfully',
          user: {
            id: Date.now(),
            ...userData,
            approved: false,
          },
        },
      };
      
      // Actual API call would be:
      // return await api.post('/auth/register', userData);
    } catch (error) {
      throw error;
    }
  },

  // Get current user
  getCurrentUser: async () => {
    try {
      // Mock current user - replace with actual API call
      const userData = localStorage.getItem('userData');
      if (userData) {
        return { data: { user: JSON.parse(userData) } };
      }
      throw new Error('No user data found');
      
      // Actual API call would be:
      // return await api.get('/auth/me');
    } catch (error) {
      throw error;
    }
  },

  // Logout
  logout: async () => {
    try {
      // Mock logout - replace with actual API call
      return { data: { message: 'Logged out successfully' } };
      
      // Actual API call would be:
      // return await api.post('/auth/logout');
    } catch (error) {
      throw error;
    }
  },
};

export default api; 