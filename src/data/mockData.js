// Mock articles data
export const mockArticles = [
  {
    id: 1,
    title: 'Orangutans of Borneo: Protecting the Last Forest Gardeners',
    content: '<p>Discover the critical situation facing Bornean orangutans and learn how conservation efforts are working to save these incredible forest gardeners.</p>',
    excerpt: 'Discover the critical situation facing Bornean orangutans and learn how conservation efforts are working to save these incredible forest gardeners.',
    author: { 
      id: 1,
      name: 'Dr. John Doe',
      email: 'john.doe@wildlife.org'
    },
    publishedDate: '2024-01-05',
    images: [{ 
      url: 'https://images.unsplash.com/photo-1544985361-b420d7a77043?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&h=600&q=80', 
      caption: 'Orangutan mother with her baby in Borneo rainforest' 
    }],
    tags: ['Primates', 'Orangutans', 'Conservation'],
    views: 654,
    category: 'Primates',
    published: true
  },
  {
    id: 2,
    title: 'Bengal Tigers: Guardians of the Sundarbans',
    content: '<p>Explore the unique ecosystem of the Sundarbans and the magnificent Bengal tigers that call this mangrove forest home.</p>',
    excerpt: 'Explore the unique ecosystem of the Sundarbans and the magnificent Bengal tigers that call this mangrove forest home.',
    author: { 
      id: 2,
      name: 'Dr. Sarah Wilson',
      email: 'sarah.wilson@wildlife.org'
    },
    publishedDate: '2024-01-03',
    images: [{ 
      url: 'https://images.unsplash.com/photo-1551969014-7d2c4cddf0b6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80', 
      caption: 'Bengal tiger in Sundarbans mangrove forest' 
    }],
    tags: ['Big Cats', 'Tigers', 'Conservation'],
    views: 892,
    category: 'Big Cats',
    published: true
  },
  {
    id: 3,
    title: 'African Elephants: The Gentle Giants of the Savanna',
    content: '<p>Learn about the complex social structures of African elephants and the conservation challenges they face in the modern world.</p>',
    excerpt: 'Learn about the complex social structures of African elephants and the conservation challenges they face in the modern world.',
    author: { 
      id: 3,
      name: 'Dr. Michael Chen',
      email: 'michael.chen@wildlife.org'
    },
    publishedDate: '2024-01-01',
    images: [{ 
      url: 'https://images.unsplash.com/photo-1564760055775-d63b17a55c44?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80', 
      caption: 'African elephant herd in savanna' 
    }],
    tags: ['Large Mammals', 'Elephants', 'Conservation'],
    views: 567,
    category: 'Large Mammals',
    published: true
  }
];

// Categories
export const categories = [
  'Big Cats',
  'Large Mammals', 
  'Primates',
  'Birds',
  'Marine Life',
  'Conservation',
  'Climate Change',
  'Habitat Protection'
];

// Common tags
export const commonTags = [
  'Conservation',
  'Wildlife',
  'Research',
  'Endangered',
  'Habitat',
  'Climate Change',
  'Biodiversity',
  'Ecosystem',
  'Protection',
  'Nature'
]; 