import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  TextField,
  Button,
  Grid,
  Card,
  CardMedia,
  IconButton,
  Chip,
  Alert,
  CircularProgress,
  FormControlLabel,
  Switch,
  Skeleton,
} from '@mui/material';
import {
  ArrowBack,
  CloudUpload,
  Delete,
  Add,
  Save,
  Publish,
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { articleService } from '../services/articleService';

// Validation schema
const schema = yup.object({
  title: yup.string().required('Title is required').min(10, 'Title must be at least 10 characters'),
  excerpt: yup.string().required('Excerpt is required').min(50, 'Excerpt must be at least 50 characters'),
  content: yup.string().required('Content is required').min(200, 'Content must be at least 200 characters'),
  tags: yup.array().min(1, 'At least one tag is required'),
});

// Simplified image card component with caption functionality
const ImageCard = React.memo(({ item, onRemove, type, onChangeCaption }) => {
  const handleRemove = React.useCallback(() => {
    onRemove(item.id);
  }, [item.id, onRemove]);

  return (
    <Card>
      <Box position="relative">
        <CardMedia
          component={type === 'images' ? 'img' : 'video'}
          height={150}
          src={item.url}
          sx={{ objectFit: 'cover' }}
        />
        <IconButton
          size="small"
          onClick={handleRemove}
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            backgroundColor: 'rgba(255,255,255,0.8)',
            '&:hover': { backgroundColor: 'rgba(255,255,255,0.9)' }
          }}
        >
          <Delete />
        </IconButton>
      </Box>
      
      {/* Caption input */}
      <Box 
        p={2} 
        sx={{ 
          backgroundColor: 'white',
          borderRadius: 1,
        }}
      >
        <TextField
          fullWidth
          size="small"
          placeholder="Add caption..."
          value={item.caption || ''}
          onChange={(e) => onChangeCaption(item.id, e.target.value)}
          variant="outlined"
          sx={{
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: 'grey.300',
              },
              '&:hover fieldset': {
                borderColor: 'primary.main',
              },
              '&.Mui-focused fieldset': {
                borderColor: 'primary.main',
              },
            },
            '& .MuiInputBase-input': {
              padding: '8px 12px',
            },
          }}
        />
      </Box>
    </Card>
  );
});

const EditArticlePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [loadingArticle, setLoadingArticle] = useState(true);
  const [error, setError] = useState('');
  const [article, setArticle] = useState(null);
  const [images, setImages] = useState([]);
  const [videos, setVideos] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [preview, setPreview] = useState(false);

  const {
    control,
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      title: '',
      excerpt: '',
      content: '',
      tags: [],
      featured: false,
    },
  });

  const watchedValues = watch();

  const fetchArticle = useCallback(async () => {
    try {
      setLoadingArticle(true);
      // For editing, we need to get the article even if it's not published
      // In a real app, this would be a different endpoint or parameter
      const response = await articleService.getArticleById(id);
      const articleData = response.data.article;
      
      // Check if user can edit this article
      if (articleData.author.id !== user.id && user.role !== 'admin') {
        setError('You do not have permission to edit this article.');
        return;
      }

      setArticle(articleData);
      setImages(articleData.images || []);
      setVideos(articleData.videos || []);
      
      // Populate form with existing data
      reset({
        title: articleData.title,
        excerpt: articleData.excerpt,
        content: articleData.content,
        tags: articleData.tags,
        featured: articleData.featured || false,
      });
    } catch (err) {
      setError('Failed to load article or article not found.');
      console.error('Error fetching article:', err);
    } finally {
      setLoadingArticle(false);
    }
  }, [id, user.id, user.role, reset]);

  useEffect(() => {
    fetchArticle();
  }, [fetchArticle]);

  // Image dropzone (same as CreateArticlePage)
  const imageDropzone = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxFiles: 10,
    maxSize: 5 * 1024 * 1024, // 5MB
    onDrop: async (acceptedFiles) => {
      for (const file of acceptedFiles) {
        try {
          const response = await articleService.uploadMedia(file);
          // Parse the nested response structure based on file type
          const uploadData = file.type.startsWith('image/') ? response.data.image : response.data.video;
          const newImage = {
            id: Date.now() + Math.random(),
            url: uploadData.url,
            alt: file.name,
            file: file,
            caption: ''
          };
          setImages(prev => [...prev, newImage]);
        } catch (err) {
          console.error('Error uploading image:', err);
        }
      }
    },
  });

  // Video dropzone (same as CreateArticlePage)
  const videoDropzone = useDropzone({
    accept: {
      'video/*': ['.mp4', '.mov', '.avi']
    },
    maxFiles: 5,
    maxSize: 50 * 1024 * 1024, // 50MB
    onDrop: async (acceptedFiles) => {
      for (const file of acceptedFiles) {
        try {
          const response = await articleService.uploadMedia(file);
          // Parse the nested response structure for video
          const uploadData = response.data.video;
          const newVideo = {
            id: Date.now() + Math.random(),
            url: uploadData.url,
            thumbnail: uploadData.thumbnail || uploadData.url,
            file: file,
            caption: ''
          };
          setVideos(prev => [...prev, newVideo]);
        } catch (err) {
          console.error('Error uploading video:', err);
        }
      }
    },
  });

  const handleAddTag = () => {
    if (tagInput.trim() && !watchedValues.tags.includes(tagInput.trim())) {
      setValue('tags', [...watchedValues.tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setValue('tags', watchedValues.tags.filter(tag => tag !== tagToRemove));
  };

  const handleRemoveImage = (imageId) => {
    setImages(images.filter(img => img.id !== imageId));
  };

  const handleRemoveVideo = (videoId) => {
    setVideos(videos.filter(vid => vid.id !== videoId));
  };

  // Handle image caption change - update the actual image object
  const handleImageCaptionChange = useCallback((imageId, caption) => {
    setImages(prev => prev.map(img => 
      img.id === imageId ? { ...img, caption } : img
    ));
  }, []);

  // Handle video caption change - update the actual video object
  const handleVideoCaptionChange = useCallback((videoId, caption) => {
    setVideos(prev => prev.map(vid => 
      vid.id === videoId ? { ...vid, caption } : vid
    ));
  }, []);

  const onSubmit = async (data, publish = null) => {
    try {
      setLoading(true);
      setError('');

      const articleData = {
        ...data,
        images: images.map(({ file, ...img }) => img),
        videos: videos.map(({ file, ...vid }) => vid),
      };

      // If publish is explicitly set, use that, otherwise keep current published state
      if (publish !== null) {
        articleData.published = publish;
      }

      await articleService.updateArticle(id, articleData);
      
      // If explicitly publishing an unpublished article
      if (publish === true && !article.published) {
        await articleService.publishArticle(id);
      }

      navigate('/dashboard');
    } catch (err) {
      setError('Failed to save article. Please try again.');
      console.error('Error updating article:', err);
    } finally {
      setLoading(false);
    }
  };

  const MediaUploadZone = ({ title, dropzone, items, onRemove, type, onCaptionChange }) => (
    <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      
      <Box
        {...dropzone.getRootProps()}
        sx={{
          border: '2px dashed',
          borderColor: dropzone.isDragActive ? 'primary.main' : 'grey.300',
          borderRadius: 2,
          p: 3,
          textAlign: 'center',
          cursor: 'pointer',
          mb: 2,
          backgroundColor: dropzone.isDragActive ? 'action.hover' : 'transparent',
          transition: 'all 0.2s ease',
          '&:hover': {
            borderColor: 'primary.main',
            backgroundColor: 'action.hover',
          }
        }}
      >
        <input {...dropzone.getInputProps()} />
        <CloudUpload sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
        <Typography variant="body1" gutterBottom>
          {dropzone.isDragActive 
            ? `Drop ${type} here...` 
            : `Drag & drop ${type}, or click to select`
          }
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {type === 'images' 
            ? 'Supported: JPG, PNG, WebP (max 5MB each)' 
            : 'Supported: MP4, MOV, AVI (max 50MB each)'
          }
        </Typography>
      </Box>

      {items.length > 0 && (
        <Grid container spacing={2}>
          {items.map((item) => (
            <Grid item xs={12} sm={6} md={4} key={item.id}>
              <ImageCard
                item={item}
                onRemove={onRemove}
                type={type}
                onChangeCaption={onCaptionChange}
              />
            </Grid>
          ))}
        </Grid>
      )}
    </Paper>
  );

  const PreviewMode = () => (
    <Paper elevation={2} sx={{ p: 4 }}>
      <Typography variant="h3" gutterBottom>
        {watchedValues.title}
      </Typography>
      
      <Box mb={2}>
        {watchedValues.tags.map((tag) => (
          <Chip key={tag} label={tag} sx={{ mr: 1, mb: 1 }} />
        ))}
      </Box>

      <Typography variant="h6" gutterBottom sx={{ fontStyle: 'italic' }}>
        {watchedValues.excerpt}
      </Typography>

      {images.length > 0 && (
        <Box mb={3}>
          <img 
            src={images[0].url} 
            alt={images[0].alt}
            style={{ width: '100%', maxHeight: 400, objectFit: 'cover', borderRadius: 8 }}
          />
        </Box>
      )}

      <Typography variant="body1" sx={{ whiteSpace: 'pre-line', lineHeight: 1.8 }}>
        {watchedValues.content}
      </Typography>
    </Paper>
  );

  if (loadingArticle) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Skeleton variant="text" sx={{ fontSize: '2rem', mb: 2 }} />
        <Skeleton variant="rectangular" height={400} sx={{ mb: 3 }} />
        <Skeleton variant="text" />
        <Skeleton variant="text" />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={() => navigate('/dashboard')}>
          Back to Dashboard
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box display="flex" alignItems="center" gap={2} mb={4}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/dashboard')}
        >
          Back to Dashboard
        </Button>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
          Edit Article
        </Typography>
        {article && (
          <Chip 
            label={article.published ? 'Published' : 'Draft'}
            color={article.published ? 'success' : 'warning'}
          />
        )}
      </Box>

      {/* Preview Toggle */}
      <Box mb={3}>
        <FormControlLabel
          control={
            <Switch
              checked={preview}
              onChange={(e) => setPreview(e.target.checked)}
            />
          }
          label="Preview Mode"
        />
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {preview ? (
        <PreviewMode />
      ) : (
        <form onSubmit={handleSubmit((data) => onSubmit(data))}>
          <Grid container spacing={3}>
            {/* Left Column - Content */}
            <Grid item xs={12} lg={8}>
              <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Article Content
                </Typography>

                <TextField
                  {...register('title')}
                  fullWidth
                  label="Article Title"
                  placeholder="Enter a compelling title for your wildlife article..."
                  error={!!errors.title}
                  helperText={errors.title?.message}
                  sx={{ mb: 3 }}
                />

                <TextField
                  {...register('excerpt')}
                  fullWidth
                  label="Article Excerpt"
                  placeholder="Write a brief summary that will appear in article cards..."
                  multiline
                  rows={3}
                  error={!!errors.excerpt}
                  helperText={errors.excerpt?.message}
                  sx={{ mb: 3 }}
                />

                <TextField
                  {...register('content')}
                  fullWidth
                  label="Article Content"
                  placeholder="Share your wildlife research, observations, and conservation insights..."
                  multiline
                  rows={15}
                  error={!!errors.content}
                  helperText={errors.content?.message}
                />
              </Paper>

              {/* Media Upload */}
              <MediaUploadZone
                title="Images"
                dropzone={imageDropzone}
                items={images}
                onRemove={handleRemoveImage}
                type="images"
                onCaptionChange={handleImageCaptionChange}
              />

              <MediaUploadZone
                title="Videos"
                dropzone={videoDropzone}
                items={videos}
                onRemove={handleRemoveVideo}
                type="videos"
                onCaptionChange={handleVideoCaptionChange}
              />
            </Grid>

            {/* Right Column - Settings */}
            <Grid item xs={12} lg={4}>
              <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Article Settings
                </Typography>

                {/* Tags */}
                <Box mb={3}>
                  <Typography variant="body2" gutterBottom>
                    Tags
                  </Typography>
                  <Box display="flex" gap={1} mb={1}>
                    <TextField
                      size="small"
                      placeholder="Add tag..."
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                      sx={{ flexGrow: 1 }}
                    />
                    <Button
                      variant="outlined"
                      onClick={handleAddTag}
                      disabled={!tagInput.trim()}
                    >
                      <Add />
                    </Button>
                  </Box>
                  
                  <Box display="flex" flexWrap="wrap" gap={0.5}>
                    {watchedValues.tags.map((tag) => (
                      <Chip
                        key={tag}
                        label={tag}
                        onDelete={() => handleRemoveTag(tag)}
                        size="small"
                      />
                    ))}
                  </Box>
                  {errors.tags && (
                    <Typography variant="caption" color="error">
                      {errors.tags.message}
                    </Typography>
                  )}
                </Box>

                {/* Featured Article */}
                <Controller
                  name="featured"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={<Switch {...field} checked={field.value} />}
                      label="Featured Article"
                    />
                  )}
                />
              </Paper>

              {/* Action Buttons */}
              <Paper elevation={2} sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Actions
                </Typography>
                
                <Box display="flex" flexDirection="column" gap={2}>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<Save />}
                    onClick={handleSubmit((data) => onSubmit(data))}
                    disabled={loading}
                  >
                    Save Changes
                  </Button>
                  
                  {!article?.published && (
                    <Button
                      variant="contained"
                      fullWidth
                      startIcon={<Publish />}
                      onClick={handleSubmit((data) => onSubmit(data, true))}
                      disabled={loading}
                    >
                      {loading ? <CircularProgress size={20} /> : 'Publish Article'}
                    </Button>
                  )}
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </form>
      )}
    </Container>
  );
};

export default EditArticlePage; 