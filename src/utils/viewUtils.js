/**
 * Utility functions for view determination based on path
 */

/**
 * Determines the current agent view based on the pathname
 * 
 * @param {string} pathname - Current route pathname
 * @returns {Object} Object containing view flags
 */
export const getAgentView = (pathname) => {
  return {
    isDashboardView: pathname === '/agent/dashboard',
    isFieldsView: pathname === '/agent/fields',
    isUpdatesView: pathname === '/agent/updates'
  };
};
