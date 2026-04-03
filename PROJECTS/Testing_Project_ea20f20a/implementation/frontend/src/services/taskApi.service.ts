import axios from 'axios';

const API_BASE_URL = '/api/tasks';

export interface ITask {
  id: number;
  title: string;
  description?: string;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Fetches all tasks from the backend
 * @returns Promise resolving to array of tasks
 */
export const fetchTasks = async (): Promise<ITask[]> => {
  try {
    const response = await axios.get<ITask[]>(API_BASE_URL);
    return response.data;
  } catch (error) {
    console.error('Error fetching tasks:', error);
    throw new Error('Failed to fetch tasks');
  }
};

/**
 * Creates a new task
 * @param task - Partial task object containing title and optional description
 * @returns Promise resolving to the created task
 */
export const createTask = async (task: Pick<ITask, 'title' | 'description'>): Promise<ITask> => {
  try {
    const response = await axios.post<ITask>(API_BASE_URL, task);
    return response.data;
  } catch (error) {
    console.error('Error creating task:', error);
    throw new Error('Failed to create task');
  }
};

/**
 * Updates an existing task
 * @param id - ID of the task to update
 * @param updates - Partial task object with updated fields
 * @returns Promise resolving to the updated task
 */
export const updateTask = async (id: number, updates: Partial<ITask>): Promise<ITask> => {
  try {
    const response = await axios.put<ITask>(`${API_BASE_URL}/${id}`, updates);
    return response.data;
  } catch (error) {
    console.error(`Error updating task ${id}:`, error);
    throw new Error('Failed to update task');
  }
};

/**
 * Deletes a task by ID
 * @param id - ID of the task to delete
 * @returns Promise resolving to void
 */
export const deleteTask = async (id: number): Promise<void> => {
  try {
    await axios.delete(`${API_BASE_URL}/${id}`);
  } catch (error) {
    console.error(`Error deleting task ${id}:`, error);
    throw new Error('Failed to delete task');
  }
};

/**
 * Toggles the completion status of a task
 * @param id - ID of the task to toggle
 * @returns Promise resolving to the updated task
 */
export const toggleTaskCompletion = async (id: number): Promise<ITask> => {
  try {
    const response = await axios.patch<ITask>(`${API_BASE_URL}/${id}/toggle`);
    return response.data;
  } catch (error) {
    console.error(`Error toggling task ${id}:`, error);
    throw new Error('Failed to toggle task completion');
  }
};