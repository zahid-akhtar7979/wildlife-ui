// Utility functions for text processing

import { format } from 'date-fns';

/**
 * Strip HTML tags from content and return plain text
 * @param {string} html - HTML content
 * @returns {string} - Plain text without HTML tags
 */
export const stripHtmlTags = (html) => {
  if (!html) return '';
  
  // Create a temporary div element to parse HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  
  // Get text content and clean up extra spaces
  return tempDiv.textContent || tempDiv.innerText || '';
};

/**
 * Truncate text to specified length with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} - Truncated text
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text || typeof text !== 'string') return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
};

/**
 * Convert HTML content to plain text with basic formatting preserved
 * @param {string} html - HTML content
 * @returns {string} - Plain text with line breaks
 */
export const htmlToPlainText = (html) => {
  if (!html) return '';
  
  return html
    .replace(/<\/p>/g, '\n\n')  // Convert </p> to double line break
    .replace(/<br\s*\/?>/g, '\n')  // Convert <br> to line break
    .replace(/<\/h[1-6]>/g, '\n\n')  // Convert heading endings to double line break
    .replace(/<[^>]*>/g, '')  // Remove all other HTML tags
    .replace(/\n{3,}/g, '\n\n')  // Replace multiple line breaks with double
    .trim();
};

/**
 * Text utility functions
 */

/**
 * Safe date formatting function that handles null/undefined/invalid dates
 * @param {string|Date|null|undefined} dateValue - The date value to format
 * @param {string} formatString - The format string for date-fns
 * @param {string} fallback - Fallback text when date is invalid
 * @returns {string} Formatted date or fallback text
 */
export const formatSafeDate = (dateValue, formatString = 'MMM dd, yyyy', fallback = 'Date not available') => {
  if (!dateValue) {
    return fallback;
  }

  try {
    const date = new Date(dateValue);
    
    // Check if the date is valid
    if (isNaN(date.getTime())) {
      return fallback;
    }
    
    return format(date, formatString);
  } catch (error) {
    console.warn('Date formatting error:', error, 'for value:', dateValue);
    return fallback;
  }
};

/**
 * Safe date formatting for article publish dates
 * Uses publishDate if available, otherwise falls back to createdAt
 * @param {Object} article - Article object with publishDate and createdAt
 * @param {string} formatString - The format string for date-fns
 * @returns {string} Formatted date
 */
export const formatArticleDate = (article, formatString = 'MMM dd, yyyy') => {
  if (!article) {
    return 'Date not available';
  }

  // For published articles, use publishDate; for drafts, use createdAt
  const dateToUse = article.published && article.publishDate 
    ? article.publishDate 
    : article.createdAt;

  const prefix = article.published && article.publishDate ? 'Published' : 'Created';
  const formattedDate = formatSafeDate(dateToUse, formatString, 'Unknown date');
  
  return `${prefix} ${formattedDate}`;
};

/**
 * Check if a date value is valid
 * @param {string|Date|null|undefined} dateValue - The date value to check
 * @returns {boolean} True if date is valid
 */
export const isValidDate = (dateValue) => {
  if (!dateValue) return false;
  
  try {
    const date = new Date(dateValue);
    return !isNaN(date.getTime());
  } catch {
    return false;
  }
};

/**
 * Strip HTML tags from text
 * @param {string} html - HTML string
 * @returns {string} Plain text
 */
export const stripHtml = (html) => {
  if (!html || typeof html !== 'string') return '';
  return html.replace(/<[^>]*>/g, '').trim();
};

/**
 * Create an excerpt from HTML content
 * @param {string} content - HTML content
 * @param {number} maxLength - Maximum length of excerpt
 * @returns {string} Plain text excerpt
 */
export const createExcerpt = (content, maxLength = 200) => {
  const plainText = stripHtml(content);
  return truncateText(plainText, maxLength);
};

/**
 * Clean up text by normalizing whitespace and line breaks
 * @param {string} text - Input text
 * @returns {string} Cleaned text
 */
export const cleanText = (text) => {
  if (!text || typeof text !== 'string') return '';
  
  return text
    .replace(/\s+/g, ' ')           // Replace multiple spaces with single space
    .replace(/\n\s*\n/g, '\n')      // Replace multiple line breaks with single
    .replace(/\n{3,}/g, '\n\n')     // Replace multiple line breaks with double
    .trim();
}; 