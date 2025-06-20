# Wildlife Chronicles - Article Publishing Platform

A comprehensive React-based article publishing platform designed for wildlife geographers and researchers to share their conservation work and research findings with the public.

## 🌿 Project Overview

Wildlife Chronicles is a specialized content management system that enables wildlife researchers to publish rich, media-enhanced articles about endangered species, conservation efforts, and wildlife research. The platform features role-based authentication, rich text editing, media management, and administrative oversight.

## ✨ Key Features

### Public Features
- **Homepage**: Browse and search published articles with beautiful card layouts
- **Article Detail Pages**: Rich article viewing with embedded images, videos, and social sharing
- **Search & Filter**: Search articles by keywords and filter by tags/categories
- **Responsive Design**: Optimized for both desktop and mobile devices
- **Nature-themed UI**: Beautiful forest green color scheme reflecting the wildlife mission

### Contributor Features
- **Secure Authentication**: Role-based login system for approved contributors
- **Dashboard**: Personal dashboard to manage articles and view statistics
- **Rich Article Editor**: Create and edit articles with:
  - Markdown-style text editing
  - Drag & drop image upload (JPG, PNG, WebP)
  - Video upload support (MP4, MOV, AVI up to 2 minutes)
  - Tag management system
  - Preview mode
  - Draft/publish workflow
- **Media Management**: Upload and organize images/videos with captions
- **Article Management**: Edit, delete, publish/unpublish articles

### Admin Features
- **User Management**: Approve/reject contributor registrations
- **Content Oversight**: Monitor and manage all published content
- **Analytics Dashboard**: View platform statistics and user activity
- **Role Management**: Assign admin and contributor roles
- **System Settings**: Configure platform-wide settings

## 🚀 Technology Stack

- **Frontend**: React 19, Material-UI (MUI)
- **Routing**: React Router DOM
- **Form Management**: React Hook Form with Yup validation
- **File Upload**: React Dropzone
- **Date Handling**: date-fns
- **HTTP Client**: Axios
- **Styling**: Material-UI Theme with custom wildlife color palette

## 📦 Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation Steps

1. **Clone the repository** (if applicable):
   ```bash
   git clone <repository-url>
   cd wildlife-articles
   ```

2. **Install dependencies**:
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Start the development server**:
   ```bash
   npm start
   ```

4. **Open the application**:
   Navigate to `http://localhost:3000` in your browser

## 🔐 Demo Credentials

For testing the application, use these demo accounts:

### Admin Account
- **Email**: `admin@wildlife.com`
- **Password**: `admin123`
- **Access**: Full administrative privileges

### Contributor Account
- **Email**: `researcher@wildlife.com`
- **Password**: `researcher123`
- **Access**: Article creation and management

## 🗂️ Project Structure

```
wildlife-articles/
├── public/                     # Static assets
├── src/
│   ├── components/
│   │   ├── auth/              # Authentication components
│   │   ├── articles/          # Article-related components
│   │   ├── admin/             # Admin-specific components
│   │   └── common/            # Shared components
│   ├── pages/                 # Main page components
│   │   ├── HomePage.js        # Public article listing
│   │   ├── ArticleDetailPage.js # Article reading page
│   │   ├── LoginPage.js       # Authentication
│   │   ├── DashboardPage.js   # Contributor dashboard
│   │   ├── CreateArticlePage.js # Article creation
│   │   ├── EditArticlePage.js # Article editing
│   │   └── AdminPage.js       # Administrative panel
│   ├── context/
│   │   └── AuthContext.js     # Authentication state management
│   ├── services/
│   │   ├── authService.js     # Authentication API calls
│   │   └── articleService.js  # Article-related API calls
│   ├── utils/                 # Utility functions
│   └── assets/               # Images and styles
├── package.json
└── README.md
```

## 🎨 Design Features

### Color Palette
- **Primary**: Forest Green (#2e7d32)
- **Secondary**: Light Green (#8bc34a)
- **Background**: Light Nature (#f1f8e9)
- **Text**: Dark Green tones for readability

### Typography
- **Headers**: Bold, nature-inspired fonts
- **Body**: Clean, readable Roboto font family
- **Accent**: Gradient text effects for branding

### UI Components
- **Cards**: Elevated design with hover effects
- **Buttons**: Rounded corners with smooth transitions
- **Forms**: Clean inputs with validation feedback
- **Navigation**: Responsive navbar with user avatars

## 📱 Responsive Design

The application is fully responsive and optimized for:
- **Desktop**: Full-featured experience (1200px+)
- **Tablet**: Adapted layouts (768px - 1199px)
- **Mobile**: Touch-optimized interface (< 768px)

## 🔧 Key Components

### Authentication System
- JWT-based authentication (mock implementation)
- Role-based access control (Admin, Contributor)
- Protected routes and permission checking
- Automatic token refresh and session management

### Article Management
- Rich text editing with live preview
- Multi-media support (images and videos)
- Tag-based categorization
- Draft/publish workflow
- Social media sharing integration

### Media Handling
- Drag & drop file upload
- Image optimization and resizing
- Video thumbnail generation
- Caption and alt-text management
- File type and size validation

### Search & Discovery
- Real-time search functionality
- Tag-based filtering
- Featured article highlighting
- Responsive grid layouts
- Loading states and error handling

## 🔮 Future Enhancements

### Backend Integration
- Replace mock APIs with real backend services
- Database integration (PostgreSQL/MongoDB)
- File storage service (AWS S3/CloudFront)
- Email notification system

### Advanced Features
- **SEO Optimization**: Meta tags, structured data
- **Analytics**: Article views, user engagement
- **Comments**: Reader engagement system
- **Newsletter**: Email subscription management
- **Advanced Editor**: WYSIWYG editor with more formatting options
- **Bulk Operations**: Mass article management
- **API Documentation**: OpenAPI/Swagger integration

### Performance Optimizations
- **Image Optimization**: WebP conversion, lazy loading
- **Code Splitting**: Route-based code splitting
- **Caching**: Service worker for offline functionality
- **CDN Integration**: Global content delivery

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **Material-UI**: For the excellent React component library
- **Unsplash**: For the beautiful wildlife photography used in demo articles
- **React Community**: For the robust ecosystem and libraries

## 📞 Support

For support and questions, please reach out to the development team or create an issue in the repository.

---

**Wildlife Chronicles** - *Connecting conservation research with the world* 🌍🦎🐅🌳
