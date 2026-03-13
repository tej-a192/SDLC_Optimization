/**
 * Utility functions for general use across the application
 */

import { formatCurrency, formatDate } from './formatters';

/**
 * Debounces a function call by a specified delay
 * @param {Function} func - The function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} - Debounced function
 */
export const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
};

/**
 * Throttles a function call to execute at most once per interval
 * @param {Function} func - The function to throttle
 * @param {number} limit - Minimum interval between calls in milliseconds
 * @returns {Function} - Throttled function
 */
export const throttle = (func, limit) => {
  let inThrottle;
  return (...args) => {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

/**
 * Deep clones an object or array
 * @param {*} obj - Object or array to clone
 * @returns {*} - Cloned object or array
 */
export const deepClone = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj);
  if (obj instanceof Array) return obj.map(item => deepClone(item));
  if (obj instanceof Object) {
    const clonedObj = {};
    for (let key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }
};

/**
 * Generates a unique identifier
 * @returns {string} - Unique ID string
 */
export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

/**
 * Checks if a value is empty (null, undefined, empty string, empty array, or empty object)
 * @param {*} value - Value to check
 * @returns {boolean} - True if empty, false otherwise
 */
export const isEmpty = (value) => {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string' && value === '') return true;
  if (Array.isArray(value) && value.length === 0) return true;
  if (typeof value === 'object' && Object.keys(value).length === 0) return true;
  return false;
};

/**
 * Capitalizes the first letter of a string
 * @param {string} str - Input string
 * @returns {string} - String with capitalized first letter
 */
export const capitalizeFirstLetter = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Converts a string to camelCase
 * @param {string} str - Input string
 * @returns {string} - CamelCase string
 */
export const toCamelCase = (str) => {
  return str.replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
    return index === 0 ? word.toLowerCase() : word.toUpperCase();
  }).replace(/\s+/g, '');
};

/**
 * Removes duplicates from an array
 * @param {Array} array - Input array
 * @returns {Array} - Array with duplicates removed
 */
export const removeDuplicates = (array) => {
  if (!Array.isArray(array)) return [];
  return [...new Set(array)];
};

/**
 * Groups an array of objects by a specific key
 * @param {Array} array - Array of objects
 * @param {string} key - Key to group by
 * @returns {Object} - Grouped object
 */
export const groupBy = (array, key) => {
  if (!Array.isArray(array)) return {};
  return array.reduce((result, item) => {
    const group = item[key];
    if (!result[group]) {
      result[group] = [];
    }
    result[group].push(item);
    return result;
  }, {});
};

/**
 * Sorts an array of objects by a specific key
 * @param {Array} array - Array of objects
 * @param {string} key - Key to sort by
 * @param {string} order - Sort order ('asc' or 'desc')
 * @returns {Array} - Sorted array
 */
export const sortByKey = (array, key, order = 'asc') => {
  if (!Array.isArray(array)) return [];
  return array.sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];
    
    if (order === 'desc') {
      return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
    }
    return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
  });
};

/**
 * Filters an array of objects based on a search term
 * @param {Array} array - Array of objects
 * @param {string} searchTerm - Term to search for
 * @param {Array} keys - Keys to search within
 * @returns {Array} - Filtered array
 */
export const filterBySearch = (array, searchTerm, keys) => {
  if (!Array.isArray(array) || !searchTerm) return array;
  
  const normalizedSearch = searchTerm.toLowerCase();
  return array.filter(item => 
    keys.some(key => {
      const value = item[key];
      return value && value.toString().toLowerCase().includes(normalizedSearch);
    })
  );
};

/**
 * Truncates a string to a specified length and adds ellipsis
 * @param {string} str - String to truncate
 * @param {number} length - Maximum length
 * @returns {string} - Truncated string
 */
export const truncateString = (str, length) => {
  if (!str || str.length <= length) return str;
  return str.substring(0, length) + '...';
};

/**
 * Validates email format
 * @param {string} email - Email to validate
 * @returns {boolean} - True if valid, false otherwise
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Delays execution for a specified time
 * @param {number} ms - Milliseconds to delay
 * @returns {Promise} - Promise that resolves after delay
 */
export const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

export {
  formatCurrency,
  formatDate
};