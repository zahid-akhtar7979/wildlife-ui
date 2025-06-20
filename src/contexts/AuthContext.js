import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

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
    // Initialize auth state from stored data
    const initializeAuth = async () => {
      try {
        console.log('🔄 AuthContext: Initializing authentication...');
        
        // Let authService handle the initialization
        authService.init();
        
        // Check if we have a valid user
        const result = await authService.getCurrentUser();
        
        if (result.success && result.data?.user) {
          console.log('✅ AuthContext: User found during initialization');
          setUser(result.data.user);
          setIsAuthenticated(true);
        } else {
          console.log('⚠️ AuthContext: No valid user found during initialization');
        }
      } catch (error) {
        console.log('❌ AuthContext: Error during initialization:', error.message);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    try {
      console.log('🔐 AuthContext: Attempting login for:', email);
      
      // Use real authService for backend authentication
      const result = await authService.login(email, password);
      
      console.log('📦 AuthContext: Login result:', result);
      
      if (result.success && result.user) {
        console.log('✅ AuthContext: Login successful');
        setUser(result.user);
        setIsAuthenticated(true);
        return { success: true, user: result.user };
      } else {
        console.log('❌ AuthContext: Login failed:', result.message);
        return { success: false, error: result.message || 'Login failed' };
      }
    } catch (error) {
      console.error('❌ AuthContext: Login error:', error);
      return { success: false, error: error.message || 'Login failed' };
    }
  };

  const logout = async () => {
    try {
      console.log('🚪 AuthContext: Logging out');
      
      // Use real authService for logout
      await authService.logout();
      
      setUser(null);
      setIsAuthenticated(false);
      
      console.log('✅ AuthContext: Logout successful');
    } catch (error) {
      console.error('❌ AuthContext: Logout error:', error);
      
      // Even if logout fails, clear local state
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const register = async (userData) => {
    try {
      console.log('📝 AuthContext: Attempting registration for:', userData.email);
      
      // Use real authService for backend registration
      const result = await authService.register(userData);
      
      console.log('📦 AuthContext: Registration result:', result);
      
      if (result.success && result.user) {
        console.log('✅ AuthContext: Registration successful');
        setUser(result.user);
        setIsAuthenticated(true);
        return { success: true, user: result.user };
      } else {
        console.log('❌ AuthContext: Registration failed:', result.message);
        return { success: false, error: result.message || 'Registration failed' };
      }
    } catch (error) {
      console.error('❌ AuthContext: Registration error:', error);
      return { success: false, error: error.message || 'Registration failed' };
    }
  };

  const hasRole = (role) => {
    if (!user?.role) return false;
    
    const userRole = user.role.toLowerCase();
    const requiredRole = role.toLowerCase();
    
    console.log('🔐 Role check:', { userRole, requiredRole, hasAccess: userRole === requiredRole || userRole === 'admin' });
    
    // Admin has access to everything, or exact role match
    return userRole === requiredRole || userRole === 'admin';
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