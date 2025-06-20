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
    // Try both possible token key names for compatibility
    const token = localStorage.getItem('authToken') || localStorage.getItem('token');
    const url = config.url;
    
    console.log('🌐 Making request to:', url);
    console.log('🔍 Checking localStorage for token...');
    console.log('   - authToken:', localStorage.getItem('authToken') ? 'FOUND' : 'NOT FOUND');
    console.log('   - token:', localStorage.getItem('token') ? 'FOUND' : 'NOT FOUND');
    console.log('🔑 Using token:', token ? token.substring(0, 20) + '...' : 'NONE');
    
    // Check for mock token and force logout
    if (token && token.includes('mock-jwt-token')) {
      console.log('🚨 MOCK TOKEN DETECTED! Force logout...');
      authService.forceLogout();
      return Promise.reject(new Error('Mock token detected - forcing logout'));
    }
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('✅ Adding auth token to request headers');
      console.log('📋 Request headers:', {
        ...config.headers,
        Authorization: `Bearer ${token.substring(0, 20)}...`
      });
    } else {
      console.log('⚠️ No auth token found for request:', url);
      console.log('💾 All localStorage keys:', Object.keys(localStorage));
      console.log('💾 All localStorage values:', Object.fromEntries(Object.keys(localStorage).map(key => [key, localStorage.getItem(key)])));
    }
    return config;
  },
  (error) => {
    console.log('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => {
    console.log('✅ Response received:', response.status, response.config.url);
    return response;
  },
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url;
    const data = error.response?.data;
    
    console.log('❌ Response error:', status, url);
    console.log('📄 Error details:', data);
    
    if (status === 401) {
      console.log('🚫 401 Unauthorized - checking current token...');
      const currentToken = localStorage.getItem('authToken') || localStorage.getItem('token');
      const currentUser = localStorage.getItem('userData') || localStorage.getItem('user');
      
      console.log('🔍 Current token exists:', !!currentToken);
      console.log('🔍 Current user exists:', !!currentUser);
      
      if (currentToken) {
        console.log('🔑 Token preview:', currentToken.substring(0, 50) + '...');
      }
      
      // Unauthorized - clear token and redirect to login
      console.log('🧹 Clearing localStorage and redirecting to login');
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // window.location.href = '/login'; // Comment out for debugging
    }
    return Promise.reject(error);
  }
);

export const authService = {
  // Force clear all authentication data
  forceLogout: () => {
    // Clear localStorage completely
    localStorage.clear();
    sessionStorage.clear();
    
    // Clear all possible token keys
    ['authToken', 'token', 'userData', 'user', 'currentUser'].forEach(key => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });
    
    // Remove auth header
    delete api.defaults.headers.common['Authorization'];
    
    console.log('🧹 FORCE LOGOUT: All auth data cleared');
    
    // Reload page to ensure clean state
    window.location.href = '/login';
  },

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
    const token = localStorage.getItem('authToken') || localStorage.getItem('token');
    if (token) {
      // Check if token is a mock token and clear it
      if (token.includes('mock-jwt-token')) {
        console.log('🗑️ Clearing invalid mock token');
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        return;
      }
      
      authService.setAuthToken(token);
      console.log('🔄 Auth token initialized from localStorage');
      console.log('🔍 Token source:', localStorage.getItem('authToken') ? 'authToken' : 'token');
    } else {
      console.log('⚠️ No auth token found during initialization');
      console.log('💾 Available keys:', Object.keys(localStorage));
    }
  },

  // Remove auth token
  removeAuthToken: () => {
    delete api.defaults.headers.common['Authorization'];
  },

  // Login
  login: async (email, password) => {
    try {
      console.log('🔐 Attempting login for:', email);
      const response = await api.post('/auth/login', { email, password });
      
      console.log('📦 Login response:', response.data);
      
      // Store token and user data - Backend returns token and user directly in response.data
      if (response.data.success && response.data.token) {
        const token = response.data.token;
        const user = response.data.user;
        
        console.log('💾 Storing token:', token.substring(0, 20) + '...');
        console.log('👤 Storing user:', user);
        
        localStorage.setItem('authToken', token);
        localStorage.setItem('userData', JSON.stringify(user));
        
        // Set token for future requests
        authService.setAuthToken(token);
        
        // Verify storage
        const storedToken = localStorage.getItem('authToken');
        const storedUser = localStorage.getItem('userData');
        console.log('✅ Token stored successfully:', storedToken ? storedToken.substring(0, 20) + '...' : 'MISSING');
        console.log('✅ User stored successfully:', storedUser ? 'YES' : 'MISSING');
        
        console.log('✅ Login successful, token stored:', token.substring(0, 20) + '...');
      } else {
        console.log('❌ Login response missing token or success flag:', response.data);
      }
      
      return response.data;
    } catch (error) {
      console.log('❌ Login error:', error.response?.data || error.message);
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
      const userData = localStorage.getItem('userData') || localStorage.getItem('user');
      const token = localStorage.getItem('authToken') || localStorage.getItem('token');
      
      console.log('🔍 getCurrentUser - checking localStorage:');
      console.log('   - userData/user:', userData ? 'FOUND' : 'NOT FOUND');
      console.log('   - authToken/token:', token ? 'FOUND' : 'NOT FOUND');
      
      if (userData && token) {
        console.log('✅ Getting user from localStorage');
        const user = JSON.parse(userData);
        return { 
          success: true,
          data: { user } 
        };
      }
      
      // If localStorage doesn't have data, try API call
      console.log('🌐 Trying to get user from API...');
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
      // Clear local storage - both possible key names
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      authService.removeAuthToken();
      
      console.log('🧹 Logout complete - cleared all localStorage keys');
      
      return { data: { message: 'Logged out successfully' } };
    } catch (error) {
      throw error;
    }
  },
};

// Initialize auth service on module load
authService.init();

// Make force logout available globally for debugging
window.forceLogout = authService.forceLogout;
console.log('🛠️ Global forceLogout() function available in console');

export default api; 