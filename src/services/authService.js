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
      console.log('🔑 Adding auth token to request:', config.url, token.substring(0, 20) + '...');
    } else {
      console.log('⚠️ No auth token found for request:', config.url);
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
      console.log('🔑 Auth token set in default headers');
    } else {
      delete api.defaults.headers.common['Authorization'];
      console.log('🔓 Auth token removed from default headers');
    }
  },

  // Initialize auth token from localStorage
  init: () => {
    const token = localStorage.getItem('authToken');
    if (token) {
      authService.setAuthToken(token);
      console.log('🔄 Auth token initialized from localStorage');
    }
  },

  // Remove auth token
  removeAuthToken: () => {
    delete api.defaults.headers.common['Authorization'];
  },

  // Login
  login: async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      
      // Store token and user data - Backend returns token and user directly in response.data
      if (response.data.success && response.data.token) {
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('userData', JSON.stringify(response.data.user));
        
        // Set token for future requests
        authService.setAuthToken(response.data.token);
        
        console.log('✅ Login successful, token stored:', response.data.token.substring(0, 20) + '...');
      }
      
      return response.data;
    } catch (error) {
      // Handle API error response
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw error;
    }
  },

  // Register (for admin to create new users)
  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw error;
    }
  },

  // Get current user
  getCurrentUser: async () => {
    try {
      // Try to get from localStorage first (since profile endpoint may not exist)
      const userData = localStorage.getItem('userData');
      const token = localStorage.getItem('authToken');
      
      if (userData && token) {
        console.log('✅ Getting user from localStorage');
        return { 
          success: true,
          data: { user: JSON.parse(userData) } 
        };
      }
      
      // If localStorage doesn't have data, try API call
      const response = await api.get('/auth/profile');
      return response.data;
    } catch (error) {
      console.log('❌ Failed to get current user:', error.message);
      throw error;
    }
  },

  // Logout
  logout: async () => {
    try {
      // Clear local storage
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      authService.removeAuthToken();
      
      return { data: { message: 'Logged out successfully' } };
    } catch (error) {
      throw error;
    }
  },
};

// Initialize auth service on module load
authService.init();

export default api; 