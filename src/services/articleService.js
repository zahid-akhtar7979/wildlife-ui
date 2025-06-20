import api from './authService';

// Mock data for development
const mockArticles = [
  {
    id: 1,
    title: 'The Majestic Tigers of Sundarbans',
    content: `The Sundarbans, the largest mangrove forest in the world, is home to the magnificent Royal Bengal Tiger. These incredible creatures have adapted to life in the wetlands, becoming excellent swimmers and fierce hunters.

Recent conservation efforts have shown promising results, with tiger populations slowly recovering from near extinction. The unique ecosystem of the Sundarbans provides the perfect habitat for these endangered cats.

Our research team has been studying tiger behavior patterns for over five years, documenting their hunting techniques, territorial marking, and social interactions. The data collected has been crucial in developing better conservation strategies.`,
    excerpt: 'Exploring the magnificent Royal Bengal Tigers in the Sundarbans mangrove forests and recent conservation efforts.',
    author: {
      id: 2,
      name: 'Dr. Sarah Williams',
      email: 'researcher@wildlife.com',
    },
    publishDate: '2024-01-15T10:30:00Z',
    tags: ['Tigers', 'Conservation', 'Sundarbans', 'Endangered Species'],
    images: [
      {
        id: 1,
        url: 'https://images.unsplash.com/photo-1605792657660-596af9009e82?w=800',
        caption: 'A Royal Bengal Tiger in its natural habitat',
        alt: 'Royal Bengal Tiger',
      },
      {
        id: 2,
        url: 'https://images.unsplash.com/photo-1544985361-b420d7a77043?w=800',
        caption: 'Mangrove forests of Sundarbans',
        alt: 'Sundarbans mangrove forest',
      },
    ],
    videos: [
      {
        id: 1,
        url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
        caption: 'Tiger swimming through mangrove channels',
        thumbnail: 'https://images.unsplash.com/photo-1605792657660-596af9009e82?w=400',
      },
    ],
    published: true,
    featured: true,
  },
  {
    id: 2,
    title: 'Amazon Rainforest: A Biodiversity Hotspot Under Threat',
    content: `The Amazon rainforest, often called the "lungs of the Earth," is home to an incredible array of wildlife species. From colorful macaws to elusive jaguars, this ecosystem supports millions of species, many of which remain undiscovered.

Climate change and deforestation pose significant threats to this irreplaceable ecosystem. Our recent expedition documented several species that are rapidly losing their habitats due to human activities.

Conservation efforts must be intensified to protect not only the wildlife but also the indigenous communities that have called this forest home for centuries.`,
    excerpt: 'Documenting the incredible biodiversity of the Amazon rainforest and the urgent need for conservation.',
    author: {
      id: 2,
      name: 'Dr. Sarah Williams',
      email: 'researcher@wildlife.com',
    },
    publishDate: '2024-01-20T14:15:00Z',
    tags: ['Amazon', 'Rainforest', 'Biodiversity', 'Conservation', 'Climate Change'],
    images: [
      {
        id: 3,
        url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800',
        caption: 'Aerial view of the Amazon rainforest',
        alt: 'Amazon rainforest canopy',
      },
      {
        id: 4,
        url: 'https://images.unsplash.com/photo-1507666405895-b295bf6ee7bb?w=800',
        caption: 'Colorful macaw in the Amazon',
        alt: 'Macaw bird',
      },
    ],
    videos: [],
    published: true,
    featured: false,
  },
  {
    id: 3,
    title: 'Arctic Wildlife: Adapting to a Changing Climate',
    content: `The Arctic region is experiencing rapid environmental changes, with temperatures rising twice as fast as the global average. This dramatic shift is forcing Arctic wildlife to adapt quickly or face extinction.

Polar bears, Arctic foxes, and seals are among the species most affected by melting sea ice. Our research team has been tracking these animals using satellite collars and GPS technology to understand their changing migration patterns.

The data we've collected reveals alarming trends that require immediate conservation action. International cooperation is essential to protect these magnificent creatures and their fragile ecosystem.`,
    excerpt: 'Studying how Arctic wildlife is adapting to rapid climate change and melting ice.',
    author: {
      id: 2,
      name: 'Dr. Sarah Williams',
      email: 'researcher@wildlife.com',
    },
    publishDate: '2024-01-10T09:00:00Z',
    tags: ['Arctic', 'Climate Change', 'Polar Bears', 'Conservation', 'Wildlife Tracking'],
    images: [
      {
        id: 5,
        url: 'https://images.unsplash.com/photo-1551582045-6ec9c11d8697?w=800',
        caption: 'Polar bear on melting ice',
        alt: 'Polar bear on ice',
      },
    ],
    videos: [],
    published: true,
    featured: true,
  },
];

