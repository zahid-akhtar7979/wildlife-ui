import React, { useState } from 'react';
import { Container, Button, Typography, Box, Alert, Paper } from '@mui/material';
import { articleService } from '../services/articleService';

const TestPage = () => {
  const [testResults, setTestResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const addResult = (test, success, data, error = null) => {
    setTestResults(prev => [...prev, { test, success, data, error, timestamp: new Date() }]);
  };

  const testApiCalls = async () => {
    setLoading(true);
    setTestResults([]);

    // Test 1: Get all articles
    try {
      console.log('🧪 Test 1: Getting all articles...');
      const articlesResponse = await articleService.getArticles();
      addResult('Get All Articles', true, {
        articleCount: articlesResponse.data?.articles?.length || 0,
        firstArticle: articlesResponse.data?.articles?.[0]?.title || 'None'
      });
    } catch (error) {
      addResult('Get All Articles', false, null, error.message);
    }

    // Test 2: Get specific article (ID 18)
    try {
      console.log('🧪 Test 2: Getting article ID 18...');
      const articleResponse = await articleService.getArticleById(18);
      addResult('Get Article ID 18', true, {
        title: articleResponse.data?.article?.title,
        hasContent: !!articleResponse.data?.article?.content,
        contentLength: articleResponse.data?.article?.content?.length || 0,
        author: articleResponse.data?.article?.author?.name
      });
    } catch (error) {
      addResult('Get Article ID 18', false, null, error.message);
    }

    // Test 3: Direct API call
    try {
      console.log('🧪 Test 3: Direct fetch to API...');
      const response = await fetch('http://localhost:3001/api/articles/18');
      const data = await response.json();
      addResult('Direct API Call', response.ok, {
        status: response.status,
        hasArticle: !!data.data?.article,
        title: data.data?.article?.title
      });
    } catch (error) {
      addResult('Direct API Call', false, null, error.message);
    }

    setLoading(false);
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        API Test Page
      </Typography>
      
      <Box mb={3}>
        <Button 
          variant="contained" 
          onClick={testApiCalls}
          disabled={loading}
        >
          {loading ? 'Testing...' : 'Run API Tests'}
        </Button>
      </Box>

      {testResults.map((result, index) => (
        <Paper key={index} sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6" color={result.success ? 'success.main' : 'error.main'}>
            {result.test}: {result.success ? '✅ PASS' : '❌ FAIL'}
          </Typography>
          
          {result.success && result.data && (
            <Box mt={1}>
              <Typography variant="subtitle2">Data:</Typography>
              <pre style={{ fontSize: '0.8rem', overflow: 'auto' }}>
                {JSON.stringify(result.data, null, 2)}
              </pre>
            </Box>
          )}
          
          {!result.success && result.error && (
            <Alert severity="error" sx={{ mt: 1 }}>
              {result.error}
            </Alert>
          )}
          
          <Typography variant="caption" color="text.secondary">
            {result.timestamp.toLocaleTimeString()}
          </Typography>
        </Paper>
      ))}
    </Container>
  );
};

export default TestPage; 