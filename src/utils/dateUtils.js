/**
 * Utility functions for date formatting
 */

/**
 * Formats a date string to a localized short date format
 * 
 * @param {string|Date} date - The date to format
 * @param {Object} options - Intl.DateTimeFormat options
 * @returns {string} Formatted date string
 */
export const formatDate = (date, options = {}) => {
  const defaultOptions = {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    ...options
  };
  
  return new Date(date).toLocaleDateString(undefined, defaultOptions);
};
