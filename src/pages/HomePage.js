import React, { useState, useMemo, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardMedia,
  CardContent,
  Button,
  Chip,
  TextField,
  InputAdornment,
  Paper,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Search,
  CalendarToday,
  Person,
  Visibility,
  Tag,
  ArrowForward,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import Footer from '../components/common/Footer';
import { articleService } from '../services/articleService';

// Helper function to safely get a valid date
const getValidDate = (article) => {
  const dateString = article.publishDate || article.createdAt;
  if (!dateString) return new Date(); // Fallback to current date
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return new Date(); // Fallback to current date if invalid
  }
  return date;
};

// Helper function to safely format a date
const formatSafeDate = (article, formatString = 'MMM d, yyyy') => {
  try {
    const date = getValidDate(article);
    return format(date, formatString);
  } catch (error) {
    console.warn('Date formatting error for article:', article.id, error);
    return 'Invalid date';
  }
};



const HomePage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Single useEffect to fetch data once on mount
  useEffect(() => {
    let isCancelled = false;
    
    const fetchData = async () => {
      try {
        console.log('🏠 HomePage - Starting fetchData...');
        setLoading(true);
        
        const [articlesResponse, categoriesResponse] = await Promise.all([
          articleService.getArticles(),
          articleService.getCategories()
        ]);
        
        console.log('🏠 HomePage - Raw API responses:', articlesResponse, categoriesResponse);
        
        if (!isCancelled) {
          const articles = articlesResponse.data?.articles || [];
          const categories = categoriesResponse.data?.categories || [];
          
          console.log('🏠 HomePage - Articles found:', articles.length);
          console.log('🏠 HomePage - Categories found:', categories.length);
          
          setArticles(articles);
          setCategories(categories);
          setError(null);
        }
      } catch (err) {
        console.error('🏠 HomePage - Error fetching data:', err);
        if (!isCancelled) {
          setError('Failed to load articles. Please try again later.');
          setArticles([]);
          setCategories([]);
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    fetchData();
    
    return () => {
      isCancelled = true;
    };
  }, []); // Empty dependency array - run only once

  const filteredArticles = useMemo(() => {
    let filtered = articles;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(article => 
        (article.title || '').toLowerCase().includes(query) ||
        (article.excerpt || '').toLowerCase().includes(query) ||
        (article.tags || []).some(tag => tag.toLowerCase().includes(query)) ||
        (article.author?.name || '').toLowerCase().includes(query)
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter(article => article.category === selectedCategory);
    }

    return filtered.sort((a, b) => 
      getValidDate(b).getTime() - getValidDate(a).getTime()
    );
  }, [searchQuery, selectedCategory, articles]);

  const ArticleCard = ({ article }) => (
    <Card 
      elevation={0}
      sx={{ 
        display: { xs: 'block', md: 'flex' },
        borderRadius: '16px',
        border: '1px solid #e8f5e8',
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        backgroundColor: 'white',
        '&:hover': {
          boxShadow: '0 8px 32px rgba(46, 125, 50, 0.12)',
          transform: 'translateY(-2px)',
          borderColor: '#c8e6c9',
        },
        mb: 4,
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      {/* Image */}
      {article.images && article.images.length > 0 && (
        <Box sx={{ width: { xs: '100%', md: '33.333%' }, height: { xs: 200, md: 'auto' } }}>
          <CardMedia
            component="img"
            sx={{ 
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
            image={article.images[0].url}
            alt={article.images[0].caption}
          />
        </Box>
      )}
      
      {/* Content */}
      <CardContent sx={{ 
        flex: 1, 
        p: { xs: 3, md: 4 },
        display: 'flex',
        flexDirection: 'column',
        width: { xs: '100%', md: '66.666%' }
      }}>
        {/* Metadata */}
        <Box display="flex" alignItems="center" gap={2} mb={2} flexWrap="wrap">
          <Box display="flex" alignItems="center" gap={0.5}>
            <Person sx={{ fontSize: 16, color: '#6b7280' }} />
            <Typography 
              variant="caption" 
              sx={{ 
                color: '#6b7280',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 500,
              }}
            >
              {article.author?.name || 'Unknown Author'}
            </Typography>
          </Box>
          
          <Box display="flex" alignItems="center" gap={0.5}>
            <CalendarToday sx={{ fontSize: 16, color: '#6b7280' }} />
            <Typography 
              variant="caption" 
              sx={{ 
                color: '#6b7280',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 500,
              }}
            >
              {formatSafeDate(article)}
            </Typography>
          </Box>

          <Box display="flex" alignItems="center" gap={0.5}>
            <Visibility sx={{ fontSize: 16, color: '#6b7280' }} />
            <Typography 
              variant="caption" 
              sx={{ 
                color: '#6b7280',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 500,
              }}
            >
              {(article.views || 0).toLocaleString()} views
            </Typography>
          </Box>
        </Box>
        
        {/* Title */}
        <Typography 
          variant="h6" 
          component="h2" 
          gutterBottom
          sx={{ 
            fontWeight: 600,
            lineHeight: 1.3,
            cursor: 'pointer',
            mb: 2,
            color: '#1f2937',
            fontFamily: 'Inter, sans-serif',
            fontSize: '1.25rem',
            '&:hover': { color: '#2e7d32' },
            transition: 'color 0.2s ease',
          }}
          onClick={() => navigate(`/article/${article.id}`)}
        >
          {article.title}
        </Typography>
        
        {/* Excerpt */}
        <Typography 
          variant="body2" 
          paragraph
          sx={{ 
            mb: 3,
            lineHeight: 1.6,
            color: '#6b7280',
            fontFamily: 'Inter, sans-serif',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {article.excerpt || 'No excerpt available for this article.'}
        </Typography>
        
        {/* Tags and Read More */}
        <Box display="flex" alignItems="center" justifyContent="space-between" mt="auto">
          <Box display="flex" flexWrap="wrap" gap={1}>
            <Chip
              label={article.category}
              size="small"
              sx={{ 
                backgroundColor: '#e8f5e8',
                color: '#2e7d32',
                fontSize: '0.75rem',
                fontWeight: 600,
                fontFamily: 'Inter, sans-serif',
                height: 26,
                '& .MuiChip-label': {
                  px: 1.5,
                },
              }}
            />
            {(article.tags || []).slice(0, 2).map((tag) => (
              <Chip
                key={tag}
                icon={<Tag sx={{ fontSize: 12, color: '#9ca3af' }} />}
                label={tag}
                size="small"
                variant="outlined"
                sx={{ 
                  fontSize: '0.75rem',
                  height: 26,
                  borderColor: '#d1d5db',
                  color: '#6b7280',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 500,
                  '& .MuiChip-label': {
                    px: 1,
                  },
                }}
              />
            ))}
            {(article.tags || []).length > 2 && (
              <Typography 
                variant="caption" 
                sx={{ 
                  alignSelf: 'center',
                  color: '#9ca3af',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 500,
                }}
              >
                +{(article.tags || []).length - 2} more
              </Typography>
            )}
          </Box>
          
          <Button 
            variant="text"
            endIcon={<ArrowForward sx={{ fontSize: 18 }} />}
            onClick={() => navigate(`/article/${article.id}`)}
            sx={{ 
              color: '#2e7d32',
              textTransform: 'none',
              fontWeight: 600,
              fontFamily: 'Inter, sans-serif',
              ml: 2,
              px: 2,
              py: 1,
              borderRadius: '8px',
              transition: 'all 0.2s ease',
              '&:hover': {
                backgroundColor: '#f0f9f0',
                color: '#1b5e20',
                transform: 'translateX(2px)',
              }
            }}
          >
            Read more
          </Button>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      backgroundColor: '#f8faf8',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    }}>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%)',
          color: 'white',
          py: { xs: 8, md: 12 },
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background Pattern */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M30 30c0-11.046-8.954-20-20-20s-20 8.954-20 20 8.954 20 20 20 20-8.954 20-20zM10 10c11.046 0 20 8.954 20 20s-8.954 20-20 20-20-8.954-20-20 8.954-20 20-20z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            opacity: 0.1,
          }}
        />
        
        <Container maxWidth="lg" sx={{ position: 'relative' }}>
          <Box textAlign="center" mb={6}>
            <Typography 
              variant="h1" 
              component="h1" 
              gutterBottom
              sx={{ 
                fontWeight: 700,
                fontSize: { xs: '2.5rem', sm: '3rem', md: '4rem' },
                mb: 3,
                color: 'white',
                textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                fontFamily: 'Inter, sans-serif',
                letterSpacing: '-0.025em',
              }}
            >
              Protecting Our Planet's Wildlife
            </Typography>
            <Typography 
              variant="h5" 
              sx={{ 
                maxWidth: 800, 
                mx: 'auto', 
                lineHeight: 1.6,
                fontWeight: 400,
                fontSize: { xs: '1.1rem', md: '1.25rem' },
                fontFamily: 'Inter, sans-serif',
                color: 'rgba(255, 255, 255, 0.95)',
              }}
            >
              Discover the latest research and stories from wildlife geographers working to preserve endangered species and their habitats around the world.
            </Typography>
          </Box>

          {/* Hero Search Bar */}
          <Box display="flex" justifyContent="center">
            <TextField
              placeholder="Search articles, species, regions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: '#9ca3af', fontSize: 20 }} />
                  </InputAdornment>
                ),
                sx: {
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  width: { xs: '90vw', sm: '500px' },
                  maxWidth: '500px',
                  fontSize: '1.1rem',
                  fontFamily: 'Inter, sans-serif',
                  '& .MuiOutlinedInput-notchedOutline': {
                    border: 'none'
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    border: 'none'
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    border: '2px solid #2e7d32',
                    boxShadow: '0 0 0 4px rgba(46, 125, 50, 0.1)',
                  },
                  '& input': {
                    py: 2,
                    fontFamily: 'Inter, sans-serif',
                  },
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                }
              }}
            />
          </Box>
        </Container>
      </Box>

      {/* Main Content */}
      <Container maxWidth="xl" sx={{ py: 6, px: { xs: 2, sm: 3, lg: 4 } }}>
        {/* Loading State */}
        {loading && (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
            <Box textAlign="center">
              <CircularProgress size={60} sx={{ color: '#2e7d32', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                Loading articles...
              </Typography>
            </Box>
          </Box>
        )}

        {/* Error State */}
        {error && !loading && (
          <Box mb={4}>
            <Alert severity="error" sx={{ borderRadius: 2 }}>
              {error}
            </Alert>
          </Box>
        )}

        {/* Content */}
        {!loading && (
        <Box sx={{ display: 'flex', gap: 4, flexDirection: { xs: 'column', sm: 'row' } }}>
          {/* Categories Sidebar */}
          <Box sx={{ width: { xs: '100%', sm: '300px' }, flexShrink: 0 }}>
            <Paper 
              elevation={0}
              sx={{ 
                p: 0,
                borderRadius: '16px',
                overflow: 'hidden',
                position: 'sticky',
                top: 32,
                border: '1px solid #e8f5e8',
                boxShadow: '0 4px 20px rgba(46, 125, 50, 0.08)',
              }}
            >
              <Box sx={{ 
                p: 3, 
                backgroundColor: '#f8faf8',
                borderBottom: '1px solid #e8f5e8',
              }}>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: 600, 
                    color: '#1f2937',
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '1.125rem',
                  }}
                >
                  Categories
                </Typography>
              </Box>
              <List sx={{ p: 0 }}>
                <ListItem disablePadding>
                  <ListItemButton
                    selected={selectedCategory === ''}
                    onClick={() => setSelectedCategory('')}
                    sx={{
                      py: 2,
                      px: 3,
                      '&.Mui-selected': {
                        backgroundColor: '#e8f5e8',
                        borderRight: '3px solid #2e7d32',
                        '& .MuiListItemText-primary': {
                          fontWeight: 600,
                          color: '#2e7d32'
                        }
                      },
                      '&:hover': {
                        backgroundColor: '#f0f9f0'
                      },
                      transition: 'all 0.2s ease',
                    }}
                  >
                                      <ListItemText 
                    primary={`All Articles (${articles.length})`}
                      primaryTypographyProps={{
                        fontSize: '0.95rem',
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 500,
                      }}
                    />
                  </ListItemButton>
                </ListItem>
                {categories.map((category) => {
                  const count = articles.filter(a => a.category === category).length;
                  if (count === 0) return null;
                  
                  return (
                    <ListItem key={category} disablePadding>
                      <ListItemButton
                        selected={selectedCategory === category}
                        onClick={() => setSelectedCategory(category)}
                        sx={{
                          py: 2,
                          px: 3,
                          '&.Mui-selected': {
                            backgroundColor: '#e8f5e8',
                            borderRight: '3px solid #2e7d32',
                            '& .MuiListItemText-primary': {
                              fontWeight: 600,
                              color: '#2e7d32'
                            }
                          },
                          '&:hover': {
                            backgroundColor: '#f0f9f0'
                          },
                          transition: 'all 0.2s ease',
                        }}
                      >
                        <ListItemText 
                          primary={`${category} (${count})`}
                          primaryTypographyProps={{
                            fontSize: '0.95rem',
                            fontFamily: 'Inter, sans-serif',
                            fontWeight: 500,
                          }}
                        />
                      </ListItemButton>
                    </ListItem>
                  );
                })}
              </List>
            </Paper>
          </Box>

          {/* Articles */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            {filteredArticles.length === 0 ? (
              <Box textAlign="center" py={12}>
                <Search sx={{ fontSize: 64, color: '#d1d5db', mb: 2 }} />
                <Typography 
                  variant="h5" 
                  gutterBottom
                  sx={{ 
                    color: '#6b7280',
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 600,
                  }}
                >
                  No articles found
                </Typography>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    color: '#9ca3af',
                    fontFamily: 'Inter, sans-serif',
                  }}
                >
                  Try adjusting your search terms or browse different categories.
                </Typography>
              </Box>
            ) : (
              <Box>
                {filteredArticles.map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </Box>
                         )}
           </Box>
         </Box>
        )}
      </Container>

      <Footer />
    </Box>
  );
};

export default HomePage; 