import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

// Define the Task interface
interface ITask {
  id: number;
  title: string;
  description?: string;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Define the context type
interface ITaskContext {
  tasks: ITask[];
  loading: boolean;
  error: string | null;
  createTask: (title: string, description?: string) => Promise<void>;
  updateTask: (id: number, updates: Partial<ITask>) => Promise<void>;
  deleteTask: (id: number) => Promise<void>;
  toggleTaskCompletion: (id: number) => Promise<void>;
  fetchTasks: () => Promise<void>;
}

// Create the context with default values
export const TaskContext = createContext<ITaskContext>({
  tasks: [],
  loading: false,
  error: null,
  createTask: async () => {},
  updateTask: async () => {},
  deleteTask: async () => {},
  toggleTaskCompletion: async () => {},
  fetchTasks: async () => {},
});

// Provider component
export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<ITask[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all tasks
  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/tasks');
      setTasks(response.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  // Create a new task
  const createTask = async (title: string, description?: string) => {
    try {
      const response = await axios.post('/api/tasks', { title, description });
      setTasks([...tasks, response.data]);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create task');
      throw err;
    }
  };

  // Update an existing task
  const updateTask = async (id: number, updates: Partial<ITask>) => {
    try {
      const response = await axios.put(`/api/tasks/${id}`, updates);
      setTasks(tasks.map(task => (task.id === id ? response.data : task)));
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update task');
      throw err;
    }
  };

  // Delete a task
  const deleteTask = async (id: number) => {
    try {
      await axios.delete(`/api/tasks/${id}`);
      setTasks(tasks.filter(task => task.id !== id));
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete task');
      throw err;
    }
  };

  // Toggle task completion status
  const toggleTaskCompletion = async (id: number) => {
    try {
      const task = tasks.find(t => t.id === id);
      if (!task) return;

      const response = await axios.patch(`/api/tasks/${id}/toggle`, {
        completed: !task.completed,
      });

      setTasks(
        tasks.map(t =>
          t.id === id ? { ...t, completed: response.data.completed } : t
        )
      );
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to toggle task completion');
      throw err;
    }
  };

  // Initial fetch of tasks on mount
  useEffect(() => {
    fetchTasks();
  }, []);

  return (
    <TaskContext.Provider
      value={{
        tasks,
        loading,
        error,
        createTask,
        updateTask,
        deleteTask,
        toggleTaskCompletion,
        fetchTasks,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};