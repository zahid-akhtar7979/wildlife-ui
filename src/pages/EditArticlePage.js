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
  MenuItem,
  Fab,
  LinearProgress,
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
  CheckCircle,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import { useForm, Controller } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { articleService } from '../services/articleService';
import { categories } from '../data/mockData';
import WildlifeRichEditor from '../components/common/WildlifeRichEditor';

// Simplified image card component without caption functionality (matching CreateArticlePage)
const ImageCard = React.memo(({ item, onRemove, type, uploadingFiles }) => {
  const handleRemove = useCallback(() => {
    onRemove(item.id);
  }, [item.id, onRemove]);

  // Memo the progress value to prevent unnecessary re-renders
  const progressValue = React.useMemo(() => {
    const uploadingFile = uploadingFiles.get(item.id);
    return uploadingFile?.progress || 0;
  }, [uploadingFiles, item.id]);

  return (
    <Card>
      <Box 
        position="relative"
        sx={{
          borderRadius: 1,
          overflow: 'hidden',
          border: item.status === 'uploading' ? '2px solid #4caf50' : 
                  item.status === 'completed' ? '2px solid #2e7d32' :
                  item.status === 'error' ? '2px solid #f44336' : 'none',
          transition: 'border 0.3s ease'
        }}
      >
        <CardMedia
          component={type === 'images' ? 'img' : 'video'}
          height={150}
          src={item.url || item.thumbnail}
          sx={{ 
            objectFit: 'cover',
            backgroundColor: '#f5f5f5',
            transition: 'all 0.3s ease',
            opacity: item.status === 'error' ? 0.6 : 1,
            filter: item.status === 'uploading' ? 'brightness(1.1)' : 'none'
          }}
          onError={(e) => {
            console.log('Image load error for:', item.url);
            e.target.style.backgroundColor = '#e0e0e0';
            e.target.style.display = 'flex';
            e.target.style.alignItems = 'center';
            e.target.style.justifyContent = 'center';
          }}
        />
        
        {/* Upload Status Overlay */}
        {item.status === 'uploading' && (
          <>
            <Box
              position="absolute"
              top={0}
              left={0}
              right={0}
              bottom={0}
              bgcolor="rgba(255,255,255,0.1)"
              sx={{ backdropFilter: 'blur(1px)' }}
            />
            
            <Box
              position="absolute"
              bottom={8}
              right={8}
              display="flex"
              alignItems="center"
              gap={1}
              bgcolor="rgba(0,0,0,0.8)"
              color="white"
              borderRadius={1}
              px={1}
              py={0.5}
            >
              <CircularProgress 
                size={16} 
                thickness={6}
                variant="determinate"
                value={progressValue}
                sx={{ color: '#4caf50' }}
              />
              <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>
                {progressValue}%
              </Typography>
            </Box>

            <Box
              position="absolute"
              top={8}
              left={8}
              bgcolor="rgba(76, 175, 80, 0.9)"
              color="white"
              borderRadius={1}
              px={1}
              py={0.25}
            >
              <Typography variant="caption" sx={{ fontSize: '0.7rem', fontWeight: 600 }}>
                Uploading...
              </Typography>
            </Box>
          </>
        )}

        {item.status === 'completed' && (
          <Box
            position="absolute"
            top={8}
            left={8}
            bgcolor="rgba(76, 175, 80, 0.9)"
            borderRadius="50%"
            p={0.5}
          >
            <CheckCircle sx={{ color: 'white', fontSize: 20 }} />
          </Box>
        )}

        {item.status === 'error' && (
          <Box
            position="absolute"
            top={0}
            left={0}
            right={0}
            bottom={0}
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            bgcolor="rgba(244, 67, 54, 0.9)"
            color="white"
          >
            <ErrorIcon sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="body2" textAlign="center" px={1}>
              Upload failed
            </Typography>
            <Button
              size="small"
              variant="outlined"
              sx={{ 
                mt: 1, 
                color: 'white', 
                borderColor: 'white',
                '&:hover': { 
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  borderColor: 'white'
                }
              }}
              onClick={() => {
                console.log('Retry upload for:', item.id);
              }}
            >
              Retry
            </Button>
          </Box>
        )}

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
      
      {/* Progress bar for uploading files */}
      {item.status === 'uploading' && (
        <LinearProgress 
          variant="determinate" 
          value={progressValue}
          sx={{ height: 4 }}
        />
      )}
    </Card>
  );
});

const EditArticlePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [loadingArticle, setLoadingArticle] = useState(true);
  const [submitError, setSubmitError] = useState('');
  const [article, setArticle] = useState(null);
  const [images, setImages] = useState([]);
  const [videos, setVideos] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [preview, setPreview] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState(new Map()); // Track upload progress

  const {
    control,
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: '',
      excerpt: '',
      content: '',
      category: '',
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
        setSubmitError('You do not have permission to edit this article.');
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
        category: articleData.category || '',
        tags: articleData.tags,
        featured: articleData.featured || false,
      });
    } catch (err) {
      setSubmitError('Failed to load article or article not found.');
      console.error('Error fetching article:', err);
    } finally {
      setLoadingArticle(false);
    }
  }, [id, user.id, user.role, reset]);

  useEffect(() => {
    fetchArticle();
  }, [fetchArticle]);

  // Upload file with progress tracking - matching CreateArticlePage
  const uploadFile = useCallback(async (file, type) => {
    const fileId = Date.now() + Math.random();
    const previewUrl = URL.createObjectURL(file);
    console.log('🖼️ Created local preview URL:', previewUrl, 'for file:', file.name);

    const fileData = {
      id: fileId,
      file,
      url: previewUrl,
      alt: file.name,
      status: 'uploading',
      progress: 0,
      error: null,
    };

    setUploadingFiles(prev => new Map(prev.set(fileId, fileData)));
    
    if (type === 'images') {
      setImages(prev => [...prev, fileData]);
    } else {
      setVideos(prev => [...prev, { ...fileData, thumbnail: fileData.url }]);
    }

    let progressInterval;
    
    try {
      progressInterval = setInterval(() => {
        setUploadingFiles(prev => {
          const updated = new Map(prev);
          const current = updated.get(fileId);
          if (current && current.progress < 90) {
            const newProgress = Math.min(current.progress + 15, 90);
            updated.set(fileId, { ...current, progress: newProgress });
            return updated;
          }
          return prev;
        });
      }, 500);

      // Upload to server
      const response = type === 'images' 
        ? await articleService.uploadImage(file)
        : await articleService.uploadVideo(file);

      clearInterval(progressInterval);

      console.log(`✅ ${type.slice(0, -1)} upload successful:`, response);

      const uploadData = type === 'images' ? response.data.image : response.data.video;
      console.log('🔍 Extracted upload data:', uploadData);
      
      const uploadedFile = {
        id: fileId,
        publicId: uploadData.id,
        url: uploadData.url,
        thumbnailUrl: uploadData.thumbnail || uploadData.sizes?.thumbnail || uploadData.url,
        alt: file.name,
        status: 'completed',
        progress: 100,
        error: null,
        sizes: uploadData.sizes || {},
      };

      if (type === 'images') {
        setImages(prev => prev.map(img => 
          img.id === fileId ? uploadedFile : img
        ));
      } else {
        setVideos(prev => prev.map(vid => 
          vid.id === fileId ? { ...uploadedFile, thumbnail: uploadedFile.thumbnailUrl } : vid
        ));
      }

      setUploadingFiles(prev => {
        const updated = new Map(prev);
        updated.delete(fileId);
        return updated;
      });

    } catch (error) {
      console.error(`❌ ${type.slice(0, -1)} upload failed:`, error);

      if (progressInterval) {
        clearInterval(progressInterval);
      }

      const errorFile = {
        id: fileId,
        file,
        url: URL.createObjectURL(file),
        alt: file.name,
        status: 'error',
        progress: 0,
        error: error.message || 'Upload failed',
      };

      if (type === 'images') {
        setImages(prev => prev.map(img => 
          img.id === fileId ? errorFile : img
        ));
      } else {
        setVideos(prev => prev.map(vid => 
          vid.id === fileId ? { ...errorFile, thumbnail: errorFile.url } : vid
        ));
      }

      setUploadingFiles(prev => {
        const updated = new Map(prev);
        updated.delete(fileId);
        return updated;
      });
    }
  }, []);

  // Image dropzone - matching CreateArticlePage
  const imageDropzone = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxFiles: 10,
    maxSize: 5 * 1024 * 1024, // 5MB
    onDrop: useCallback((acceptedFiles, fileRejections, event) => {
      try {
        if (fileRejections.length > 0) {
          const errors = fileRejections.map(rejection => 
            `${rejection.file.name}: ${rejection.errors.map(e => e.message).join(', ')}`
          );
          setSubmitError(`Image upload errors: ${errors.join('; ')}`);
        }
        
        acceptedFiles.forEach(file => {
          uploadFile(file, 'images');
        });
      } catch (error) {
        console.error('❌ Error in onDrop handler:', error);
      }
    }, [uploadFile]),
    onDropRejected: (fileRejections, event) => {
      try {
        console.log('❌ IMAGE DROPZONE - onDropRejected triggered:', fileRejections);
        const errors = fileRejections.map(rejection => 
          `${rejection.file.name}: ${rejection.errors.map(e => e.message).join(', ')}`
        );
        setSubmitError(`Image upload errors: ${errors.join('; ')}`);
      } catch (error) {
        console.error('❌ Error in onDropRejected handler:', error);
      }
    },
  });

  // Video dropzone - matching CreateArticlePage
  const videoDropzone = useDropzone({
    accept: {
      'video/*': ['.mp4', '.mov', '.avi', '.mkv', '.webm']
    },
    maxFiles: 5,
    maxSize: 100 * 1024 * 1024, // 100MB to match backend
    onDrop: useCallback((acceptedFiles, fileRejections) => {
      console.log('🎥 Video files dropped:', acceptedFiles.length);
      console.log('🎥 Video files rejected:', fileRejections.length);
      
      if (fileRejections.length > 0) {
        const rejectedErrors = fileRejections.map(rejection => {
          console.log('❌ Rejection details:', {
            file: rejection.file.name,
            size: rejection.file.size,
            type: rejection.file.type,
            errors: rejection.errors.map(e => ({ code: e.code, message: e.message }))
          });
          return `${rejection.file.name}: ${rejection.errors.map(e => e.message).join(', ')}`;
        });
        setSubmitError(`Video upload errors: ${rejectedErrors.join('; ')}`);
        console.error('❌ Video rejection errors:', rejectedErrors);
      }
      
      acceptedFiles.forEach(file => {
        console.log('🚀 Processing video file:', {
          name: file.name,
          type: file.type,
          size: file.size,
          sizeInMB: (file.size / (1024 * 1024)).toFixed(2) + 'MB'
        });
        uploadFile(file, 'videos');
      });
    }, [uploadFile]),
    onDropRejected: (fileRejections) => {
      console.log('❌ Video files rejected:', fileRejections);
      const rejectedErrors = fileRejections.map(rejection => {
        console.log('❌ Rejection details:', {
          file: rejection.file.name,
          size: rejection.file.size,
          type: rejection.file.type,
          errors: rejection.errors.map(e => ({ code: e.code, message: e.message }))
        });
        return `${rejection.file.name}: ${rejection.errors.map(e => e.message).join(', ')}`;
      });
      setSubmitError(`Video upload errors: ${rejectedErrors.join('; ')}`);
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

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      setSubmitError('');

      // Check if there are any uploads in progress
      if (uploadingFiles.size > 0) {
        setSubmitError('Please wait for all file uploads to complete before saving.');
        return;
      }

      // Check for any failed uploads
      const failedImages = images.filter(img => img.status === 'error');
      const failedVideos = videos.filter(vid => vid.status === 'error');
      if (failedImages.length > 0 || failedVideos.length > 0) {
        setSubmitError('Please retry failed uploads or remove failed files before saving.');
        return;
      }

      // Process images for backend
      const processedImages = images
        .filter(img => img.status === 'completed' || !img.status) // Include existing images without status
        .map(({ file, status, progress, error, ...img }) => {
          console.log('🔍 Processing image:', img);
          return {
            id: img.publicId || img.id,
            url: img.url,
            alt: img.alt || '',
            sizes: img.sizes || {}
          };
        });

      // Process videos for backend  
      const processedVideos = videos
        .filter(vid => vid.status === 'completed' || !vid.status) // Include existing videos without status
        .map(({ file, status, progress, error, ...vid }) => {
          console.log('🔍 Processing video:', vid);
          return {
            id: vid.publicId || vid.id,
            url: vid.url,
            thumbnail: vid.thumbnailUrl || vid.thumbnail || vid.url
          };
        });

      const articleData = {
        ...data,
        images: processedImages,
        videos: processedVideos,
      };

      console.log('💾 Updating article with processed data:', articleData);
      
      await articleService.updateArticle(id, articleData);
      
      console.log('✅ Article updated successfully');
      navigate('/dashboard');
    } catch (err) {
      setSubmitError('Failed to save article. Please try again.');
      console.error('Error updating article:', err);
    } finally {
      setLoading(false);
    }
  };

  const MediaUploadZone = ({ title, items, onRemove, type, dropzone }) => {
    const { getRootProps, getInputProps } = dropzone;
    const fileInputRef = React.useRef(null);

    const handleButtonClick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      console.log('🎯 BUTTON CLICKED for:', type);
      
      try {
        if (fileInputRef.current) {
          console.log('📂 Using fileInputRef.current.click() (preferred method)');
          fileInputRef.current.click();
          console.log('✅ fileInputRef.current.click() called successfully');
        } else if (dropzone.open) {
          console.log('📂 Using dropzone.open() (fallback method)');
          dropzone.open();
          console.log('✅ dropzone.open() called successfully');
        } else {
          console.log('❌ Neither fileInputRef.current nor dropzone.open available!');
        }
      } catch (error) {
        console.error('❌ Error opening file dialog:', error);
      }
    };

    const handleFileInputChange = (e) => {
      console.log('📁 FILE INPUT CHANGE triggered for:', type);
      
      const files = Array.from(e.target.files || []);
      console.log('📁 Files selected via hidden input:', files.length);
      
      files.forEach(file => {
        console.log('🚀 Processing file from input:', file.name, file.type, file.size);
        uploadFile(file, type);
      });
      e.target.value = '';
      console.log('✅ File input value cleared');
    };

    return (
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">
            {title}
          </Typography>
          <Button
            variant="contained"
            size="small"
            startIcon={<CloudUpload />}
            onClick={handleButtonClick}
            sx={{
              backgroundColor: '#2e7d32',
              '&:hover': { backgroundColor: '#1b5e20' }
            }}
          >
            Select Files
          </Button>
        </Box>

        {/* Hidden file input as backup */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={type === 'images' ? 'image/*' : 'video/*'}
          onChange={handleFileInputChange}
          style={{ display: 'none' }}
        />
        
        <Box
          {...getRootProps()}
          onClick={(e) => {
            console.log('🎯 DROPZONE AREA CLICKED for:', type);
            e.preventDefault();
          }}
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
            overflow: 'hidden',
            scrollBehavior: 'auto',
            '&:hover': {
              borderColor: 'primary.main',
              backgroundColor: 'action.hover',
            },
            '&:focus-within': {
              scrollMargin: 0,
            }
          }}
        >
          <input 
            {...getInputProps()} 
            onChange={(e) => {
              console.log('🎯 DROPZONE INPUT CHANGE for:', type);
              console.log('📁 Input files:', e.target.files);
            }}
          />
          <CloudUpload sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
          <Typography variant="body1" gutterBottom>
            {dropzone.isDragActive 
              ? `Drop ${type} here...` 
              : `Drag & drop ${type}, or use the button above`
            }
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {type === 'images' 
              ? 'Supported: JPG, PNG, WebP (max 5MB each)' 
              : 'Supported: MP4, MOV, AVI (max 100MB each)'
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
                  uploadingFiles={uploadingFiles}
                />
              </Grid>
            ))}
          </Grid>
        )}
      </Paper>
    );
  };

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
        </Box>
      )}

      <Box 
        sx={{ 
          lineHeight: 1.8, 
          fontSize: '1rem',
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
        dangerouslySetInnerHTML={{ __html: watchedValues.content || '<p style="color: #999; font-style: italic;">No content yet...</p>' }}
      />
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

  if (submitError && !article) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 4 }}>
          {submitError}
        </Alert>
        <Button variant="contained" onClick={() => navigate('/dashboard')}>
          Back to Dashboard
        </Button>
      </Container>
    );
  }

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
            Edit Article
          </Typography>
          {article && (
            <Chip 
              label={article.published ? 'Published' : 'Draft'}
              color={article.published ? 'success' : 'warning'}
            />
          )}
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
        <form onSubmit={handleSubmit((data) => onSubmit(data))}>
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
                title="Upload Images"
                items={images}
                onRemove={handleRemoveImage}
                type="images"
                dropzone={imageDropzone}
              />

              <MediaUploadZone
                title="Upload Videos"
                items={videos}
                onRemove={handleRemoveVideo}
                type="videos"
                dropzone={videoDropzone}
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
                  defaultValue=""
                  sx={{ mb: 3 }}
                >
                  <MenuItem value="">
                    <em>Select a category</em>
                  </MenuItem>
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
                    {loading ? 'Saving...' : 'Save Changes'}
                  </Button>
                  
                  {!article?.published && (
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
                      {loading ? <CircularProgress size={20} /> : 'Save & Publish'}
                    </Button>
                  )}
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
  
  export default EditArticlePage; 