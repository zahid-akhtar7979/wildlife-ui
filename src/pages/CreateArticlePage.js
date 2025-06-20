import React, { useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { useDropzone } from 'react-dropzone';
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
  FormControlLabel,
  Switch,
  MenuItem,
  Fab,
} from '@mui/material';
import {
  ArrowBack,
  CloudUpload,
  Delete,
  Add,
  Save,
  Publish,
  Visibility,
  Edit,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { mockArticles, categories } from '../data/mockData';
import WildlifeRichEditor from '../components/common/WildlifeRichEditor';

const CreateArticlePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [images, setImages] = useState([]);
  const [videos, setVideos] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [preview, setPreview] = useState(false);

  const existingArticle = id ? mockArticles.find(a => a.id === parseInt(id)) : null;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: existingArticle?.title || '',
      excerpt: existingArticle?.excerpt || '',
      content: existingArticle?.content || '',
      category: existingArticle?.category || '',
      tags: existingArticle?.tags || [],
      featured: existingArticle?.featured || false,
    },
  });

  const watchedValues = watch();

  // Image dropzone
  const imageDropzone = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxFiles: 10,
    maxSize: 5 * 1024 * 1024, // 5MB
    onDrop: useCallback((acceptedFiles) => {
      const newImages = acceptedFiles.map(file => ({
        id: Date.now() + Math.random(),
        url: URL.createObjectURL(file),
        caption: '',
        alt: file.name,
        file: file,
      }));
      setImages(prev => [...prev, ...newImages]);
    }, []),
  });

  // Video dropzone
  const videoDropzone = useDropzone({
    accept: {
      'video/*': ['.mp4', '.mov', '.avi']
    },
    maxFiles: 5,
    maxSize: 50 * 1024 * 1024, // 50MB
    onDrop: useCallback((acceptedFiles) => {
      const newVideos = acceptedFiles.map(file => ({
        id: Date.now() + Math.random(),
        url: URL.createObjectURL(file),
        caption: '',
        thumbnail: URL.createObjectURL(file),
        file: file,
      }));
      setVideos(prev => [...prev, ...newVideos]);
    }, []),
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

  const handleImageCaptionChange = (imageId, caption) => {
    setImages(images.map(img => 
      img.id === imageId ? { ...img, caption } : img
    ));
  };

  const handleVideoCaptionChange = (videoId, caption) => {
    setVideos(videos.map(vid => 
      vid.id === videoId ? { ...vid, caption } : vid
    ));
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      setSubmitError('');

      const articleData = {
        ...data,
        images: images.map(({ file, ...img }) => img),
        videos: videos.map(({ file, ...vid }) => vid),
        author: user,
        publishDate: new Date().toISOString(),
        published: false,
        views: 0,
      };

      console.log('Saving article:', articleData);
      
      // In a real app, you would make an API call here
      // await articleService.createArticle(articleData);
      
      navigate('/dashboard');
    } catch (err) {
      setSubmitError('Failed to save article. Please try again.');
      console.error('Error saving article:', err);
    } finally {
      setLoading(false);
    }
  };

  const MediaUploadZone = ({ title, dropzone, items, onRemove, onCaptionChange, type }) => (
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
                    onClick={() => onRemove(item.id)}
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
                <Box p={1}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Add caption..."
                    value={item.caption}
                    onChange={(e) => onCaptionChange(item.id, e.target.value)}
                  />
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Paper>
  );

  const PreviewMode = () => (
    <Paper elevation={2} sx={{ p: 4 }}>
      <Typography variant="h3" gutterBottom>
        {watchedValues.title || 'Untitled Article'}
      </Typography>
      
      <Box mb={2}>
        <Chip 
          label={watchedValues.category || 'Uncategorized'} 
          color="primary" 
          sx={{ mr: 1, mb: 1 }} 
        />
        {watchedValues.tags.map((tag) => (
          <Chip key={tag} label={tag} variant="outlined" sx={{ mr: 1, mb: 1 }} />
        ))}
      </Box>

      <Typography variant="h6" gutterBottom sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
        {watchedValues.excerpt || 'No excerpt provided...'}
      </Typography>

      {images.length > 0 && (
        <Box mb={3}>
          <img 
            src={images[0].url} 
            alt={images[0].alt}
            style={{ width: '100%', maxHeight: 400, objectFit: 'cover', borderRadius: 8 }}
          />
          {images[0].caption && (
            <Typography variant="caption" display="block" sx={{ mt: 1, textAlign: 'center' }}>
              {images[0].caption}
            </Typography>
          )}
        </Box>
      )}

      <Typography variant="body1" sx={{ whiteSpace: 'pre-line', lineHeight: 1.8 }}>
        {watchedValues.content || 'No content yet...'}
      </Typography>
    </Paper>
  );

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f8faf8' }}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Header */}
        <Box display="flex" alignItems="center" gap={2} mb={4}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/dashboard')}
            sx={{
              color: '#2e7d32',
              fontWeight: 600,
              '&:hover': {
                backgroundColor: '#e8f5e8',
                color: '#1b5e20'
              }
            }}
          >
            Back to Dashboard
          </Button>
          <Typography 
            variant="h4" 
            component="h1" 
            sx={{ 
              fontWeight: 700,
              color: '#1b5e20',
              fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif'
            }}
          >
            {existingArticle ? 'Edit Article' : 'Create New Article'}
          </Typography>
        </Box>

      {/* Mode Toggle */}
      <Box mb={3} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Button
          variant={!preview ? "contained" : "outlined"}
          startIcon={<Edit />}
          onClick={() => setPreview(false)}
          sx={{ 
            minWidth: 120,
            fontWeight: 600,
            textTransform: 'none',
            borderRadius: 2,
            backgroundColor: !preview ? '#2e7d32' : 'transparent',
            borderColor: '#2e7d32',
            color: !preview ? 'white' : '#2e7d32',
            '&:hover': {
              backgroundColor: !preview ? '#1b5e20' : '#e8f5e8',
              borderColor: '#1b5e20',
            }
          }}
        >
          Edit
        </Button>
        <Button
          variant={preview ? "contained" : "outlined"}
          startIcon={<Visibility />}
          onClick={() => setPreview(true)}
          sx={{ 
            minWidth: 120,
            fontWeight: 600,
            textTransform: 'none',
            borderRadius: 2,
            backgroundColor: preview ? '#2e7d32' : 'transparent',
            borderColor: '#2e7d32',
            color: preview ? 'white' : '#2e7d32',
            '&:hover': {
              backgroundColor: preview ? '#1b5e20' : '#e8f5e8',
              borderColor: '#1b5e20',
            }
          }}
        >
          Preview
        </Button>
      </Box>

      {submitError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {submitError}
        </Alert>
      )}

      {preview ? (
        <PreviewMode />
      ) : (
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3}>
            {/* Left Column - Content */}
            <Grid item xs={12} lg={8}>
              <Paper 
                elevation={2} 
                sx={{ 
                  p: 3, 
                  mb: 3,
                  backgroundColor: 'white',
                  border: '1px solid #e8f5e8',
                  borderRadius: 3,
                }}
              >
                <Typography 
                  variant="h6" 
                  gutterBottom
                  sx={{
                    color: '#1b5e20',
                    fontWeight: 600,
                    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif'
                  }}
                >
                  Article Content
                </Typography>

                <TextField
                  {...register('title', { required: 'Title is required' })}
                  fullWidth
                  label="Article Title"
                  placeholder="Enter a compelling title for your wildlife article..."
                  error={!!errors.title}
                  helperText={errors.title?.message}
                  sx={{ mb: 3 }}
                />

                <TextField
                  {...register('excerpt', { required: 'Excerpt is required' })}
                  fullWidth
                  label="Article Excerpt"
                  placeholder="Write a brief summary that will appear in article cards..."
                  multiline
                  rows={3}
                  error={!!errors.excerpt}
                  helperText={errors.excerpt?.message}
                  sx={{ mb: 3 }}
                />

                <Controller
                  name="content"
                  control={control}
                  rules={{ required: 'Content is required' }}
                  render={({ field }) => (
                    <WildlifeRichEditor
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Share your wildlife research, observations, and conservation insights..."
                      error={!!errors.content}
                      helperText={errors.content?.message}
                    />
                  )}
                />
              </Paper>

              {/* Media Upload */}
              <MediaUploadZone
                title="Images"
                dropzone={imageDropzone}
                items={images}
                onRemove={handleRemoveImage}
                onCaptionChange={handleImageCaptionChange}
                type="images"
              />

              <MediaUploadZone
                title="Videos"
                dropzone={videoDropzone}
                items={videos}
                onRemove={handleRemoveVideo}
                onCaptionChange={handleVideoCaptionChange}
                type="videos"
              />
            </Grid>

            {/* Right Column - Settings */}
            <Grid item xs={12} lg={4}>
              <Paper 
                elevation={2} 
                sx={{ 
                  p: 3, 
                  mb: 3,
                  backgroundColor: 'white',
                  border: '1px solid #e8f5e8',
                  borderRadius: 3,
                }}
              >
                <Typography 
                  variant="h6" 
                  gutterBottom
                  sx={{
                    color: '#1b5e20',
                    fontWeight: 600,
                    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif'
                  }}
                >
                  Article Settings
                </Typography>

                {/* Category */}
                <TextField
                  {...register('category', { required: 'Category is required' })}
                  select
                  fullWidth
                  label="Category"
                  error={!!errors.category}
                  helperText={errors.category?.message}
                  sx={{ mb: 3 }}
                >
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </TextField>

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
                </Box>

                {/* Featured */}
                <FormControlLabel
                  control={
                    <Switch 
                      {...register('featured')}
                      checked={watchedValues.featured}
                      onChange={(e) => setValue('featured', e.target.checked)}
                    />
                  }
                  label="Featured Article"
                />
              </Paper>

              {/* Actions */}
              <Paper 
                elevation={2} 
                sx={{ 
                  p: 3,
                  backgroundColor: 'white',
                  border: '1px solid #e8f5e8',
                  borderRadius: 3,
                }}
              >
                <Typography 
                  variant="h6" 
                  gutterBottom
                  sx={{
                    color: '#1b5e20',
                    fontWeight: 600,
                    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif'
                  }}
                >
                  Actions
                </Typography>
                
                <Box display="flex" flexDirection="column" gap={2}>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={<Save />}
                    fullWidth
                    disabled={loading}
                    sx={{
                      backgroundColor: '#2e7d32',
                      fontWeight: 600,
                      textTransform: 'none',
                      borderRadius: 2,
                      py: 1.5,
                      '&:hover': {
                        backgroundColor: '#1b5e20',
                      },
                      '&:disabled': {
                        backgroundColor: '#a5d6a7',
                      }
                    }}
                  >
                    {loading ? 'Saving...' : 'Save Draft'}
                  </Button>
                  
                  <Button
                    variant="outlined"
                    startIcon={<Publish />}
                    fullWidth
                    onClick={handleSubmit((data) => onSubmit({...data, published: true}))}
                    disabled={loading}
                    sx={{
                      borderColor: '#2e7d32',
                      color: '#2e7d32',
                      fontWeight: 600,
                      textTransform: 'none',
                      borderRadius: 2,
                      py: 1.5,
                      '&:hover': {
                        backgroundColor: '#e8f5e8',
                        borderColor: '#1b5e20',
                        color: '#1b5e20',
                      },
                      '&:disabled': {
                        borderColor: '#a5d6a7',
                        color: '#a5d6a7',
                      }
                    }}
                  >
                    Save & Publish
                  </Button>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </form>
      )}

      {/* Floating Action Button */}
      <Fab
        sx={{ 
          position: 'fixed', 
          bottom: 24, 
          right: 24,
          backgroundColor: '#2e7d32',
          color: 'white',
          '&:hover': {
            backgroundColor: '#1b5e20',
            transform: 'scale(1.1)',
            transition: 'transform 0.2s ease-in-out'
          }
        }}
        onClick={() => setPreview(!preview)}
      >
        {preview ? <Edit /> : <Visibility />}
      </Fab>
    </Container>
    </Box>
  );
};

export default CreateArticlePage; 