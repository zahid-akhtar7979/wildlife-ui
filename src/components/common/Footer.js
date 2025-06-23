import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Link,
  IconButton,
  Divider,
} from '@mui/material';
import {
  Email,
  Facebook,
  Twitter,
  Instagram,
  LinkedIn,
} from '@mui/icons-material';

const Footer = () => {
  return (
    <Box
      sx={{
        background: 'linear-gradient(to right, #14532d 0%, #0f2419 100%)',
        color: 'white',
        mt: 8,
        pt: 6,
        pb: 4,
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Company Info */}
          <Grid item xs={12} md={4}>
            <Box display="flex" alignItems="center" mb={2}>
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mr: 1
                }}
              >
                <Box
                  sx={{
                    width: 0,
                    height: 0,
                    borderLeft: '6px solid transparent',
                    borderRight: '6px solid transparent',
                    borderBottom: '10px solid white',
                  }}
                />
              </Box>
              <Typography 
                variant="h6" 
                component="div" 
                sx={{ 
                  fontWeight: 600, 
                  color: 'white',
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                Wildlife Geography
              </Typography>
            </Box>
            <Typography 
              variant="body2" 
              sx={{ 
                mb: 2, 
                lineHeight: 1.6, 
                color: 'rgba(255, 255, 255, 0.9)',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              Dedicated to protecting our planet's wildlife through research, education, and awareness. Join us in our mission to preserve endangered species and their habitats for future generations.
            </Typography>
            <Box display="flex" alignItems="center">
              <Email sx={{ mr: 1, fontSize: 18, color: 'white' }} />
              <Typography 
                variant="body2"
                sx={{ 
                  color: 'rgba(255, 255, 255, 0.9)',
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                contact@wildlife-geography.org
              </Typography>
            </Box>
          </Grid>

          {/* Explore Links */}
          <Grid item xs={12} sm={6} md={2}>
            <Typography 
              variant="h6" 
              gutterBottom 
              sx={{ 
                fontWeight: 600, 
                mb: 2, 
                color: 'white',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              Explore
            </Typography>
            <Box display="flex" flexDirection="column" gap={1}>
              <Link 
                href="/" 
                underline="hover"
                sx={{ 
                  fontSize: '0.9rem',
                  color: 'rgba(255, 255, 255, 0.85)',
                  fontFamily: 'Inter, sans-serif',
                  '&:hover': { color: 'white' }
                }}
              >
                Latest Articles
              </Link>
              <Link 
                href="/species" 
                underline="hover"
                sx={{ 
                  fontSize: '0.9rem',
                  color: 'rgba(255, 255, 255, 0.85)',
                  fontFamily: 'Inter, sans-serif',
                  '&:hover': { color: 'white' }
                }}
              >
                Species Directory
              </Link>
              <Link 
                href="/conservation" 
                underline="hover"
                sx={{ 
                  fontSize: '0.9rem',
                  color: 'rgba(255, 255, 255, 0.85)',
                  fontFamily: 'Inter, sans-serif',
                  '&:hover': { color: 'white' }
                }}
              >
                Conservation Projects
              </Link>
              <Link 
                href="/research" 
                underline="hover"
                sx={{ 
                  fontSize: '0.9rem',
                  color: 'rgba(255, 255, 255, 0.85)',
                  fontFamily: 'Inter, sans-serif',
                  '&:hover': { color: 'white' }
                }}
              >
                Research Publications
              </Link>
            </Box>
          </Grid>

          {/* Get Involved Links */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography 
              variant="h6" 
              gutterBottom 
              sx={{ 
                fontWeight: 600, 
                mb: 2, 
                color: 'white',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              Get Involved
            </Typography>
            <Box display="flex" flexDirection="column" gap={1}>
              <Link 
                href="/contribute" 
                underline="hover"
                sx={{ 
                  fontSize: '0.9rem',
                  color: 'rgba(255, 255, 255, 0.85)',
                  fontFamily: 'Inter, sans-serif',
                  '&:hover': { color: 'white' }
                }}
              >
                Become a Contributor
              </Link>
              <Link 
                href="/support" 
                underline="hover"
                sx={{ 
                  fontSize: '0.9rem',
                  color: 'rgba(255, 255, 255, 0.85)',
                  fontFamily: 'Inter, sans-serif',
                  '&:hover': { color: 'white' }
                }}
              >
                Support Our Work
              </Link>
              <Link 
                href="/volunteer" 
                underline="hover"
                sx={{ 
                  fontSize: '0.9rem',
                  color: 'rgba(255, 255, 255, 0.85)',
                  fontFamily: 'Inter, sans-serif',
                  '&:hover': { color: 'white' }
                }}
              >
                Volunteer Opportunities
              </Link>
              <Link 
                href="/educational" 
                underline="hover"
                sx={{ 
                  fontSize: '0.9rem',
                  color: 'rgba(255, 255, 255, 0.85)',
                  fontFamily: 'Inter, sans-serif',
                  '&:hover': { color: 'white' }
                }}
              >
                Educational Resources
              </Link>
            </Box>
          </Grid>

          {/* Legal Links */}
          <Grid item xs={12} md={3}>
            <Typography 
              variant="h6" 
              gutterBottom 
              sx={{ 
                fontWeight: 600, 
                mb: 2, 
                color: 'white',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              Legal
            </Typography>
            <Box display="flex" flexDirection="column" gap={1}>
              <Link 
                href="/privacy" 
                underline="hover"
                sx={{ 
                  fontSize: '0.9rem',
                  color: 'rgba(255, 255, 255, 0.85)',
                  fontFamily: 'Inter, sans-serif',
                  '&:hover': { color: 'white' }
                }}
              >
                Privacy Policy
              </Link>
              <Link 
                href="/terms" 
                underline="hover"
                sx={{ 
                  fontSize: '0.9rem',
                  color: 'rgba(255, 255, 255, 0.85)',
                  fontFamily: 'Inter, sans-serif',
                  '&:hover': { color: 'white' }
                }}
              >
                Terms of Use
              </Link>
              <Link 
                href="/contact" 
                underline="hover"
                sx={{ 
                  fontSize: '0.9rem',
                  color: 'rgba(255, 255, 255, 0.85)',
                  fontFamily: 'Inter, sans-serif',
                  '&:hover': { color: 'white' }
                }}
              >
                Contact Us
              </Link>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4, borderColor: 'rgba(255,255,255,0.2)' }} />

        {/* Bottom Section */}
        <Box 
          display="flex" 
          justifyContent="space-between" 
          alignItems="center"
          flexDirection={{ xs: 'column', md: 'row' }}
          gap={2}
        >
          <Typography 
            variant="body2" 
            sx={{ 
              color: 'rgba(255,255,255,0.8)',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            © 2024 Wildlife Geography. All rights reserved.
          </Typography>
          
          <Box display="flex" gap={1}>
            <IconButton 
              size="small" 
              sx={{ color: 'rgba(255,255,255,0.7)', '&:hover': { color: 'white' } }}
            >
              <Facebook />
            </IconButton>
            <IconButton 
              size="small" 
              sx={{ color: 'rgba(255,255,255,0.7)', '&:hover': { color: 'white' } }}
            >
              <Twitter />
            </IconButton>
            <IconButton 
              size="small" 
              sx={{ color: 'rgba(255,255,255,0.7)', '&:hover': { color: 'white' } }}
            >
              <Instagram />
            </IconButton>
            <IconButton 
              size="small" 
              sx={{ color: 'rgba(255,255,255,0.7)', '&:hover': { color: 'white' } }}
            >
              <LinkedIn />
            </IconButton>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer; 