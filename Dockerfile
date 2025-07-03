# Multi-stage build for React application
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files for dependency caching
COPY package*.json ./

# Install dependencies
RUN npm ci --silent

# Copy source code
COPY . .

# Build the React application
RUN npm run build

# Production stage - serve with nginx
FROM nginx:alpine

# Copy built React app from builder stage
COPY --from=builder /app/build /usr/share/nginx/html

# Copy nginx configurations
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY nginx.main.conf /etc/nginx/nginx.conf

# Expose port (Railway will set PORT env variable)
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"] 