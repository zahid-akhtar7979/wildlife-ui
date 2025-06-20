import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Box, CircularProgress, Typography } from '@mui/material';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, user, loading, hasRole } = useAuth();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <Box 
        display="flex" 
        flexDirection="column"
        justifyContent="center" 
        alignItems="center" 
        minHeight="50vh"
      >
        <CircularProgress color="primary" size={60} />
        <Typography variant="body1" sx={{ mt: 2 }}>
          Verifying access...
        </Typography>
      </Box>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check if user has required role
  if (requiredRole && !hasRole(requiredRole)) {
    return (
      <Box 
        display="flex" 
        flexDirection="column"
        justifyContent="center" 
        alignItems="center" 
        minHeight="50vh"
        textAlign="center"
        p={3}
      >
        <Typography variant="h4" color="error" gutterBottom>
          Access Denied
        </Typography>
        <Typography variant="body1" color="text.secondary">
          You don't have permission to access this page.
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Required role: {requiredRole} | Your role: {user?.role || 'none'}
        </Typography>
      </Box>
    );
  }

  // Check if user is approved (for contributors)
  if (user && !user.approved && requiredRole === 'contributor') {
    return (
      <Box 
        display="flex" 
        flexDirection="column"
        justifyContent="center" 
        alignItems="center" 
        minHeight="50vh"
        textAlign="center"
        p={3}
      >
        <Typography variant="h4" color="warning.main" gutterBottom>
          Account Pending Approval
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Your account is waiting for admin approval.
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          You'll receive access once your credentials are verified.
        </Typography>
      </Box>
    );
  }

  // Render protected content
  return children;
};

export default ProtectedRoute; 