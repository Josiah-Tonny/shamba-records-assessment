/**
 * Utility functions for field-related operations
 */

/**
 * Normalizes a status string to a consistent format
 * Converts spaces to underscores and ensures lowercase
 * 
 * @param {string} status - The status string to normalize
 * @returns {string} Normalized status string
 */
export const normalizeStatus = (status) =>
  String(status || '').trim().toLowerCase().replace(/\s+/g, '_');

/**
 * Returns an emoji icon for a given growth stage
 * 
 * @param {string} stage - The growth stage
 * @returns {string} Emoji icon for the stage
 */
export const stageIcon = (stage) => {
  const map = { planted: '🌱', growing: '🌿', ready: '🌾', harvested: '✅' };
  return map[stage] ?? '•';
};

/**
 * Capitalizes the first letter of a string
 * 
 * @param {string} str - The string to capitalize
 * @returns {string} Capitalized string
 */
export const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);
