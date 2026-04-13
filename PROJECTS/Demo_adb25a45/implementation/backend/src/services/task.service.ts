import { ObjectId } from 'mongodb';
import { Task } from '../models/task.model';
import { getDb } from '../config/database.config';
import { TagService } from './tag.service';
import { NotificationService } from './notification.service';

/**
 * Creates a new task for a user
 * @param taskData - The task data to create
 * @returns The created task
 */
export const createTask = async (taskData: Omit<Task, '_id'>): Promise<Task> => {
  try {
    const db = getDb();
    const newTask: Task = {
      ...taskData,
      _id: new ObjectId(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await db.collection<Task>('tasks').insertOne(newTask);
    
    // Schedule notification if due date exists
    if (newTask.dueDate) {
      await NotificationService.scheduleTaskNotification(newTask);
    }
    
    return newTask;
  } catch (error) {
    throw new Error(`Failed to create task: ${error}`);
  }
};

/**
 * Gets all tasks for a user
 * @param userId - The user ID to fetch tasks for
 * @returns Array of tasks
 */
export const getUserTasks = async (userId: string): Promise<Task[]> => {
  try {
    const db = getDb();
    const tasks = await db.collection<Task>('tasks')
      .find({ userId: new ObjectId(userId) })
      .sort({ createdAt: -1 })
      .toArray();
      
    return tasks;
  } catch (error) {
    throw new Error(`Failed to fetch tasks: ${error}`);
  }
};

/**
 * Gets a specific task by ID
 * @param taskId - The task ID to fetch
 * @returns The task object
 */
export const getTaskById = async (taskId: string): Promise<Task | null> => {
  try {
    const db = getDb();
    const task = await db.collection<Task>('tasks')
      .findOne({ _id: new ObjectId(taskId) });
      
    return task;
  } catch (error) {
    throw new Error(`Failed to fetch task: ${error}`);
  }
};

/**
 * Updates a task
 * @param taskId - The task ID to update
 * @param updateData - The data to update
 * @returns The updated task
 */
export const updateTask = async (
  taskId: string, 
  updateData: Partial<Omit<Task, '_id' | 'createdAt'>>
): Promise<Task | null> => {
  try {
    const db = getDb();
    const updates = { 
      ...updateData, 
      updatedAt: new Date() 
    };
    
    const result = await db.collection<Task>('tasks').findOneAndUpdate(
      { _id: new ObjectId(taskId) },
      { $set: updates },
      { returnDocument: 'after' }
    );
    
    // If due date changed, reschedule notification
    if (result.value && updateData.dueDate) {
      await NotificationService.rescheduleTaskNotification(result.value);
    }
    
    return result.value;
  } catch (error) {
    throw new Error(`Failed to update task: ${error}`);
  }
};

/**
 * Deletes a task
 * @param taskId - The task ID to delete
 * @returns Success status
 */
export const deleteTask = async (taskId: string): Promise<boolean> => {
  try {
    const db = getDb();
    const result = await db.collection<Task>('tasks').deleteOne({
      _id: new ObjectId(taskId)
    });
    
    // Delete associated notifications
    await NotificationService.deleteNotificationsForTask(taskId);
    
    return result.deletedCount === 1;
  } catch (error) {
    throw new Error(`Failed to delete task: ${error}`);
  }
};

/**
 * Deletes all completed tasks for a user
 * @param userId - The user ID
 * @returns Number of deleted tasks
 */
export const deleteCompletedTasks = async (userId: string): Promise<number> => {
  try {
    const db = getDb();
    const result = await db.collection<Task>('tasks').deleteMany({
      userId: new ObjectId(userId),
      status: 'completed'
    });
    
    return result.deletedCount;
  } catch (error) {
    throw new Error(`Failed to delete completed tasks: ${error}`);
  }
};

/**
 * Searches tasks by keyword
 * @param userId - The user ID
 * @param keyword - The search keyword
 * @returns Matching tasks
 */
export const searchTasks = async (userId: string, keyword: string): Promise<Task[]> => {
  try {
    const db = getDb();
    const tasks = await db.collection<Task>('tasks')
      .find({
        userId: new ObjectId(userId),
        $or: [
          { title: { $regex: keyword, $options: 'i' } },
          { description: { $regex: keyword, $options: 'i' } }
        ]
      })
      .toArray();
      
    return tasks;
  } catch (error) {
    throw new Error(`Failed to search tasks: ${error}`);
  }
};

/**
 * Filters tasks based on criteria
 * @param userId - The user ID
 * @param filters - Filter criteria
 * @returns Filtered tasks
 */
export const filterTasks = async (
  userId: string,
  filters: {
    status?: string;
    priority?: string;
    tags?: string[];
    dueDateStart?: Date;
    dueDateEnd?: Date;
  }
): Promise<Task[]> => {
  try {
    const db = getDb();
    const query: any = { userId: new ObjectId(userId) };
    
    if (filters.status) {
      query.status = filters.status;
    }
    
    if (filters.priority) {
      query.priority = filters.priority;
    }
    
    if (filters.tags && filters.tags.length > 0) {
      query.tags = {
        $in: filters.tags.map(tag => new ObjectId(tag))
      };
    }
    
    if (filters.dueDateStart || filters.dueDateEnd) {
      query.dueDate = {};
      if (filters.dueDateStart) {
        query.dueDate.$gte = filters.dueDateStart;
      }
      if (filters.dueDateEnd) {
        query.dueDate.$lte = filters.dueDateEnd;
      }
    }
    
    const tasks = await db.collection<Task>('tasks')
      .find(query)
      .toArray();
      
    return tasks;
  } catch (error) {
    throw new Error(`Failed to filter tasks: ${error}`);
  }
};