export const articleService = {
  // Get all published articles
  getArticles: async (filters = {}) => {
    try {
      // Mock API call - replace with actual API
      let filteredArticles = mockArticles.filter(article => article.published);
      
      // Apply filters
      if (filters.tags && filters.tags.length > 0) {
        filteredArticles = filteredArticles.filter(article =>
          article.tags.some(tag => 
            filters.tags.some(filterTag => 
              tag.toLowerCase().includes(filterTag.toLowerCase())
            )
          )
        );
      }
      
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        filteredArticles = filteredArticles.filter(article =>
          article.title.toLowerCase().includes(searchTerm) ||
          article.content.toLowerCase().includes(searchTerm) ||
          article.excerpt.toLowerCase().includes(searchTerm)
        );
      }
      
      // Sort by publish date (newest first)
      filteredArticles.sort((a, b) => new Date(b.publishDate) - new Date(a.publishDate));
      
      return {
        data: {
          articles: filteredArticles,
          total: filteredArticles.length,
        },
      };
      
      // Actual API call would be:
      // return await api.get('/articles', { params: filters });
    } catch (error) {
      throw error;
    }
  },

  // Get featured articles
  getFeaturedArticles: async () => {
    try {
      const featuredArticles = mockArticles.filter(article => 
        article.published && article.featured
      );
      
      return {
        data: {
          articles: featuredArticles,
        },
      };
      
      // Actual API call would be:
      // return await api.get('/articles/featured');
    } catch (error) {
      throw error;
    }
  },

  // Get article by ID
  getArticleById: async (id) => {
    try {
      const article = mockArticles.find(article => 
        article.id === parseInt(id) && article.published
      );
      
      if (!article) {
        throw new Error('Article not found');
      }
      
      return {
        data: { article },
      };
      
      // Actual API call would be:
      // return await api.get(`/articles/${id}`);
    } catch (error) {
      throw error;
    }
  },

  // Get articles by author (for contributor dashboard)
  getArticlesByAuthor: async (authorId) => {
    try {
      const authorArticles = mockArticles.filter(article => 
        article.author.id === authorId
      );
      
      return {
        data: {
          articles: authorArticles,
        },
      };
      
      // Actual API call would be:
      // return await api.get(`/articles/author/${authorId}`);
    } catch (error) {
      throw error;
    }
  },

  // Create new article
  createArticle: async (articleData) => {
    try {
      const newArticle = {
        id: Date.now(),
        ...articleData,
        publishDate: new Date().toISOString(),
        published: false, // Starts as draft
      };
      
      // Mock creation - replace with actual API
      mockArticles.push(newArticle);
      
      return {
        data: { article: newArticle },
      };
      
      // Actual API call would be:
      // return await api.post('/articles', articleData);
    } catch (error) {
      throw error;
    }
  },

  // Update article
  updateArticle: async (id, articleData) => {
    try {
      const articleIndex = mockArticles.findIndex(article => 
        article.id === parseInt(id)
      );
      
      if (articleIndex === -1) {
        throw new Error('Article not found');
      }
      
      mockArticles[articleIndex] = {
        ...mockArticles[articleIndex],
        ...articleData,
      };
      
      return {
        data: { article: mockArticles[articleIndex] },
      };
      
      // Actual API call would be:
      // return await api.put(`/articles/${id}`, articleData);
    } catch (error) {
      throw error;
    }
  },

  // Delete article
  deleteArticle: async (id) => {
    try {
      const articleIndex = mockArticles.findIndex(article => 
        article.id === parseInt(id)
      );
      
      if (articleIndex === -1) {
        throw new Error('Article not found');
      }
      
      mockArticles.splice(articleIndex, 1);
      
      return {
        data: { message: 'Article deleted successfully' },
      };
      
      // Actual API call would be:
      // return await api.delete(`/articles/${id}`);
    } catch (error) {
      throw error;
    }
  },

  // Publish article
  publishArticle: async (id) => {
    try {
      const articleIndex = mockArticles.findIndex(article => 
        article.id === parseInt(id)
      );
      
      if (articleIndex === -1) {
        throw new Error('Article not found');
      }
      
      mockArticles[articleIndex].published = true;
      mockArticles[articleIndex].publishDate = new Date().toISOString();
      
      return {
        data: { article: mockArticles[articleIndex] },
      };
      
      // Actual API call would be:
      // return await api.patch(`/articles/${id}/publish`);
    } catch (error) {
      throw error;
    }
  },

  // Upload media
  uploadMedia: async (file) => {
    try {
      // Mock file upload - replace with actual file upload service
      const mockUrl = URL.createObjectURL(file);
      
      return {
        data: {
          url: mockUrl,
          filename: file.name,
          size: file.size,
          type: file.type,
        },
      };
      
      // Actual API call would be:
      // const formData = new FormData();
      // formData.append('file', file);
      // return await api.post('/media/upload', formData, {
      //   headers: { 'Content-Type': 'multipart/form-data' },
      // });
    } catch (error) {
      throw error;
    }
  },

  // Get all tags
  getTags: async () => {
    try {
      const allTags = [...new Set(mockArticles.flatMap(article => article.tags))];
      
      return {
        data: { tags: allTags },
      };
      
      // Actual API call would be:
      // return await api.get('/articles/tags');
    } catch (error) {
      throw error;
    }
  },
}; 