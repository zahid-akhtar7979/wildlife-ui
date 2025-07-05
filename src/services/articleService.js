import api from './authService';

export const articleService = {
  // Get all published articles
  getArticles: async (filters = {}) => {
    try {
      // If category is specified, use the category-specific endpoint
      if (filters.category) {
        const params = {
          page: filters.page || 1,
          size: filters.limit || 10
        };
        const response = await api.get(`/articles/category/${filters.category}`, { params });
        return response.data;
      }

      // If search is specified, use the search endpoint
      if (filters.search) {
        const params = {
          q: filters.search,
          page: filters.page || 1,
          size: filters.limit || 10
        };
        const response = await api.get('/articles/search', { params });
        return response.data;
      }

      // Otherwise, use the main articles endpoint
      const params = {};
      
      if (filters.tags && filters.tags.length > 0) params.tags = filters.tags.join(',');
      if (filters.featured !== undefined) params.featured = filters.featured;
      if (filters.page) params.page = filters.page;
      if (filters.limit) params.limit = filters.limit;
      
      const response = await api.get('/articles', { params });
      return response.data;
    } catch (error) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw error;
    }
  },

  // Get featured articles
  getFeaturedArticles: async () => {
    try {
      const response = await api.get('/articles/featured');
      return response.data;
    } catch (error) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw error;
    }
  },

  // Get article by ID
  getArticleById: async (id) => {
    try {
      const response = await api.get(`/articles/${id}`);
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        throw new Error('You need to be logged in to access this draft article.');
      }
      if (error.response?.status === 403) {
        throw new Error('You can only access your own draft articles.');
      }
      if (error.response?.status === 404) {
        throw new Error('Article not found. It may have been deleted.');
      }
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw error;
    }
  },

  // Get articles by author (for contributor dashboard)
  getArticlesByAuthor: async (authorId, filters = {}) => {
    try {
      const params = {
        page: filters.page || 1,
        limit: filters.limit || 10
      };
      
      const response = await api.get(`/articles/author/${authorId}`, { params });
      return response.data;
    } catch (error) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw error;
    }
  },

  // Create new article
  createArticle: async (articleData) => {
    try {
      const response = await api.post('/articles', articleData);
      return response.data;
    } catch (error) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw error;
    }
  },

  // Update article
  updateArticle: async (id, articleData) => {
    try {
      const response = await api.put(`/articles/${id}`, articleData);
      return response.data;
    } catch (error) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw error;
    }
  },

  // Delete article
  deleteArticle: async (id) => {
    try {
      console.log('🔥 ArticleService.deleteArticle called with ID:', id);
      const response = await api.delete(`/articles/${id}`);
      return response.data;
    } catch (error) {
      console.error('🔥 Error in deleteArticle service:', error);
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw error;
    }
  },

  // Publish article
  publishArticle: async (id, published = true) => {
    try {
      const response = await api.patch(`/articles/${id}/publish`, { published });
      return response.data;
    } catch (error) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw error;
    }
  },

  // Upload image
  uploadImage: async (file) => {
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await api.post('/upload/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (error) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw error;
    }
  },

  // Upload video
  uploadVideo: async (file) => {
    try {
      const formData = new FormData();
      formData.append('video', file);
      
      const response = await api.post('/upload/video', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (error) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw error;
    }
  },

  // Upload media (backward compatibility)
  uploadMedia: async (file) => {
    if (file.type.startsWith('image/')) {
      return await articleService.uploadImage(file);
    } else if (file.type.startsWith('video/')) {
      return await articleService.uploadVideo(file);
    } else {
      throw new Error('Unsupported file type');
    }
  },

  // Delete image from Cloudinary
  deleteImage: async (publicId) => {
    try {
      const response = await api.delete(`/upload/delete/${publicId}?resourceType=image`);
      return response.data;
    } catch (error) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw error;
    }
  },

  // Delete video from Cloudinary
  deleteVideo: async (publicId) => {
    try {
      const response = await api.delete(`/upload/delete/${publicId}?resourceType=video`);
      return response.data;
    } catch (error) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw error;
    }
  },

  // Delete media file (backward compatibility)
  deleteMedia: async (publicId, type) => {
    try {
      if (type === 'image' || type === 'images') {
        return await articleService.deleteImage(publicId);
      } else if (type === 'video' || type === 'videos') {
        return await articleService.deleteVideo(publicId);
      } else {
        throw new Error('Unsupported media type');
      }
    } catch (error) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw error;
    }
  },

  // Get all tags
  getTags: async () => {
    try {
      const response = await api.get('/articles/tags');
      return response.data;
    } catch (error) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw error;
    }
  },

  // Get all categories
  getCategories: async () => {
    try {
      const response = await api.get('/articles/categories');
      return response.data;
    } catch (error) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw error;
    }
  },
}; 