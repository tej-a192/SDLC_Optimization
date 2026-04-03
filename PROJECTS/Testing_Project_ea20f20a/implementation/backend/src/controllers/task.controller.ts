import { Request, Response } from 'express';
import { TaskService } from '../services/task.service';

const taskService = new TaskService();

/**
 * Get all tasks
 * @param req - Express request object
 * @param res - Express response object
 */
export const getAllTasks = async (req: Request, res: Response): Promise<void> => {
  try {
    const tasks = await taskService.getAllTasks();
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving tasks', error });
  }
};

/**
 * Get a specific task by ID
 * @param req - Express request object
 * @param res - Express response object
 */
export const getTaskById = async (req: Request, res: Response): Promise<void> => {
  try {
    const taskId = parseInt(req.params.id, 10);
    if (isNaN(taskId)) {
      res.status(400).json({ message: 'Invalid task ID' });
      return;
    }

    const task = await taskService.getTaskById(taskId);
    if (!task) {
      res.status(404).json({ message: 'Task not found' });
      return;
    }

    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving task', error });
  }
};

/**
 * Create a new task
 * @param req - Express request object
 * @param res - Express response object
 */
export const createTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, description } = req.body;

    if (!title) {
      res.status(400).json({ message: 'Title is required' });
      return;
    }

    const newTask = await taskService.createTask({ title, description });
    res.status(201).json(newTask);
  } catch (error) {
    res.status(500).json({ message: 'Error creating task', error });
  }
};

/**
 * Update an existing task
 * @param req - Express request object
 * @param res - Express response object
 */
export const updateTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const taskId = parseInt(req.params.id, 10);
    if (isNaN(taskId)) {
      res.status(400).json({ message: 'Invalid task ID' });
      return;
    }

    const { title, description, completed } = req.body;
    const updatedTask = await taskService.updateTask(taskId, { title, description, completed });

    if (!updatedTask) {
      res.status(404).json({ message: 'Task not found' });
      return;
    }

    res.status(200).json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: 'Error updating task', error });
  }
};

/**
 * Delete a task by ID
 * @param req - Express request object
 * @param res - Express response object
 */
export const deleteTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const taskId = parseInt(req.params.id, 10);
    if (isNaN(taskId)) {
      res.status(400).json({ message: 'Invalid task ID' });
      return;
    }

    const deleted = await taskService.deleteTask(taskId);
    if (!deleted) {
      res.status(404).json({ message: 'Task not found' });
      return;
    }

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Error deleting task', error });
  }
};

/**
 * Toggle task completion status
 * @param req - Express request object
 * @param res - Express response object
 */
export const toggleTaskCompletion = async (req: Request, res: Response): Promise<void> => {
  try {
    const taskId = parseInt(req.params.id, 10);
    if (isNaN(taskId)) {
      res.status(400).json({ message: 'Invalid task ID' });
      return;
    }

    const task = await taskService.toggleTaskCompletion(taskId);
    if (!task) {
      res.status(404).json({ message: 'Task not found' });
      return;
    }

    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ message: 'Error toggling task completion', error });
  }
};