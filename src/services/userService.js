import api from './authService';

export const userService = {
  // Get user profile
  getProfile: async () => {
    try {
      const response = await api.get('/users/me');
      return response.data;
    } catch (error) {
      console.error('Failed to get user profile:', error);
      throw error;
    }
  },

  // Update user profile
  updateProfile: async (profileData) => {
    try {
      const response = await api.put('/users/me', profileData);
      
      // Update local storage with new user data
      if (response.data?.success) {
        const userData = response.data.user;
        localStorage.setItem('userData', JSON.stringify(userData));
      }
      
      return response.data;
    } catch (error) {
      console.error('Failed to update profile:', error);
      throw error;
    }
  },

  // Upload profile picture
  uploadProfilePicture: async (file, userName) => {
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('caption', `Profile picture for ${userName}`);
      formData.append('alt', `${userName}'s profile picture`);

      const response = await api.post('/upload/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error) {
      console.error('Failed to upload profile picture:', error);
      throw error;
    }
  },

  // Get user by ID
  getUserById: async (userId) => {
    try {
      const response = await api.get(`/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get user:', error);
      throw error;
    }
  },

  // Search users
  searchUsers: async (searchTerm, page = 0, size = 10) => {
    try {
      const response = await api.get('/users/search', {
        params: {
          q: searchTerm,
          page,
          size
        }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to search users:', error);
      throw error;
    }
  }
}; 