import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored auth data on mount
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
    }
    
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      // Mock login with demo credentials
      let mockUser;
      
      if (email === 'admin@wildlife.com' && password === 'admin123') {
        mockUser = {
          id: 1,
          name: 'Admin User',
          email: email,
          role: 'admin',
          approved: true
        };
      } else if (email === 'researcher@wildlife.com' && password === 'researcher123') {
        mockUser = {
          id: 2,
          name: 'Dr. Sarah Wilson',
          email: email,
          role: 'contributor',
          approved: true
        };
      } else {
        // For any other email/password, create a contributor user
        mockUser = {
          id: 3,
          name: 'Wildlife Researcher',
          email: email,
          role: 'contributor',
          approved: true
        };
      }
      
      const mockToken = 'mock-jwt-token';
      
      setUser(mockUser);
      setIsAuthenticated(true);
      
      localStorage.setItem('user', JSON.stringify(mockUser));
      localStorage.setItem('token', mockToken);
      
      return { success: true, user: mockUser };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Login failed' };
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  const register = async (userData) => {
    try {
      // Mock registration - replace with actual API call
      const newUser = {
        id: Date.now(),
        ...userData,
        role: 'contributor',
        approved: true
      };
      
      const mockToken = 'mock-jwt-token';
      
      setUser(newUser);
      setIsAuthenticated(true);
      
      localStorage.setItem('user', JSON.stringify(newUser));
      localStorage.setItem('token', mockToken);
      
      return { success: true, user: newUser };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: 'Registration failed' };
    }
  };

  const hasRole = (role) => {
    return user?.role === role || user?.role === 'admin';
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
    register,
    hasRole
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 