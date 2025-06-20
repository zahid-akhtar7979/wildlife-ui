// Utility functions for text processing

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
export const truncateText = (text, maxLength = 150) => {
  if (!text || text.length <= maxLength) return text;
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