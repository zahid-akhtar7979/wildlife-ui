import api from './authService';

export const articleService = {
  // Get all published articles
  getArticles: async (filters = {}) => {
    try {
      const params = {};
      
      if (filters.search) params.search = filters.search;
      if (filters.tags && filters.tags.length > 0) params.tags = filters.tags.join(',');
      if (filters.category) params.category = filters.category;
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
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw error;
    }
  },

  // Get articles by author (for contributor dashboard)
  getArticlesByAuthor: async (authorId) => {
    try {
      const response = await api.get(`/articles/author/${authorId}`);
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
      const response = await api.delete(`/articles/${id}`);
      return response.data;
    } catch (error) {
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