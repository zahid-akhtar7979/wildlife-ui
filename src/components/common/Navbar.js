import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Box,
  Divider,
  TextField,
  InputAdornment,
  useTheme,
  useMediaQuery,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  Menu as MenuIcon,
  AccountCircle,
  Logout,
  Search,
  EditOutlined,
  Close,
  Park,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleUserMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setAnchorEl(null);
  };

  const handleMobileDrawerToggle = () => {
    setMobileDrawerOpen(!mobileDrawerOpen);
  };

  const handleLogout = () => {
    logout();
    handleUserMenuClose();
    setMobileDrawerOpen(false);
    navigate('/');
  };

  const handleNavigation = (path) => {
    navigate(path);
    handleUserMenuClose();
    setMobileDrawerOpen(false);
  };

  const isActivePage = (path) => {
    return location.pathname === path;
  };

  const renderUserMenu = () => (
    <Menu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={handleUserMenuClose}
      PaperProps={{
        elevation: 3,
        sx: {
          mt: 1.5,
          minWidth: 200,
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          '& .MuiMenuItem-root': {
            px: 2,
            py: 1.5,
          },
        },
      }}
    >
      <MenuItem disabled sx={{ borderBottom: '1px solid #f3f4f6' }}>
        <Box>
          <Typography variant="body2" fontWeight="500" color="text.secondary">
            {user?.name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {user?.email}
          </Typography>
        </Box>
      </MenuItem>
      
      <MenuItem onClick={handleLogout} sx={{ color: '#374151' }}>
        <Logout sx={{ mr: 1.5, fontSize: 18 }} />
        Sign out
      </MenuItem>
    </Menu>
  );

  const renderMobileDrawer = () => (
    <Drawer
      anchor="right"
      open={mobileDrawerOpen}
      onClose={handleMobileDrawerToggle}
      PaperProps={{
        sx: { width: 280, backgroundColor: 'white' }
      }}
    >
      <Box sx={{ p: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" fontWeight={600}>Menu</Typography>
          <IconButton onClick={handleMobileDrawerToggle}>
            <Close />
          </IconButton>
        </Box>

        {/* Mobile Search */}
        <Box mb={3}>
          <TextField
            fullWidth
            placeholder="Search articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: '#9ca3af' }} />
                </InputAdornment>
              ),
              sx: {
                borderRadius: '8px',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#d1d5db'
                }
              }
            }}
          />
        </Box>

        {/* Mobile Navigation */}
        <List sx={{ p: 0 }}>
          <ListItem disablePadding>
            <ListItemButton 
              onClick={() => handleNavigation('/')}
              sx={{ borderRadius: '6px', mb: 1 }}
            >
              <ListItemText primary="Articles" />
            </ListItemButton>
          </ListItem>
          
          {isAuthenticated ? (
            <>
              <ListItem disablePadding>
                <ListItemButton 
                  onClick={() => handleNavigation('/dashboard')}
                  sx={{ borderRadius: '6px', mb: 1 }}
                >
                  <ListItemText primary="Dashboard" />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton 
                  onClick={() => handleNavigation('/create-article')}
                  sx={{ borderRadius: '6px', mb: 2 }}
                >
                  <ListItemText primary="Write Article" />
                </ListItemButton>
              </ListItem>
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ px: 2, py: 1, backgroundColor: '#f9fafb', borderRadius: '6px', mb: 2 }}>
                <Typography variant="body2" fontWeight={500}>{user?.name}</Typography>
                <Typography variant="caption" color="text.secondary">{user?.email}</Typography>
              </Box>
              
              <ListItem disablePadding>
                <ListItemButton 
                  onClick={handleLogout}
                  sx={{ borderRadius: '6px', color: '#374151' }}
                >
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <Logout sx={{ fontSize: 18 }} />
                  </ListItemIcon>
                  <ListItemText primary="Sign out" />
                </ListItemButton>
              </ListItem>
            </>
          ) : (
            <ListItem disablePadding>
              <ListItemButton 
                onClick={() => handleNavigation('/login')}
                sx={{ 
                  borderRadius: '6px', 
                  backgroundColor: '#2e7d32', 
                  color: 'white',
                  '&:hover': { backgroundColor: '#1b5e20' }
                }}
              >
                <ListItemText primary="Contributor Login" />
              </ListItemButton>
            </ListItem>
          )}
        </List>
      </Box>
    </Drawer>
  );

  return (
    <>
      <AppBar 
        position="sticky" 
        elevation={0}
        sx={{ 
          backgroundColor: 'white',
          borderBottom: '1px solid #e5e7eb',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
        }}
      >
        <Toolbar sx={{ height: 64, px: { xs: 2, sm: 3, lg: 4 } }}>
          {/* Logo */}
          <Box 
            display="flex" 
            alignItems="center" 
            sx={{ cursor: 'pointer' }}
            onClick={() => navigate('/')}
          >
            <Park sx={{ fontSize: 32, color: '#2e7d32', mr: 1 }} />
            <Typography 
              variant="h6" 
              component="div" 
              sx={{ 
                fontWeight: 700,
                fontSize: '1.25rem',
                color: '#2e7d32'
              }}
            >
              Wildlife Geography
            </Typography>
          </Box>

          {/* Search Bar - Desktop */}
          {!isMobile && (
            <Box sx={{ flex: 1, maxWidth: 512, mx: 4 }}>
              <TextField
                fullWidth
                placeholder="Search articles, species, regions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search sx={{ color: '#9ca3af' }} />
                    </InputAdornment>
                  ),
                  sx: {
                    borderRadius: '8px',
                    backgroundColor: 'white',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#d1d5db'
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#9ca3af'
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#2e7d32',
                      borderWidth: '2px'
                    }
                  }
                }}
              />
            </Box>
          )}

          {/* Desktop Navigation */}
          {!isMobile && (
            <Box display="flex" alignItems="center" gap={4}>
              <Button 
                onClick={() => navigate('/')}
                sx={{ 
                  color: isActivePage('/') ? '#2e7d32' : '#374151',
                  textTransform: 'none',
                  fontWeight: 500,
                  fontSize: '0.875rem',
                  position: 'relative',
                  '&:hover': {
                    backgroundColor: 'transparent',
                    color: '#2e7d32'
                  },
                  '&::after': isActivePage('/') ? {
                    content: '""',
                    position: 'absolute',
                    bottom: -8,
                    left: 0,
                    right: 0,
                    height: 2,
                    backgroundColor: '#2e7d32'
                  } : {}
                }}
              >
                Articles
              </Button>
              
              {isAuthenticated && (
                <>
                  <Button 
                    onClick={() => navigate('/dashboard')}
                    sx={{ 
                      color: isActivePage('/dashboard') ? '#2e7d32' : '#374151',
                      textTransform: 'none',
                      fontWeight: 500,
                      fontSize: '0.875rem',
                      position: 'relative',
                      '&:hover': {
                        backgroundColor: 'transparent',
                        color: '#2e7d32'
                      },
                      '&::after': isActivePage('/dashboard') ? {
                        content: '""',
                        position: 'absolute',
                        bottom: -8,
                        left: 0,
                        right: 0,
                        height: 2,
                        backgroundColor: '#2e7d32'
                      } : {}
                    }}
                  >
                    Dashboard
                  </Button>
                  
                  <Button 
                    onClick={() => navigate('/create-article')}
                    startIcon={<EditOutlined sx={{ fontSize: 16 }} />}
                    sx={{ 
                      backgroundColor: '#2e7d32',
                      color: 'white',
                      textTransform: 'none',
                      fontWeight: 500,
                      fontSize: '0.875rem',
                      px: 2,
                      py: 1,
                      borderRadius: '8px',
                      '&:hover': {
                        backgroundColor: '#1b5e20'
                      }
                    }}
                  >
                    Write Article
                  </Button>
                  
                  {/* User Menu */}
                  <Button
                    onClick={handleUserMenuOpen}
                    startIcon={<AccountCircle />}
                    sx={{ 
                      color: '#374151',
                      textTransform: 'none',
                      fontWeight: 500,
                      fontSize: '0.875rem',
                      '&:hover': {
                        backgroundColor: 'transparent',
                        color: '#2e7d32'
                      }
                    }}
                  >
                    {user?.name}
                  </Button>
                </>
              )}
              
              {!isAuthenticated && (
                <Button 
                  onClick={() => navigate('/login')}
                  sx={{ 
                    backgroundColor: '#2e7d32',
                    color: 'white',
                    textTransform: 'none',
                    fontWeight: 500,
                    fontSize: '0.875rem',
                    px: 3,
                    py: 1,
                    borderRadius: '8px',
                    '&:hover': {
                      backgroundColor: '#1b5e20'
                    }
                  }}
                >
                  Contributor Login
                </Button>
              )}
            </Box>
          )}

          {/* Mobile Menu Button */}
          {isMobile && (
            <Box sx={{ ml: 'auto' }}>
              <IconButton
                onClick={handleMobileDrawerToggle}
                sx={{ color: '#374151', p: 1 }}
              >
                <MenuIcon />
              </IconButton>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      {/* Render Menus */}
      {renderUserMenu()}
      {renderMobileDrawer()}
    </>
  );
};

export default Navbar; 