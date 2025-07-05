import React, { useState, useCallback } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  TextField,
  Avatar,
  CircularProgress,
  Alert,
  IconButton,
} from '@mui/material';
import { Edit, PhotoCamera } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { userService } from '../services/userService';

const ProfilePage = () => {
  const { user, setUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    bio: user?.bio || '',
    profilePictureUrl: user?.profilePictureUrl || ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setLoading(true);
      setError('');

      const response = await userService.uploadProfilePicture(file, user.name);
      
      if (response.success && response.data?.image?.url) {
        setFormData(prev => ({
          ...prev,
          profilePictureUrl: response.data.image.url
        }));
      } else {
        throw new Error(response.message || 'Failed to upload image');
      }
    } catch (err) {
      setError(err.message || 'Failed to upload image. Please try again.');
      console.error('Error uploading image:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await userService.updateProfile(formData);
      if (response.success) {
        setUser(response.data.user);
        setSuccess('Profile updated successfully!');
        setIsEditing(false);
      }
    } catch (err) {
      setError(err.message || 'Failed to update profile. Please try again.');
      console.error('Error updating profile:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={2} sx={{ p: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Typography variant="h4" component="h1" fontWeight="bold">
            Profile Settings
          </Typography>
          <Button
            variant="outlined"
            startIcon={<Edit />}
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </Button>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}

        <form onSubmit={handleSubmit}>
          <Box display="flex" flexDirection="column" alignItems="center" mb={4}>
            <Box position="relative">
              <Avatar
                src={formData.profilePictureUrl}
                alt={formData.name}
                sx={{
                  width: 120,
                  height: 120,
                  mb: 2,
                  fontSize: '3rem'
                }}
              >
                {formData.name?.charAt(0)}
              </Avatar>
              {isEditing && (
                <IconButton
                  component="label"
                  sx={{
                    position: 'absolute',
                    bottom: 16,
                    right: -8,
                    backgroundColor: 'primary.main',
                    '&:hover': { backgroundColor: 'primary.dark' }
                  }}
                >
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                  <PhotoCamera sx={{ color: 'white' }} />
                </IconButton>
              )}
            </Box>
          </Box>

          <Box display="flex" flexDirection="column" gap={3}>
            <TextField
              label="Name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              disabled={!isEditing}
              fullWidth
            />

            <TextField
              label="Email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              disabled={!isEditing}
              fullWidth
              type="email"
            />

            <TextField
              label="Bio"
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
              disabled={!isEditing}
              fullWidth
              multiline
              rows={4}
              helperText="Tell us about yourself and your work in wildlife conservation"
            />

            {isEditing && (
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={loading}
                sx={{ mt: 2 }}
              >
                {loading ? <CircularProgress size={24} /> : 'Save Changes'}
              </Button>
            )}
          </Box>
        </form>
      </Paper>
    </Container>
  );
};

export default ProfilePage; 