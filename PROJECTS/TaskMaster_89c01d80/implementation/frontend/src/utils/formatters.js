/**
 * Formats a date string into a human-readable format
 * @param {string|Date} date - The date to format
 * @returns {string} Formatted date string
 */
export const formatDate = (date) => {
  if (!date) return '';
  
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return '';
  
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

/**
 * Formats a date and time string into a human-readable format
 * @param {string|Date} dateTime - The date/time to format
 * @returns {string} Formatted date and time string
 */
export const formatDateTime = (dateTime) => {
  if (!dateTime) return '';
  
  const dateObj = new Date(dateTime);
  if (isNaN(dateObj.getTime())) return '';
  
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Truncates text to a specified length and adds ellipsis
 * @param {string} text - The text to truncate
 * @param {number} maxLength - Maximum length before truncation
 * @returns {string} Truncated text
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text || typeof text !== 'string') return '';
  
  if (text.length <= maxLength) return text;
  
  return `${text.substring(0, maxLength)}...`;
};

/**
 * Capitalizes the first letter of each word in a string
 * @param {string} text - The text to capitalize
 * @returns {string} Capitalized text
 */
export const capitalizeWords = (text) => {
  if (!text || typeof text !== 'string') return '';
  
  return text
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

/**
 * Converts priority number to descriptive text
 * @param {number} priority - Priority level (1-5)
 * @returns {string} Priority description
 */
export const formatPriority = (priority) => {
  if (typeof priority !== 'number' || priority < 1 || priority > 5) {
    return 'Unknown';
  }
  
  const priorityMap = {
    1: 'Low',
    2: 'Medium',
    3: 'High',
    4: 'Urgent',
    5: 'Critical'
  };
  
  return priorityMap[priority] || 'Unknown';
};

/**
 * Formats task status for display
 * @param {string} status - Task status
 * @returns {string} Formatted status
 */
export const formatStatus = (status) => {
  if (!status) return 'Unknown';
  
  const statusMap = {
    'todo': 'To Do',
    'in_progress': 'In Progress',
    'done': 'Done'
  };
  
  return statusMap[status] || capitalizeWords(status.replace('_', ' '));
};