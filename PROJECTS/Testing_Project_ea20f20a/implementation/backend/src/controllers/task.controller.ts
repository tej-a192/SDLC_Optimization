import { Request, Response } from 'express';
import taskService from '../services/task.service';

export const getAllTasks = async (req: Request, res: Response): Promise<void> => {
  try {
    const tasks = await taskService.getAllTasks();
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving tasks', error });
  }
};

export const getTaskById = async (req: Request, res: Response): Promise<void> => {
  try {
    const task = await taskService.getTaskById(req.params.id);
    if (!task) {
      res.status(404).json({ message: 'Task not found' });
      return;
    }
    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving task', error });
  }
};

export const createTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, description, priority, dueDate, category } = req.body;
    if (!title) {
      res.status(400).json({ message: 'Title is required' });
      return;
    }
    const newTask = await taskService.createTask({ title, description, priority, dueDate, category });
    res.status(201).json(newTask);
  } catch (error) {
    res.status(500).json({ message: 'Error creating task', error });
  }
};

export const updateTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const updatedTask = await taskService.updateTask(req.params.id, req.body);
    if (!updatedTask) {
      res.status(404).json({ message: 'Task not found' });
      return;
    }
    res.status(200).json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: 'Error updating task', error });
  }
};

export const deleteTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const deleted = await taskService.deleteTask(req.params.id);
    if (!deleted) {
      res.status(404).json({ message: 'Task not found' });
      return;
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Error deleting task', error });
  }
};

export const toggleTaskCompletion = async (req: Request, res: Response): Promise<void> => {
  try {
    const task = await taskService.toggleTaskCompletion(req.params.id);
    if (!task) {
      res.status(404).json({ message: 'Task not found' });
      return;
    }
    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ message: 'Error toggling task', error });
  }
};