import axios from 'axios';

// Base URL for API - In production, this would be your actual backend URL
// const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://wildlife-api-java-production.up.railway.app/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token refresh configuration
const REFRESH_TOKEN_BEFORE_EXPIRY = 5 * 60 * 1000; // 5 minutes in milliseconds
let tokenRefreshTimeout;

// Function to parse JWT token and get expiration time
const getTokenExpirationTime = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => 
      '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
    ).join(''));
    const { exp } = JSON.parse(jsonPayload);
    return exp * 1000; // Convert to milliseconds
  } catch (error) {
    console.error('Error parsing token:', error);
    return null;
  }
};

// Function to schedule token refresh
const scheduleTokenRefresh = (token) => {
  if (!token) return;

  // Clear any existing refresh timeout
  if (tokenRefreshTimeout) {
    clearTimeout(tokenRefreshTimeout);
  }

  const expirationTime = getTokenExpirationTime(token);
  if (!expirationTime) return;

  const timeUntilRefresh = expirationTime - Date.now() - REFRESH_TOKEN_BEFORE_EXPIRY;
  
  if (timeUntilRefresh <= 0) {
    // Token is already expired or will expire very soon
    authService.forceLogout();
    return;
  }

  console.log(`🕒 Scheduling token refresh in ${Math.floor(timeUntilRefresh / 1000 / 60)} minutes`);
  
  tokenRefreshTimeout = setTimeout(async () => {
    try {
      // Try to refresh the token
      const response = await api.post('/auth/refresh-token');
      if (response.data?.token) {
        localStorage.setItem('authToken', response.data.token);
        authService.setAuthToken(response.data.token);
        scheduleTokenRefresh(response.data.token);
        console.log('🔄 Token refreshed successfully');
      } else {
        throw new Error('No token in refresh response');
      }
    } catch (error) {
      console.error('Failed to refresh token:', error);
      authService.forceLogout();
    }
  }, timeUntilRefresh);
};

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken') || localStorage.getItem('token');
    const url = config.url;
    
    if (token) {
      // Check token expiration
      const expirationTime = getTokenExpirationTime(token);
      if (expirationTime && Date.now() >= expirationTime) {
        console.log('🚨 Token expired, forcing logout');
        authService.forceLogout();
        return Promise.reject(new Error('Token expired'));
      }

      config.headers.Authorization = `Bearer ${token}`;
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
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    
    // Handle 401/403 responses
    if ((status === 401 || status === 403) && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Try to refresh the token
        const response = await api.post('/auth/refresh-token');
        if (response.data?.token) {
          localStorage.setItem('authToken', response.data.token);
          authService.setAuthToken(response.data.token);
          scheduleTokenRefresh(response.data.token);
          
          // Retry the original request
          return api(originalRequest);
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        authService.forceLogout();
      }
    }
    
    return Promise.reject(error);
  }
);

export const authService = {
  // Force clear all authentication data
  forceLogout: () => {
    if (tokenRefreshTimeout) {
      clearTimeout(tokenRefreshTimeout);
    }
    
    localStorage.clear();
    sessionStorage.clear();
    
    ['authToken', 'token', 'userData', 'user', 'currentUser'].forEach(key => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });
    
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
      
      if (response.data.success && response.data.token) {
        const token = response.data.token;
        const user = response.data.user;
        
        localStorage.setItem('authToken', token);
        localStorage.setItem('userData', JSON.stringify(user));
        
        authService.setAuthToken(token);
        scheduleTokenRefresh(token); // Schedule token refresh
        
        return { success: true, user: response.data.user };
      } else {
        return { success: false, error: response.data.message || 'Login failed' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message || 'Login failed' };
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
      if (tokenRefreshTimeout) {
        clearTimeout(tokenRefreshTimeout);
      }
      
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      authService.removeAuthToken();
      
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