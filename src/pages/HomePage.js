import React, { useState, useMemo } from 'react';
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

// Mock articles data - moved outside component to fix ESLint warning
const mockArticles = [
  {
    id: 1,
    title: 'Orangutans of Borneo: Protecting the Last Forest Gardeners',
    excerpt: 'Discover the critical situation facing Bornean orangutans and learn how conservation efforts are working to save these incredible forest gardeners.',
    author: { name: 'Dr. John Doe' },
    publishedDate: '2024-01-05',
    images: [{ 
      url: 'https://images.unsplash.com/photo-1544985361-b420d7a77043?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&h=600&q=80', 
      caption: 'Orangutan mother with her baby in Borneo rainforest' 
    }],
    tags: ['Primates', 'Orangutans', 'Conservation'],
    views: 654,
    category: 'Primates',
    published: true
  },
  {
    id: 2,
    title: 'Bengal Tigers: Guardians of the Sundarbans',
    excerpt: 'Explore the unique ecosystem of the Sundarbans and the magnificent Bengal tigers that call this mangrove forest home.',
    author: { name: 'Dr. Sarah Wilson' },
    publishedDate: '2024-01-03',
    images: [{ 
      url: 'https://images.unsplash.com/photo-1551969014-7d2c4cddf0b6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80', 
      caption: 'Bengal tiger in Sundarbans mangrove forest' 
    }],
    tags: ['Big Cats', 'Tigers', 'Conservation'],
    views: 892,
    category: 'Big Cats',
    published: true
  },
  {
    id: 3,
    title: 'African Elephants: The Gentle Giants of the Savanna',
    excerpt: 'Learn about the complex social structures of African elephants and the conservation challenges they face in the modern world.',
    author: { name: 'Dr. Michael Chen' },
    publishedDate: '2024-01-01',
    images: [{ 
      url: 'https://images.unsplash.com/photo-1564760055775-d63b17a55c44?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80', 
      caption: 'African elephant herd in savanna' 
    }],
    tags: ['Large Mammals', 'Elephants', 'Conservation'],
    views: 567,
    category: 'Large Mammals',
    published: true
  }
];

const HomePage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  // Categories
  const categories = ['Big Cats', 'Large Mammals', 'Primates'];

  const filteredArticles = useMemo(() => {
    let filtered = mockArticles.filter(article => article.published);

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(article => 
        article.title.toLowerCase().includes(query) ||
        article.excerpt.toLowerCase().includes(query) ||
        article.tags.some(tag => tag.toLowerCase().includes(query)) ||
        article.author.name.toLowerCase().includes(query)
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter(article => article.category === selectedCategory);
    }

    return filtered.sort((a, b) => 
      new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime()
    );
  }, [searchQuery, selectedCategory]);

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
      {article.images.length > 0 && (
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
              {article.author.name}
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
              {format(new Date(article.publishedDate), 'MMM d, yyyy')}
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
              {article.views.toLocaleString()} views
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
          {article.excerpt}
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
            {article.tags.slice(0, 2).map((tag) => (
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
            {article.tags.length > 2 && (
              <Typography 
                variant="caption" 
                sx={{ 
                  alignSelf: 'center',
                  color: '#9ca3af',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 500,
                }}
              >
                +{article.tags.length - 2} more
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
                      primary={`All Articles (${mockArticles.filter(a => a.published).length})`}
                      primaryTypographyProps={{
                        fontSize: '0.95rem',
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 500,
                      }}
                    />
                  </ListItemButton>
                </ListItem>
                {categories.map((category) => {
                  const count = mockArticles.filter(a => a.published && a.category === category).length;
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
      </Container>

      <Footer />
    </Box>
  );
};

export default HomePage; 