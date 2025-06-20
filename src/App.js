import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/common/Navbar';
import HomePage from './pages/HomePage';
import ArticleDetailPage from './pages/ArticleDetailPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import CreateArticlePage from './pages/CreateArticlePage';
import EditArticlePage from './pages/EditArticlePage';
import AdminPage from './pages/AdminPage';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Wildlife Geography theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#2e7d32', // Forest green
      light: '#60ad5e',
      dark: '#1b5e20',
    },
    secondary: {
      main: '#4caf50', // Lighter green
      light: '#80e27e',
      dark: '#087f23',
    },
    background: {
      default: '#fafafa',
      paper: '#ffffff',
    },
    text: {
      primary: '#212121',
      secondary: '#666666',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      color: '#212121',
    },
    h2: {
      fontWeight: 600,
      color: '#212121',
    },
    h3: {
      fontWeight: 600,
      color: '#212121',
    },
    h4: {
      fontWeight: 600,
      color: '#212121',
    },
    h5: {
      fontWeight: 500,
      color: '#212121',
    },
    h6: {
      fontWeight: 500,
      color: '#212121',
    },
    body1: {
      lineHeight: 1.6,
    },
    body2: {
      lineHeight: 1.5,
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          borderRadius: '12px',
          border: '1px solid #f0f0f0',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          textTransform: 'none',
          fontWeight: 500,
          fontSize: '0.95rem',
        },
        contained: {
          boxShadow: '0 2px 4px rgba(46, 125, 50, 0.2)',
          '&:hover': {
            boxShadow: '0 4px 8px rgba(46, 125, 50, 0.3)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '8px',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: '16px',
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <div className="App">
            <Navbar />
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/article/:id" element={<ArticleDetailPage />} />
              <Route path="/login" element={<LoginPage />} />
              
              {/* Protected routes for contributors */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute requiredRole="contributor">
                    <DashboardPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/create-article" 
                element={
                  <ProtectedRoute requiredRole="contributor">
                    <CreateArticlePage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/edit-article/:id" 
                element={
                  <ProtectedRoute requiredRole="contributor">
                    <EditArticlePage />
                  </ProtectedRoute>
                } 
              />
              
              {/* Admin routes */}
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminPage />
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
