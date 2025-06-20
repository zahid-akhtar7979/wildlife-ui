import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  Alert,
  Skeleton,
  Tabs,
  Tab,
  Avatar,
} from '@mui/material';
import {
  Dashboard,
  People,
  Article,
  MoreVert,
  Check,
  Close,
  Add,
  Edit,
  Delete,
  Visibility,
  TrendingUp,
  Security,
  Settings,
} from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { authService } from '../services/authService';
import { articleService } from '../services/articleService';
import { format } from 'date-fns';

const AdminPage = () => {
  const [tabValue, setTabValue] = useState(0);
  const [users, setUsers] = useState([]);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState('');
  const [stats, setStats] = useState({
    totalUsers: 0,
    pendingUsers: 0,
    totalArticles: 0,
    publishedArticles: 0,
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Mock data - in real app these would be separate API calls
      const mockUsers = [
        {
          id: 1,
          name: 'Admin User',
          email: 'admin@wildlife.com',
          role: 'admin',
          approved: true,
          createdAt: '2024-01-01T00:00:00Z',
        },
        {
          id: 2,
          name: 'Dr. Sarah Williams',
          email: 'researcher@wildlife.com',
          role: 'contributor',
          approved: true,
          createdAt: '2024-01-05T00:00:00Z',
        },
        {
          id: 3,
          name: 'Dr. John Smith',
          email: 'john.smith@university.edu',
          role: 'contributor',
          approved: false,
          createdAt: '2024-01-20T00:00:00Z',
        },
        {
          id: 4,
          name: 'Dr. Maria Garcia',
          email: 'maria.garcia@research.org',
          role: 'contributor',
          approved: false,
          createdAt: '2024-01-22T00:00:00Z',
        },
      ];

      const articlesResponse = await articleService.getArticles();
      const allArticles = articlesResponse.data.articles;

      setUsers(mockUsers);
      setArticles(allArticles);
      
      setStats({
        totalUsers: mockUsers.length,
        pendingUsers: mockUsers.filter(u => !u.approved).length,
        totalArticles: allArticles.length,
        publishedArticles: allArticles.filter(a => a.published).length,
      });
    } catch (err) {
      setError('Failed to load admin data.');
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMenuOpen = (event, item, type) => {
    setMenuAnchor(event.currentTarget);
    setSelectedItem({ ...item, type });
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setSelectedItem(null);
  };

  const handleApproveUser = async (userId) => {
    try {
      // Mock API call
      setUsers(users.map(user => 
        user.id === userId ? { ...user, approved: true } : user
      ));
      setStats(prev => ({ ...prev, pendingUsers: prev.pendingUsers - 1 }));
    } catch (err) {
      console.error('Error approving user:', err);
    }
    handleMenuClose();
  };

  const handleRejectUser = async (userId) => {
    try {
      // Mock API call
      setUsers(users.filter(user => user.id !== userId));
      setStats(prev => ({ 
        ...prev, 
        totalUsers: prev.totalUsers - 1,
        pendingUsers: prev.pendingUsers - 1 
      }));
    } catch (err) {
      console.error('Error rejecting user:', err);
    }
    handleMenuClose();
  };

  const handleCreateUser = async (data) => {
    try {
      const newUser = {
        id: Date.now(),
        ...data,
        approved: true,
        createdAt: new Date().toISOString(),
      };
      
      await authService.register(newUser);
      setUsers([...users, newUser]);
      setStats(prev => ({ ...prev, totalUsers: prev.totalUsers + 1 }));
      setDialogOpen(false);
      reset();
    } catch (err) {
      console.error('Error creating user:', err);
    }
  };

  const openDialog = (type) => {
    setDialogType(type);
    setDialogOpen(true);
  };

  const StatCard = ({ title, value, icon, color = 'primary', subtitle }) => (
    <Card elevation={2}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="h4" fontWeight="bold" color={`${color}.main`}>
              {value}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          <Box sx={{ color: `${color}.main` }}>
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  const UsersTable = () => (
    <TableContainer component={Paper} elevation={2}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>User</TableCell>
            <TableCell>Role</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Joined</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>
                <Box display="flex" alignItems="center" gap={2}>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    {user.name.charAt(0)}
                  </Avatar>
                  <Box>
                    <Typography variant="body2" fontWeight="bold">
                      {user.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {user.email}
                    </Typography>
                  </Box>
                </Box>
              </TableCell>
              <TableCell>
                <Chip 
                  label={user.role} 
                  color={user.role === 'admin' ? 'error' : 'primary'}
                  size="small"
                />
              </TableCell>
              <TableCell>
                <Chip 
                  label={user.approved ? 'Approved' : 'Pending'}
                  color={user.approved ? 'success' : 'warning'}
                  size="small"
                />
              </TableCell>
              <TableCell>
                {format(new Date(user.createdAt), 'MMM dd, yyyy')}
              </TableCell>
              <TableCell align="right">
                <IconButton 
                  onClick={(e) => handleMenuOpen(e, user, 'user')}
                  size="small"
                >
                  <MoreVert />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const ArticlesTable = () => (
    <TableContainer component={Paper} elevation={2}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Article</TableCell>
            <TableCell>Author</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Published</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {articles.map((article) => (
            <TableRow key={article.id}>
              <TableCell>
                <Box>
                  <Typography variant="body2" fontWeight="bold">
                    {article.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {article.tags.slice(0, 3).join(', ')}
                  </Typography>
                </Box>
              </TableCell>
              <TableCell>
                <Typography variant="body2">
                  {article.author.name}
                </Typography>
              </TableCell>
              <TableCell>
                <Chip 
                  label={article.published ? 'Published' : 'Draft'}
                  color={article.published ? 'success' : 'warning'}
                  size="small"
                />
                {article.featured && (
                  <Chip 
                    label="Featured" 
                    color="primary" 
                    size="small"
                    sx={{ ml: 1 }}
                  />
                )}
              </TableCell>
              <TableCell>
                {article.published 
                  ? format(new Date(article.publishDate), 'MMM dd, yyyy')
                  : 'Not published'
                }
              </TableCell>
              <TableCell align="right">
                <IconButton 
                  onClick={(e) => handleMenuOpen(e, article, 'article')}
                  size="small"
                >
                  <MoreVert />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const CreateUserDialog = () => (
    <Dialog open={dialogOpen && dialogType === 'user'} onClose={() => setDialogOpen(false)}>
      <DialogTitle>Create New User</DialogTitle>
      <form onSubmit={handleSubmit(handleCreateUser)}>
        <DialogContent>
          <TextField
            {...register('name', { required: 'Name is required' })}
            fullWidth
            label="Full Name"
            margin="normal"
            error={!!errors.name}
            helperText={errors.name?.message}
          />
          <TextField
            {...register('email', { 
              required: 'Email is required',
              pattern: {
                value: /^\S+@\S+$/i,
                message: 'Invalid email address'
              }
            })}
            fullWidth
            label="Email"
            type="email"
            margin="normal"
            error={!!errors.email}
            helperText={errors.email?.message}
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Role</InputLabel>
            <Select
              {...register('role', { required: 'Role is required' })}
              label="Role"
              defaultValue="contributor"
            >
              <MenuItem value="contributor">Contributor</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button type="submit" variant="contained">Create User</Button>
        </DialogActions>
      </form>
    </Dialog>
  );

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Skeleton variant="text" sx={{ fontSize: '2rem', mb: 2 }} />
        <Grid container spacing={3} mb={4}>
          {Array.from({ length: 4 }).map((_, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Skeleton variant="rectangular" height={120} />
            </Grid>
          ))}
        </Grid>
        <Skeleton variant="rectangular" height={400} />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box mb={4}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
          Admin Dashboard
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Manage users, content, and system settings
        </Typography>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Users"
            value={stats.totalUsers}
            icon={<People sx={{ fontSize: 40 }} />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Pending Approval"
            value={stats.pendingUsers}
            icon={<Security sx={{ fontSize: 40 }} />}
            color="warning"
            subtitle={`${stats.pendingUsers} users waiting`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Articles"
            value={stats.totalArticles}
            icon={<Article sx={{ fontSize: 40 }} />}
            color="info"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Published"
            value={stats.publishedArticles}
            icon={<TrendingUp sx={{ fontSize: 40 }} />}
            color="success"
          />
        </Grid>
      </Grid>

      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}

      {/* Tabs */}
      <Paper elevation={2} sx={{ mb: 4 }}>
        <Tabs 
          value={tabValue} 
          onChange={(e, newValue) => setTabValue(newValue)}
          sx={{ px: 2 }}
        >
          <Tab icon={<People />} label="Users" />
          <Tab icon={<Article />} label="Articles" />
          <Tab icon={<Settings />} label="Settings" />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      {tabValue === 0 && (
        <Box>
          <Box display="flex" justifyContent="between" alignItems="center" mb={3}>
            <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
              User Management
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => openDialog('user')}
            >
              Add User
            </Button>
          </Box>
          <UsersTable />
        </Box>
      )}

      {tabValue === 1 && (
        <Box>
          <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 600 }}>
            Content Management
          </Typography>
          <ArticlesTable />
        </Box>
      )}

      {tabValue === 2 && (
        <Box>
          <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 600 }}>
            System Settings
          </Typography>
          <Paper elevation={2} sx={{ p: 4 }}>
            <Typography variant="body1" color="text.secondary">
              System settings and configuration options would be available here in a full implementation.
              This could include:
            </Typography>
            <Box component="ul" sx={{ mt: 2 }}>
              <li>Email notification settings</li>
              <li>Media upload limits</li>
              <li>Content moderation rules</li>
              <li>SEO settings</li>
              <li>Backup and maintenance schedules</li>
            </Box>
          </Paper>
        </Box>
      )}

      {/* Action Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
      >
        {selectedItem?.type === 'user' && (
          [
            !selectedItem.approved && (
              <MenuItem key="approve" onClick={() => handleApproveUser(selectedItem.id)}>
                <Check sx={{ mr: 1 }} fontSize="small" />
                Approve User
              </MenuItem>
            ),
            !selectedItem.approved && (
              <MenuItem key="reject" onClick={() => handleRejectUser(selectedItem.id)}>
                <Close sx={{ mr: 1 }} fontSize="small" />
                Reject User
              </MenuItem>
            ),
            <MenuItem key="edit" onClick={handleMenuClose}>
              <Edit sx={{ mr: 1 }} fontSize="small" />
              Edit User
            </MenuItem>
          ].filter(Boolean)
        )}
        
        {selectedItem?.type === 'article' && [
          <MenuItem key="view" onClick={handleMenuClose}>
            <Visibility sx={{ mr: 1 }} fontSize="small" />
            View Article
          </MenuItem>,
          <MenuItem key="edit" onClick={handleMenuClose}>
            <Edit sx={{ mr: 1 }} fontSize="small" />
            Edit Article
          </MenuItem>,
          <MenuItem key="delete" onClick={handleMenuClose} sx={{ color: 'error.main' }}>
            <Delete sx={{ mr: 1 }} fontSize="small" />
            Delete Article
          </MenuItem>,
        ]}
      </Menu>

      {/* Dialogs */}
      <CreateUserDialog />
    </Container>
  );
};

export default AdminPage; 