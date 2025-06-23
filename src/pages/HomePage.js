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
  Pagination,
} from '@mui/material';
import {
  Search,
  CalendarToday,
  Person,
  Visibility,
  Tag,
  ArrowForward,
} from '@mui/icons-material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { format, parseISO, isValid } from 'date-fns';
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
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page')) || 1);
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0,
    hasNext: false,
    hasPrev: false
  });

  // Update search params when state changes
  useEffect(() => {
    const params = {};
    if (searchQuery) params.search = searchQuery;
    if (selectedCategory) params.category = selectedCategory;
    if (currentPage > 1) params.page = currentPage.toString();
    
    setSearchParams(params);
  }, [searchQuery, selectedCategory, currentPage, setSearchParams]);

  // Sync state with URL params when they change
  useEffect(() => {
    const urlSearch = searchParams.get('search') || '';
    const urlCategory = searchParams.get('category') || '';
    const urlPage = parseInt(searchParams.get('page')) || 1;
    
    if (urlSearch !== searchQuery) {
      setSearchQuery(urlSearch);
    }
    if (urlCategory !== selectedCategory) {
      setSelectedCategory(urlCategory);
    }
    if (urlPage !== currentPage) {
      setCurrentPage(urlPage);
    }
  }, [searchParams]);

  // Fetch articles when search/category/page changes
  useEffect(() => {
    let isCancelled = false;
    
    const fetchData = async () => {
      try {
        console.log('🏠 HomePage - Starting fetchData with filters:', { searchQuery, selectedCategory, currentPage });
        setLoading(true);
        
        const filters = {
          page: currentPage,
          limit: 10 // Show 10 articles per page
        };
        if (searchQuery) filters.search = searchQuery;
        if (selectedCategory) filters.category = selectedCategory;
        
        const [articlesResponse, categoriesResponse] = await Promise.all([
          articleService.getArticles(filters),
          articleService.getCategories()
        ]);
        
        console.log('🏠 HomePage - Raw API responses:', articlesResponse, categoriesResponse);
        
        if (!isCancelled) {
          const articles = articlesResponse.data?.articles || [];
          const categories = categoriesResponse.data?.categories || [];
          const paginationData = articlesResponse.data?.pagination || {
            current: 1,
            pages: 1,
            total: 0,
            hasNext: false,
            hasPrev: false
          };
          
          console.log('🏠 HomePage - Articles found:', articles.length);
          console.log('🏠 HomePage - Categories found:', categories.length);
          console.log('🏠 HomePage - Pagination data:', paginationData);
          
          setArticles(articles);
          setCategories(categories);
          setPagination(paginationData);
          setError(null);
        }
      } catch (err) {
        console.error('🏠 HomePage - Error fetching data:', err);
        if (!isCancelled) {
          setError('Failed to load articles. Please try again later.');
          setArticles([]);
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
  }, [searchQuery, selectedCategory, currentPage]); // Re-fetch when search/category/page changes

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  // Handle search submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page when submitting search
  };

  // Handle category change
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setCurrentPage(1); // Reset to first page when changing category
  };

  // Handle pagination change
  const handlePageChange = (event, page) => {
    setCurrentPage(page);
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // No need for client-side filtering since we're using backend search
  const displayArticles = articles;

  const ArticleCard = ({ article }) => (
    <Card 
      elevation={0}
      onClick={(e) => {
        // Prevent navigation if clicking on buttons or interactive elements
        if (e.target.closest('button') || e.target.closest('[role="button"]')) {
          return;
        }
        navigate(`/article/${article.id}`);
      }}
      sx={{ 
        display: { xs: 'block', md: 'flex' },
        borderRadius: '16px',
        border: '1px solid #e8f5e8',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        backgroundColor: 'white',
        '&:hover': {
          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.12)',
          transform: 'translateY(-4px)',
          borderColor: 'transparent',
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
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/article/${article.id}`);
          }}
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
              onClick={(e) => e.stopPropagation()}
              sx={{ 
                backgroundColor: '#e8f5e8',
                color: '#2e7d32',
                fontSize: '0.75rem',
                fontWeight: 600,
                fontFamily: 'Inter, sans-serif',
                height: 26,
                cursor: 'default',
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
                onClick={(e) => e.stopPropagation()}
                sx={{ 
                  fontSize: '0.75rem',
                  height: 26,
                  borderColor: '#d1d5db',
                  color: '#6b7280',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 500,
                  cursor: 'default',
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
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/article/${article.id}`);
            }}
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
          background: 'linear-gradient(to right, #14532d 0%, #0f2419 100%)',
          color: 'white',
          py: { xs: 6, md: 8 },
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
          <Box textAlign="center" mb={5}>
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
            <form onSubmit={handleSearchSubmit} style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
              <TextField
                placeholder="Search articles, species, regions..."
                value={searchQuery}
                onChange={handleSearchChange}
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
                      border: '1px solid #d1d5db',
                      boxShadow: '0 0 0 3px rgba(0, 0, 0, 0.05)',
                    },
                    '& input': {
                      py: 2,
                      fontFamily: 'Inter, sans-serif',
                    },
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                  }
                }}
              />
            </form>
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
                                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
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
                    onClick={() => handleCategoryChange('')}
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
                      primary={`All Articles`}
                      primaryTypographyProps={{
                        fontSize: '0.95rem',
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 500,
                      }}
                    />
                  </ListItemButton>
                </ListItem>
                {categories.map((category) => (
                  <ListItem key={category} disablePadding>
                    <ListItemButton
                      selected={selectedCategory === category}
                      onClick={() => handleCategoryChange(category)}
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
                        primary={category}
                        primaryTypographyProps={{
                          fontSize: '0.95rem',
                          fontFamily: 'Inter, sans-serif',
                          fontWeight: 500,
                        }}
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Box>

          {/* Articles */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            {/* Results Summary */}
            {!loading && (
              <Box mb={3}>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    color: '#6b7280',
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 500,
                  }}
                >
                  {searchQuery || selectedCategory ? (
                    `Found ${pagination.total} articles${searchQuery ? ` for "${searchQuery}"` : ''}${selectedCategory ? ` in ${selectedCategory}` : ''}`
                  ) : (
                    `Showing ${articles.length} of ${pagination.total} articles`
                  )}
                  {pagination.pages > 1 && ` • Page ${pagination.current} of ${pagination.pages}`}
                </Typography>
              </Box>
            )}

            {displayArticles.length === 0 && !loading ? (
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
                  {searchQuery || selectedCategory ? 'No articles found' : 'No articles available'}
                </Typography>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    color: '#9ca3af',
                    fontFamily: 'Inter, sans-serif',
                  }}
                >
                  {searchQuery || selectedCategory 
                    ? 'Try adjusting your search terms or browse different categories.'
                    : 'Articles will appear here once they are published.'
                  }
                </Typography>
              </Box>
            ) : (
              <>
                <Box>
                  {displayArticles.map((article) => (
                    <ArticleCard key={article.id} article={article} />
                  ))}
                </Box>
                
                {/* Pagination */}
                {pagination.pages > 1 && (
                  <Box display="flex" justifyContent="center" mt={6} mb={4}>
                    <Paper 
                      elevation={0} 
                      sx={{ 
                        p: 2,
                        borderRadius: '12px',
                        border: '1px solid #e8f5e8',
                        backgroundColor: 'white'
                      }}
                    >
                      <Pagination
                        count={pagination.pages}
                        page={currentPage}
                        onChange={handlePageChange}
                        color="primary"
                        size="large"
                        shape="rounded"
                        showFirstButton
                        showLastButton
                        sx={{
                          '& .MuiPaginationItem-root': {
                            fontFamily: 'Inter, sans-serif',
                            fontWeight: 500,
                          },
                          '& .MuiPaginationItem-page': {
                            borderRadius: '8px',
                          },
                          '& .MuiPaginationItem-page.Mui-selected': {
                            backgroundColor: '#2e7d32',
                            color: 'white',
                            '&:hover': {
                              backgroundColor: '#1b5e20',
                            }
                          }
                        }}
                      />
                    </Paper>
                  </Box>
                )}
              </>
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