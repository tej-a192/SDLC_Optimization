import api from './api';
import { handleApiError } from './authService';

/**
 * Fetches all tasks for the authenticated user
 * @returns {Promise<Array>} List of tasks
 */
export const getTasks = async () => {
  try {
    const response = await api.get('/tasks/');
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

/**
 * Fetches a specific task by ID
 * @param {string} taskId - The ID of the task to fetch
 * @returns {Promise<Object>} The task object
 */
export const getTaskById = async (taskId) => {
  try {
    const response = await api.get(`/tasks/${taskId}`);
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

/**
 * Creates a new task
 * @param {Object} taskData - The task data to create
 * @returns {Promise<Object>} The created task object
 */
export const createTask = async (taskData) => {
  try {
    const response = await api.post('/tasks/', taskData);
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

/**
 * Updates an existing task
 * @param {string} taskId - The ID of the task to update
 * @param {Object} taskData - The updated task data
 * @returns {Promise<Object>} The updated task object
 */
export const updateTask = async (taskId, taskData) => {
  try {
    const response = await api.put(`/tasks/${taskId}`, taskData);
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

/**
 * Deletes a task by ID
 * @param {string} taskId - The ID of the task to delete
 * @returns {Promise<void>}
 */
export const deleteTask = async (taskId) => {
  try {
    await api.delete(`/tasks/${taskId}`);
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};