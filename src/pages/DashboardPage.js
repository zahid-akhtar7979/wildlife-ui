import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Alert,
  Skeleton,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  Avatar,
  Divider,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Publish,
  MoreVert,
  Article,
  TrendingUp,
  Visibility,
  CalendarToday,
  Analytics,
  Park,
  BookmarkBorder,
  AutoAwesome,
  StarBorder,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { articleService } from '../services/articleService';
import { format } from 'date-fns';

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    drafts: 0,
    totalViews: 2847,
    avgReadTime: 8.5,
    engagementRate: 84.2,
    monthlyGrowth: 23.8,
  });

  const fetchArticles = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      const response = await articleService.getArticlesByAuthor(user.id);
      const userArticles = response.data.articles;
      
      console.log('📄 Loaded articles in dashboard:', userArticles);
      console.log('📄 Number of articles:', userArticles?.length);
      console.log('📄 First article structure:', userArticles?.[0]);
      
      setArticles(userArticles);
      setStats({
        total: userArticles.length,
        published: userArticles.filter(a => a.published).length,
        drafts: userArticles.filter(a => !a.published).length,
        totalViews: 2847,
        avgReadTime: 8.5,
        engagementRate: 84.2,
        monthlyGrowth: 23.8,
      });
    } catch (err) {
      setError('Failed to load your articles. Please try again.');
      console.error('Error fetching articles:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) {
      fetchArticles();
    }
  }, [fetchArticles, user?.id]);

  const handleMenuOpen = (event, article) => {
    console.log('🔗 Menu opened for article:', article);
    setMenuAnchor(event.currentTarget);
    setSelectedArticle(article);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setSelectedArticle(null);
  };

  const handleEdit = () => {
    navigate(`/edit-article/${selectedArticle.id}`);
    handleMenuClose();
  };

  const handleDelete = () => {
    console.log('🗑️ Delete clicked for article:', selectedArticle);
    console.log('🗑️ Article ID:', selectedArticle?.id);
    console.log('🗑️ Article Title:', selectedArticle?.title);
    setDeleteDialogOpen(true);
    // Only close the menu, don't clear selectedArticle until after deletion
    setMenuAnchor(null);
  };

  const confirmDelete = async () => {
    console.log('🚨 CONFIRM DELETE BUTTON CLICKED!');
    console.log('🗑️ Selected article for deletion:', selectedArticle);
    
    if (!selectedArticle || !selectedArticle.id) {
      console.error('❌ No article selected or missing ID:', selectedArticle);
      setError('No article selected for deletion');
      return;
    }
    
    try {
      const response = await articleService.deleteArticle(selectedArticle.id);
      console.log('✅ Article deleted successfully!');
      
      // Update local state to remove the deleted article
      setArticles(articles.filter(article => article.id !== selectedArticle.id));
      
      // Update stats
      const updatedArticles = articles.filter(article => article.id !== selectedArticle.id);
      setStats(prevStats => ({
        ...prevStats,
        total: updatedArticles.length,
        published: updatedArticles.filter(a => a.published).length,
        drafts: updatedArticles.filter(a => !a.published).length,
      }));
      
      setDeleteDialogOpen(false);
      setSelectedArticle(null);
      setError(''); // Clear any previous errors
      setSuccessMessage(`Article "${selectedArticle.title}" was successfully deleted.`);
      
      // Clear success message after 5 seconds
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (err) {
      console.error('❌ Error deleting article:', err);
      console.error('❌ Error details:', err.response?.data || err.message);
      setError(`Failed to delete article: ${err.response?.data?.message || err.message}`);
    }
  };

  const handlePublish = async () => {
    try {
      await articleService.publishArticle(selectedArticle.id);
      setArticles(articles.map(article => 
        article.id === selectedArticle.id 
          ? { ...article, published: true, publishDate: new Date().toISOString() }
          : article
      ));
    } catch (err) {
      console.error('Error publishing article:', err);
    }
    handleMenuClose();
  };

  const PremiumStatCard = ({ title, value, subtitle, icon, color = '#2e7d32', trend, progress }) => (
    <Card 
      elevation={0}
      sx={{ 
        height: '100%',
        background: `linear-gradient(135deg, ${color}08 0%, ${color}03 100%)`,
        border: `1px solid ${color}15`,
        borderRadius: '20px',
        overflow: 'hidden',
        position: 'relative',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: `0 20px 40px ${color}20`,
          borderColor: `${color}25`,
        },
        fontFamily: 'Inter, sans-serif',
      }}
    >
      {/* Decorative Background Pattern */}
      <Box
        sx={{
          position: 'absolute',
          top: -20,
          right: -20,
          width: 100,
          height: 100,
          borderRadius: '50%',
          background: `linear-gradient(135deg, ${color}10 0%, ${color}05 100%)`,
          opacity: 0.6,
        }}
      />
      
      <CardContent sx={{ p: 3, position: 'relative' }}>
        <Box display="flex" alignItems="flex-start" justifyContent="space-between" mb={2}>
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: '16px',
              background: `linear-gradient(135deg, ${color} 0%, ${color}CC 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 8px 24px ${color}40`,
            }}
          >
            {React.cloneElement(icon, { 
              sx: { fontSize: 28, color: 'white' } 
            })}
          </Box>
          
          {trend && (
            <Chip
              label={`+${trend}%`}
              size="small"
              sx={{
                backgroundColor: `${color}15`,
                color: color,
                fontWeight: 600,
                fontSize: '0.75rem',
                fontFamily: 'Inter, sans-serif',
              }}
            />
          )}
        </Box>

        <Typography 
          variant="h3" 
          sx={{ 
            fontWeight: 700,
            color: '#1f2937',
            mb: 0.5,
            fontFamily: 'Inter, sans-serif',
            fontSize: '2.5rem',
          }}
        >
          {value}
        </Typography>
        
        <Typography 
          variant="body2" 
          sx={{ 
            color: '#6b7280',
            fontWeight: 500,
            mb: 1,
            fontFamily: 'Inter, sans-serif',
          }}
        >
          {title}
        </Typography>

        {subtitle && (
          <Typography 
            variant="caption" 
            sx={{ 
              color: '#9ca3af',
              fontFamily: 'Inter, sans-serif',
              fontSize: '0.8rem',
            }}
          >
            {subtitle}
          </Typography>
        )}

        {progress !== undefined && (
          <Box mt={2}>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{
                height: 6,
                borderRadius: 3,
                backgroundColor: `${color}15`,
                '& .MuiLinearProgress-bar': {
                  backgroundColor: color,
                  borderRadius: 3,
                },
              }}
            />
          </Box>
        )}
      </CardContent>
    </Card>
  );

  const PremiumArticleCard = ({ article }) => (
    <Card 
      elevation={0}
      sx={{ 
        height: '100%', 
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '20px',
        border: '1px solid #e8f5e8',
        background: 'white',
        overflow: 'hidden',
        position: 'relative',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': { 
          transform: 'translateY(-8px)',
          boxShadow: '0 25px 50px rgba(46, 125, 50, 0.15)',
          borderColor: '#c8e6c9',
        },
        fontFamily: 'Inter, sans-serif',
      }}
    >
      {/* Status Indicator */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          background: article.published 
            ? 'linear-gradient(90deg, #4caf50 0%, #66bb6a 100%)'
            : 'linear-gradient(90deg, #ff9800 0%, #ffb74d 100%)',
        }}
      />

      <CardContent sx={{ flexGrow: 1, p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Chip 
            label={article.published ? 'Published' : 'Draft'}
            size="small"
            sx={{
              backgroundColor: article.published ? '#e8f5e8' : '#fff3e0',
              color: article.published ? '#2e7d32' : '#e65100',
              fontWeight: 600,
              fontFamily: 'Inter, sans-serif',
              fontSize: '0.75rem',
            }}
          />
          <IconButton
            size="small"
            onClick={(e) => handleMenuOpen(e, article)}
            sx={{
              backgroundColor: '#f8faf8',
              '&:hover': { backgroundColor: '#f0f9f0' },
            }}
          >
            <MoreVert />
          </IconButton>
        </Box>

        <Typography 
          variant="h6" 
          gutterBottom
          sx={{ 
            fontWeight: 600,
            fontSize: '1.25rem',
            lineHeight: 1.3,
            color: '#1f2937',
            fontFamily: 'Inter, sans-serif',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            mb: 2,
          }}
        >
          {article.title}
        </Typography>

        <Typography 
          variant="body2" 
          sx={{ 
            color: '#6b7280',
            lineHeight: 1.6,
            fontFamily: 'Inter, sans-serif',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            mb: 3,
          }}
        >
          {article.excerpt}
        </Typography>

        <Box display="flex" alignItems="center" gap={1} mb={2}>
          <CalendarToday sx={{ fontSize: 16, color: '#9ca3af' }} />
          <Typography 
            variant="caption" 
            sx={{ 
              color: '#9ca3af',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 500,
            }}
          >
            {article.published 
              ? `Published ${format(new Date(article.publishDate), 'MMM dd, yyyy')}`
              : `Created ${format(new Date(article.publishDate), 'MMM dd, yyyy')}`
            }
          </Typography>
        </Box>

        <Box display="flex" flexWrap="wrap" gap={0.5} mt={2}>
          {article.tags.slice(0, 3).map((tag) => (
            <Chip
              key={tag}
              label={tag}
              size="small"
              variant="outlined"
              sx={{ 
                fontSize: '0.7rem', 
                height: 24,
                borderColor: '#d1d5db',
                color: '#6b7280',
                fontFamily: 'Inter, sans-serif',
                '&:hover': {
                  borderColor: '#2e7d32',
                  backgroundColor: '#f0f9f0',
                },
              }}
            />
          ))}
          {article.tags.length > 3 && (
            <Typography 
              variant="caption" 
              sx={{ 
                alignSelf: 'center',
                color: '#9ca3af',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 500,
              }}
            >
              +{article.tags.length - 3} more
            </Typography>
          )}
        </Box>
      </CardContent>

      <Divider sx={{ borderColor: '#e8f5e8' }} />

      <CardActions sx={{ p: 2, backgroundColor: '#f8faf8' }}>
        <Button 
          size="small" 
          startIcon={<Edit />}
          onClick={() => navigate(`/edit-article/${article.id}`)}
          sx={{
            color: '#2e7d32',
            fontWeight: 600,
            fontFamily: 'Inter, sans-serif',
            textTransform: 'none',
            '&:hover': {
              backgroundColor: '#e8f5e8',
            },
          }}
        >
          Edit
        </Button>
        {article.published && (
          <Button 
            size="small" 
            startIcon={<Visibility />}
            onClick={() => navigate(`/article/${article.id}`)}
            sx={{
              color: '#2e7d32',
              fontWeight: 600,
              fontFamily: 'Inter, sans-serif',
              textTransform: 'none',
              '&:hover': {
                backgroundColor: '#e8f5e8',
              },
            }}
          >
            View
          </Button>
        )}
      </CardActions>
    </Card>
  );

  const LoadingSkeleton = () => (
    <Card 
      elevation={0}
      sx={{
        borderRadius: '20px',
        border: '1px solid #e8f5e8',
        overflow: 'hidden',
      }}
    >
      <Box sx={{ height: 4, backgroundColor: '#f0f0f0' }} />
      <CardContent sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" mb={2}>
          <Skeleton variant="rectangular" width={80} height={24} sx={{ borderRadius: '12px' }} />
          <Skeleton variant="circular" width={32} height={32} />
        </Box>
        <Skeleton variant="text" sx={{ fontSize: '1.5rem', mb: 1, borderRadius: '8px' }} />
        <Skeleton variant="text" sx={{ mb: 1, borderRadius: '4px' }} />
        <Skeleton variant="text" sx={{ mb: 2, borderRadius: '4px' }} />
        <Skeleton variant="text" width={120} sx={{ mb: 2, borderRadius: '4px' }} />
        <Box display="flex" gap={1}>
          <Skeleton variant="rectangular" width={60} height={24} sx={{ borderRadius: '12px' }} />
          <Skeleton variant="rectangular" width={70} height={24} sx={{ borderRadius: '12px' }} />
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      backgroundColor: '#f8faf8',
      fontFamily: 'Inter, sans-serif',
    }}>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Premium Header */}
        <Box mb={6}>
          <Box display="flex" alignItems="center" gap={2} mb={2}>
            <Avatar
              sx={{
                width: 56,
                height: 56,
                background: 'linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%)',
                fontSize: '1.5rem',
                fontWeight: 700,
                fontFamily: 'Inter, sans-serif',
              }}
            >
              {user?.name?.charAt(0) || 'U'}
            </Avatar>
            <Box>
              <Typography 
                variant="h3" 
                component="h1" 
                sx={{ 
                  fontWeight: 700,
                  color: '#1f2937',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '2.5rem',
                  lineHeight: 1.2,
                  mb: 0.5,
                }}
              >
                Wildlife Research Dashboard
              </Typography>
              <Typography 
                variant="h6" 
                sx={{ 
                  color: '#6b7280',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 400,
                }}
              >
                Welcome back, {user?.name}! Here's your conservation impact overview
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Premium Statistics Cards */}
        <Grid container spacing={3} mb={6}>
          <Grid item xs={12} sm={6} lg={3}>
            <PremiumStatCard
              title="Total Articles"
              value={stats.total}
              subtitle="Research publications"
              icon={<Article />}
              color="#2e7d32"
              trend={stats.monthlyGrowth}
            />
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            <PremiumStatCard
              title="Published Articles"
              value={stats.published}
              subtitle="Live on platform"
              icon={<TrendingUp />}
              color="#1976d2"
              progress={(stats.published / Math.max(stats.total, 1)) * 100}
            />
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            <PremiumStatCard
              title="Total Views"
              value={stats.totalViews.toLocaleString()}
              subtitle="Across all articles"
              icon={<Analytics />}
              color="#7c4dff"
              trend="18.2"
            />
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            <PremiumStatCard
              title="Engagement Rate"
              value={`${stats.engagementRate}%`}
              subtitle="Reader interaction"
                             icon={<Park />}
              color="#00acc1"
              progress={stats.engagementRate}
            />
          </Grid>
        </Grid>

        {/* Additional Metrics Row */}
        <Grid container spacing={3} mb={6}>
          <Grid item xs={12} sm={6} lg={3}>
            <PremiumStatCard
              title="Avg. Read Time"
              value={`${stats.avgReadTime} min`}
              subtitle="Reader engagement"
                             icon={<BookmarkBorder />}
              color="#ff7043"
            />
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            <PremiumStatCard
              title="Draft Articles"
              value={stats.drafts}
              subtitle="In progress"
              icon={<Edit />}
              color="#ffa726"
            />
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            <PremiumStatCard
              title="Impact Score"
              value="94.5"
              subtitle="Conservation influence"
                             icon={<AutoAwesome />}
              color="#66bb6a"
              progress={94.5}
            />
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            <PremiumStatCard
              title="Researcher Level"
              value="Expert"
              subtitle="Platform recognition"
                             icon={<StarBorder />}
              color="#ab47bc"
            />
          </Grid>
        </Grid>

        {/* Error Message */}
        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 4,
              borderRadius: '12px',
              fontFamily: 'Inter, sans-serif',
            }}
            onClose={() => setError('')}
          >
            {error}
          </Alert>
        )}

        {/* Success Message */}
        {successMessage && (
          <Alert 
            severity="success" 
            sx={{ 
              mb: 4,
              borderRadius: '12px',
              fontFamily: 'Inter, sans-serif',
            }}
            onClose={() => setSuccessMessage('')}
          >
            {successMessage}
          </Alert>
        )}

        {/* Articles Section */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: '24px',
            border: '1px solid #e8f5e8',
            overflow: 'hidden',
            background: 'white',
          }}
        >
          <Box sx={{ p: 4, backgroundColor: '#f8faf8', borderBottom: '1px solid #e8f5e8' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography 
                  variant="h4" 
                  component="h2" 
                  sx={{ 
                    fontWeight: 700,
                    color: '#1f2937',
                    fontFamily: 'Inter, sans-serif',
                    mb: 1,
                  }}
                >
                  Your Research Articles
                </Typography>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    color: '#6b7280',
                    fontFamily: 'Inter, sans-serif',
                  }}
                >
                  Manage and track your wildlife conservation publications
                </Typography>
              </Box>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => navigate('/create-article')}
                size="large"
                sx={{
                  borderRadius: '12px',
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '1rem',
                  px: 3,
                  py: 1.5,
                  background: 'linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%)',
                  boxShadow: '0 8px 24px rgba(46, 125, 50, 0.3)',
                  fontFamily: 'Inter, sans-serif',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #1b5e20 0%, #2e7d32 100%)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 12px 32px rgba(46, 125, 50, 0.4)',
                  },
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              >
                New Article
              </Button>
            </Box>
          </Box>

          <Box sx={{ p: 4 }}>
            <Grid container spacing={3}>
              {loading ? (
                Array.from({ length: 6 }).map((_, index) => (
                  <Grid item xs={12} sm={6} lg={4} key={index}>
                    <LoadingSkeleton />
                  </Grid>
                ))
              ) : articles.length > 0 ? (
                articles.map((article) => (
                  <Grid item xs={12} sm={6} lg={4} key={article.id}>
                    <PremiumArticleCard article={article} />
                  </Grid>
                ))
              ) : (
                <Grid item xs={12}>
                  <Box sx={{ textAlign: 'center', py: 8 }}>
                    <Box
                      sx={{
                        width: 120,
                        height: 120,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #e8f5e8 0%, #f0f9f0 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mx: 'auto',
                        mb: 3,
                      }}
                    >
                      <Article sx={{ fontSize: 48, color: '#2e7d32' }} />
                    </Box>
                    <Typography 
                      variant="h5" 
                      gutterBottom
                      sx={{ 
                        fontWeight: 600,
                        color: '#1f2937',
                        fontFamily: 'Inter, sans-serif',
                        mb: 2,
                      }}
                    >
                      Start Your Conservation Journey
                    </Typography>
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        color: '#6b7280',
                        fontFamily: 'Inter, sans-serif',
                        mb: 4,
                        maxWidth: 400,
                        mx: 'auto',
                        lineHeight: 1.6,
                      }}
                    >
                      Share your wildlife research, conservation stories, and help protect our planet's biodiversity through impactful storytelling.
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<Add />}
                      onClick={() => navigate('/create-article')}
                      size="large"
                      sx={{
                        borderRadius: '12px',
                        textTransform: 'none',
                        fontWeight: 600,
                        fontSize: '1.1rem',
                        px: 4,
                        py: 1.5,
                        background: 'linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%)',
                        boxShadow: '0 8px 24px rgba(46, 125, 50, 0.3)',
                        fontFamily: 'Inter, sans-serif',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #1b5e20 0%, #2e7d32 100%)',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 12px 32px rgba(46, 125, 50, 0.4)',
                        },
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      }}
                    >
                      Create Your First Article
                    </Button>
                  </Box>
                </Grid>
              )}
            </Grid>
          </Box>
        </Paper>

        {/* Premium Floating Action Button */}
        <Fab
          sx={{ 
            position: 'fixed', 
            bottom: 32, 
            right: 32,
            width: 64,
            height: 64,
            background: 'linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%)',
            boxShadow: '0 12px 32px rgba(46, 125, 50, 0.4)',
            '&:hover': {
              background: 'linear-gradient(135deg, #1b5e20 0%, #2e7d32 100%)',
              transform: 'scale(1.1)',
              boxShadow: '0 16px 40px rgba(46, 125, 50, 0.5)',
            },
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
          onClick={() => navigate('/create-article')}
        >
          <Add sx={{ fontSize: 28 }} />
        </Fab>

        {/* Article Menu */}
        <Menu
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={handleMenuClose}
          PaperProps={{
            sx: {
              borderRadius: '12px',
              border: '1px solid #e8f5e8',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
              fontFamily: 'Inter, sans-serif',
            }
          }}
        >
          <MenuItem 
            onClick={handleEdit}
            sx={{ 
              fontFamily: 'Inter, sans-serif',
              '&:hover': { backgroundColor: '#f0f9f0' },
            }}
          >
            <Edit sx={{ mr: 1, color: '#2e7d32' }} fontSize="small" />
            Edit Article
          </MenuItem>
          {!selectedArticle?.published && (
            <MenuItem 
              onClick={handlePublish}
              sx={{ 
                fontFamily: 'Inter, sans-serif',
                '&:hover': { backgroundColor: '#f0f9f0' },
              }}
            >
              <Publish sx={{ mr: 1, color: '#2e7d32' }} fontSize="small" />
              Publish Article
            </MenuItem>
          )}
          {selectedArticle?.published && (
            <MenuItem 
              onClick={() => navigate(`/article/${selectedArticle.id}`)}
              sx={{ 
                fontFamily: 'Inter, sans-serif',
                '&:hover': { backgroundColor: '#f0f9f0' },
              }}
            >
              <Visibility sx={{ mr: 1, color: '#2e7d32' }} fontSize="small" />
              View Article
            </MenuItem>
          )}
          <MenuItem 
            onClick={handleDelete} 
            sx={{ 
              color: 'error.main',
              fontFamily: 'Inter, sans-serif',
              '&:hover': { backgroundColor: '#ffebee' },
            }}
          >
            <Delete sx={{ mr: 1 }} fontSize="small" />
            Delete Article
          </MenuItem>
        </Menu>

        {/* Premium Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          PaperProps={{
            sx: {
              borderRadius: '20px',
              p: 1,
              fontFamily: 'Inter, sans-serif',
            }
          }}
        >
          <DialogTitle sx={{ 
            fontWeight: 600, 
            fontSize: '1.25rem',
            fontFamily: 'Inter, sans-serif',
          }}>
            Delete Article
          </DialogTitle>
          <DialogContent>
            <Typography sx={{ fontFamily: 'Inter, sans-serif' }}>
              Are you sure you want to delete "{selectedArticle?.title || 'this article'}"? 
              This action cannot be undone.
            </Typography>
            {process.env.NODE_ENV === 'development' && (
              <Typography variant="caption" sx={{ mt: 1, display: 'block', color: '#666' }}>
                Debug: Article ID: {selectedArticle?.id}, Title: {selectedArticle?.title}
              </Typography>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 1 }}>
            <Button 
              onClick={() => {
                console.log('🚫 Cancel delete dialog');
                setDeleteDialogOpen(false);
                setSelectedArticle(null); // Clear selected article on cancel
              }}
              sx={{ 
                fontFamily: 'Inter, sans-serif',
                textTransform: 'none',
                fontWeight: 600,
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={(e) => {
                console.log('🚨 DELETE BUTTON CLICKED IN DIALOG!');
                console.log('🚨 Event:', e);
                confirmDelete();
              }} 
              variant="contained" 
              color="error"
              sx={{ 
                fontFamily: 'Inter, sans-serif',
                textTransform: 'none',
                fontWeight: 600,
                borderRadius: '8px',
              }}
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default DashboardPage; 