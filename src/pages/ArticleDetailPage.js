import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Chip,
  Button,
  Grid,
  Card,
  CardMedia,
  Avatar,
  IconButton,
  Skeleton,
  Alert,
  Dialog,
  DialogContent,
} from '@mui/material';
import {
  CalendarToday,
  Share,
  Facebook,
  Twitter,
  LinkedIn,
  Link as LinkIcon,
  ArrowBack,
  PlayArrow,
  Close,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { articleService } from '../services/articleService';
import { format } from 'date-fns';

const ArticleDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [shareMenuAnchor, setShareMenuAnchor] = useState(null);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        console.log('🔍 ArticleDetailPage - Fetching article with ID:', id);
        setLoading(true);
        const response = await articleService.getArticleById(id);
        console.log('📦 ArticleDetailPage - API Response:', response);
        console.log('📄 ArticleDetailPage - Article data:', response.data?.article);
        setArticle(response.data.article);
        console.log('✅ ArticleDetailPage - Article set successfully');
      } catch (err) {
        console.error('❌ ArticleDetailPage - Error fetching article:', err);
        console.error('❌ ArticleDetailPage - Error details:', err.response || err.message);
        setError('Failed to load article. Please try again.');
      } finally {
        setLoading(false);
        console.log('🏁 ArticleDetailPage - Loading finished');
      }
    };

    console.log('🚀 ArticleDetailPage - useEffect triggered with ID:', id);
    if (id) {
      fetchArticle();
    } else {
      console.log('⚠️ ArticleDetailPage - No ID provided');
      setLoading(false);
    }
  }, [id]);

  const handleShare = (platform) => {
    const url = window.location.href;
    const text = article?.excerpt || 'Check out this wildlife article';

    const shareUrls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      copy: url,
    };

    if (platform === 'copy') {
      navigator.clipboard.writeText(url);
      // You could add a snackbar notification here
    } else {
      window.open(shareUrls[platform], '_blank', 'width=600,height=400');
    }
    
    setShareMenuAnchor(null);
  };

  const MediaGallery = ({ images, videos }) => {
    if (!images?.length && !videos?.length) return null;

    return (
      <Box mb={4}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          Media Gallery
        </Typography>
        <Grid container spacing={2}>
          {images?.map((image) => (
            <Grid item xs={12} sm={6} md={4} key={image.id}>
              <Card 
                sx={{ 
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'scale(1.02)' }
                }}
                onClick={() => setSelectedMedia({ type: 'image', ...image })}
              >
                <CardMedia
                  component="img"
                  height={200}
                  image={image.url}
                  alt={image.alt}
                  sx={{ objectFit: 'cover' }}
                />
                {image.caption && (
                  <Box p={1}>
                    <Typography variant="caption" color="text.secondary">
                      {image.caption}
                    </Typography>
                  </Box>
                )}
              </Card>
            </Grid>
          ))}
          
          {videos?.map((video) => (
            <Grid item xs={12} sm={6} md={4} key={video.id}>
              <Card 
                sx={{ 
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'scale(1.02)' }
                }}
                onClick={() => setSelectedMedia({ type: 'video', ...video })}
              >
                <CardMedia
                  component="img"
                  height={200}
                  image={video.thumbnail}
                  alt={video.caption}
                  sx={{ objectFit: 'cover' }}
                />
                <Box
                  position="absolute"
                  top="50%"
                  left="50%"
                  sx={{
                    transform: 'translate(-50%, -50%)',
                    backgroundColor: 'rgba(0,0,0,0.7)',
                    borderRadius: '50%',
                    p: 1,
                  }}
                >
                  <PlayArrow sx={{ color: 'white', fontSize: 32 }} />
                </Box>
                {video.caption && (
                  <Box p={1}>
                    <Typography variant="caption" color="text.secondary">
                      {video.caption}
                    </Typography>
                  </Box>
                )}
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  };

  const MediaDialog = () => (
    <Dialog
      open={Boolean(selectedMedia)}
      onClose={() => setSelectedMedia(null)}
      maxWidth="lg"
      fullWidth
    >
      <DialogContent sx={{ p: 0, position: 'relative' }}>
        <IconButton
          onClick={() => setSelectedMedia(null)}
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            zIndex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            color: 'white',
            '&:hover': { backgroundColor: 'rgba(0,0,0,0.7)' }
          }}
        >
          <Close />
        </IconButton>
        
        {selectedMedia?.type === 'image' ? (
          <img
            src={selectedMedia.url}
            alt={selectedMedia.alt}
            style={{ width: '100%', height: 'auto', display: 'block' }}
          />
        ) : selectedMedia?.type === 'video' ? (
          <video
            src={selectedMedia.url}
            controls
            style={{ width: '100%', height: 'auto', display: 'block' }}
          />
        ) : null}
        
        {selectedMedia?.caption && (
          <Box p={2}>
            <Typography variant="body2" color="text.secondary">
              {selectedMedia.caption}
            </Typography>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );

  if (loading) {
    console.log('🔄 ArticleDetailPage - Rendering loading state');
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Skeleton variant="text" sx={{ fontSize: '2rem', mb: 2 }} />
        <Skeleton variant="rectangular" height={300} sx={{ mb: 3 }} />
        <Skeleton variant="text" />
        <Skeleton variant="text" />
        <Skeleton variant="text" />
      </Container>
    );
  }

  if (error || !article) {
    console.log('❌ ArticleDetailPage - Rendering error state');
    console.log('   - Error:', error);
    console.log('   - Article:', article);
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 4 }}>
          {error || 'Article not found'}
        </Alert>
        <Button variant="contained" onClick={() => navigate('/')}>
          Back to Articles
        </Button>
      </Container>
    );
  }

  console.log('✅ ArticleDetailPage - Rendering article content');
  console.log('📄 Article data for rendering:', {
    id: article?.id,
    title: article?.title,
    content: article?.content ? 'HAS CONTENT' : 'NO CONTENT',
    author: article?.author,
    tags: article?.tags,
    images: article?.images?.length || 0
  });

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Back Button */}
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate('/')}
        sx={{ mb: 3 }}
      >
        Back to Articles
      </Button>

      {/* Article Header */}
      <Paper elevation={2} sx={{ p: 4, mb: 4 }}>
        <Typography 
          variant="h3" 
          component="h1" 
          gutterBottom
          sx={{ fontWeight: 700, lineHeight: 1.2 }}
        >
          {article.title}
        </Typography>

        {/* Author and Date Info */}
        <Box display="flex" alignItems="center" gap={3} mb={3}>
          <Box display="flex" alignItems="center" gap={1}>
            <Avatar sx={{ width: 40, height: 40, bgcolor: 'primary.main' }}>
              {article.author?.name?.charAt(0) || 'A'}
            </Avatar>
            <Box>
              <Typography variant="body2" fontWeight="bold">
                {article.author?.name || 'Unknown Author'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Wildlife Researcher
              </Typography>
            </Box>
          </Box>

          <Box display="flex" alignItems="center" gap={0.5}>
            <CalendarToday fontSize="small" color="action" />
            <Typography variant="body2" color="text.secondary">
              {format(new Date(article.publishDate), 'MMMM dd, yyyy')}
            </Typography>
          </Box>

          <Box sx={{ ml: 'auto' }}>
            <IconButton
              onClick={(e) => setShareMenuAnchor(e.currentTarget)}
              color="primary"
            >
              <Share />
            </IconButton>
          </Box>
        </Box>

        {/* Tags */}
        <Box display="flex" flexWrap="wrap" gap={1} mb={3}>
          {(article.tags || []).map((tag) => (
            <Chip
              key={tag}
              label={tag}
              variant="outlined"
              color="primary"
              size="small"
            />
          ))}
        </Box>

        {/* Featured Image */}
        {article.images?.[0] && (
          <Box mb={3}>
            <Card>
              <CardMedia
                component="img"
                height={400}
                image={article.images[0].url}
                alt={article.images[0].alt}
                sx={{ objectFit: 'cover' }}
              />
              {article.images[0].caption && (
                <Box p={2}>
                  <Typography variant="caption" color="text.secondary">
                    {article.images[0].caption}
                  </Typography>
                </Box>
              )}
            </Card>
          </Box>
        )}
      </Paper>

      {/* Article Content */}
      <Paper elevation={2} sx={{ p: 4, mb: 4 }}>
        <Box 
          sx={{ 
            lineHeight: 1.8, 
            fontSize: '1.1rem',
            '& p': { marginBottom: 2 },
            '& h2, & h3, & h4': { marginTop: 3, marginBottom: 1.5, fontWeight: 600 },
            '& ul, & ol': { marginBottom: 2, paddingLeft: 3 },
            '& blockquote': { 
              borderLeft: '4px solid #2e7d32',
              paddingLeft: 2,
              margin: '16px 0',
              fontStyle: 'italic',
              backgroundColor: '#f5f5f5',
              padding: 2
            },
            '& img': { maxWidth: '100%', height: 'auto', borderRadius: 1 }
          }}
          dangerouslySetInnerHTML={{ __html: article.content }}
        />
      </Paper>

      {/* Media Gallery */}
      {(article.images?.length > 1 || article.videos?.length > 0) && (
        <Paper elevation={2} sx={{ p: 4, mb: 4 }}>
          <MediaGallery images={article.images?.slice(1)} videos={article.videos} />
        </Paper>
      )}

      {/* Share Options */}
      <Dialog
        open={Boolean(shareMenuAnchor)}
        onClose={() => setShareMenuAnchor(null)}
      >
        <DialogContent>
          <Typography variant="h6" gutterBottom>
            Share this article
          </Typography>
          <Box display="flex" flexDirection="column" gap={1}>
            <Button
              startIcon={<Facebook />}
              onClick={() => handleShare('facebook')}
              fullWidth
            >
              Share on Facebook
            </Button>
            <Button
              startIcon={<Twitter />}
              onClick={() => handleShare('twitter')}
              fullWidth
            >
              Share on Twitter
            </Button>
            <Button
              startIcon={<LinkedIn />}
              onClick={() => handleShare('linkedin')}
              fullWidth
            >
              Share on LinkedIn
            </Button>
            <Button
              startIcon={<LinkIcon />}
              onClick={() => handleShare('copy')}
              fullWidth
            >
              Copy Link
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Media Viewer Dialog */}
      <MediaDialog />

      {/* Footer with Author Info */}
      <Paper elevation={2} sx={{ p: 4 }}>
        <Typography variant="h6" gutterBottom>
          About the Author
        </Typography>
        <Box display="flex" alignItems="center" gap={2}>
          <Avatar sx={{ width: 60, height: 60, bgcolor: 'primary.main' }}>
            {article.author?.name?.charAt(0) || 'A'}
          </Avatar>
          <Box>
            <Typography variant="body1" fontWeight="bold">
              {article.author?.name || 'Unknown Author'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Wildlife researcher and conservationist dedicated to protecting endangered species 
              and raising awareness about wildlife conservation.
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default ArticleDetailPage; 