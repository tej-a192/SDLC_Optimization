import { Request, Response } from 'express';
import { Task } from '../models/task.model';
import { User } from '../models/user.model';
import { Tag } from '../models/tag.model';
import { Notification } from '../models/notification.model';
import { isValidObjectId } from 'mongoose';

/**
 * Get all tasks for the authenticated user
 * @param req - Express Request object
 * @param res - Express Response object
 */
export const getTasks = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const tasks = await Task.find({ userId }).populate('tags');
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

/**
 * Get a specific task by ID
 * @param req - Express Request object
 * @param res - Express Response object
 */
export const getTaskById = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    const taskId = req.params.id;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    if (!isValidObjectId(taskId)) {
      res.status(400).json({ message: 'Invalid task ID' });
      return;
    }

    const task = await Task.findOne({ _id: taskId, userId }).populate('tags');

    if (!task) {
      res.status(404).json({ message: 'Task not found' });
      return;
    }

    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

/**
 * Create a new task
 * @param req - Express Request object
 * @param res - Express Response object
 */
export const createTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { title, description, status, priority, dueDate, tags } = req.body;

    // Validate required fields
    if (!title) {
      res.status(400).json({ message: 'Title is required' });
      return;
    }

    // Validate tags if provided
    if (tags && Array.isArray(tags)) {
      for (const tagId of tags) {
        if (!isValidObjectId(tagId)) {
          res.status(400).json({ message: `Invalid tag ID: ${tagId}` });
          return;
        }
        
        const tagExists = await Tag.exists({ _id: tagId, userId });
        if (!tagExists) {
          res.status(400).json({ message: `Tag not found: ${tagId}` });
          return;
        }
      }
    }

    const task = new Task({
      title,
      description,
      status: status || 'pending',
      priority: priority || 'medium',
      dueDate: dueDate ? new Date(dueDate) : undefined,
      userId,
      tags: tags || []
    });

    const savedTask = await task.save();
    
    // Populate tags for response
    await savedTask.populate('tags');
    
    res.status(201).json(savedTask);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

/**
 * Update an existing task
 * @param req - Express Request object
 * @param res - Express Response object
 */
export const updateTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    const taskId = req.params.id;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    if (!isValidObjectId(taskId)) {
      res.status(400).json({ message: 'Invalid task ID' });
      return;
    }

    const { title, description, status, priority, dueDate, tags } = req.body;

    // Validate tags if provided
    if (tags && Array.isArray(tags)) {
      for (const tagId of tags) {
        if (!isValidObjectId(tagId)) {
          res.status(400).json({ message: `Invalid tag ID: ${tagId}` });
          return;
        }
        
        const tagExists = await Tag.exists({ _id: tagId, userId });
        if (!tagExists) {
          res.status(400).json({ message: `Tag not found: ${tagId}` });
          return;
        }
      }
    }

    const task = await Task.findOneAndUpdate(
      { _id: taskId, userId },
      {
        title,
        description,
        status,
        priority,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        tags
      },
      { new: true, runValidators: true }
    ).populate('tags');

    if (!task) {
      res.status(404).json({ message: 'Task not found' });
      return;
    }

    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

/**
 * Delete a specific task
 * @param req - Express Request object
 * @param res - Express Response object
 */
export const deleteTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    const taskId = req.params.id;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    if (!isValidObjectId(taskId)) {
      res.status(400).json({ message: 'Invalid task ID' });
      return;
    }

    const task = await Task.findOneAndDelete({ _id: taskId, userId });

    if (!task) {
      res.status(404).json({ message: 'Task not found' });
      return;
    }

    res.status(200).json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

/**
 * Delete all completed tasks for the authenticated user
 * @param req - Express Request object
 * @param res - Express Response object
 */
export const deleteCompletedTasks = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const result = await Task.deleteMany({ userId, status: 'completed' });

    res.status(200).json({ 
      message: `${result.deletedCount} completed tasks deleted successfully` 
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};