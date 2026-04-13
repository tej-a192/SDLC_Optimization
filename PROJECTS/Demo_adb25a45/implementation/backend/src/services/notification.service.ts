import { Notification } from '../models/notification.model';
import { Task } from '../models/task.model';
import { User } from '../models/user.model';
import { sendEmailNotification } from './email.service';

/**
 * Creates a new notification for a user
 * @param userId - ID of the user to notify
 * @param title - Title of the notification
 * @param message - Message content
 * @param taskId - Optional associated task ID
 * @returns Created notification object
 */
export const createNotification = async (
  userId: string,
  title: string,
  message: string,
  taskId?: string
) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const notification = new Notification({
      userId,
      title,
      message,
      taskId
    });

    const savedNotification = await notification.save();
    
    // Send email notification if user has email notifications enabled
    if (user.email) {
      await sendEmailNotification(user.email, title, message);
    }

    return savedNotification;
  } catch (error) {
    throw new Error(`Failed to create notification: ${error.message}`);
  }
};

/**
 * Retrieves all notifications for a specific user
 * @param userId - ID of the user
 * @returns Array of notification objects
 */
export const getUserNotifications = async (userId: string) => {
  try {
    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 });
    return notifications;
  } catch (error) {
    throw new Error(`Failed to retrieve notifications: ${error.message}`);
  }
};

/**
 * Marks a notification as read
 * @param notificationId - ID of the notification to mark as read
 * @returns Updated notification object
 */
export const markAsRead = async (notificationId: string) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      { read: true },
      { new: true }
    );
    
    if (!notification) {
      throw new Error('Notification not found');
    }
    
    return notification;
  } catch (error) {
    throw new Error(`Failed to mark notification as read: ${error.message}`);
  }
};

/**
 * Deletes a notification
 * @param notificationId - ID of the notification to delete
 * @returns Deletion result
 */
export const deleteNotification = async (notificationId: string) => {
  try {
    const result = await Notification.findByIdAndDelete(notificationId);
    
    if (!result) {
      throw new Error('Notification not found');
    }
    
    return { success: true };
  } catch (error) {
    throw new Error(`Failed to delete notification: ${error.message}`);
  }
};

/**
 * Creates a task reminder notification 30 minutes before task is due
 * @param taskId - ID of the task to create reminder for
 * @returns Created notification object or null if task doesn't exist
 */
export const createTaskReminder = async (taskId: string) => {
  try {
    const task = await Task.findById(taskId).populate('userId');
    
    if (!task) {
      throw new Error('Task not found');
    }
    
    // Check if task has a due date
    if (!task.dueDate) {
      return null;
    }
    
    // Check if reminder already exists
    const existingReminder = await Notification.findOne({
      taskId,
      title: 'Task Reminder'
    });
    
    if (existingReminder) {
      return existingReminder;
    }
    
    // Create reminder notification
    const reminderTime = new Date(task.dueDate.getTime() - 30 * 60000); // 30 minutes before
    const now = new Date();
    
    // Only create reminder if it's in the future
    if (reminderTime > now) {
      const notification = await createNotification(
        task.userId._id.toString(),
        'Task Reminder',
        `Your task "${task.title}" is due soon!`,
        taskId
      );
      
      return notification;
    }
    
    return null;
  } catch (error) {
    throw new Error(`Failed to create task reminder: ${error.message}`);
  }
};

/**
 * Marks all notifications for a user as read
 * @param userId - ID of the user
 * @returns Update result
 */
export const markAllAsRead = async (userId: string) => {
  try {
    const result = await Notification.updateMany(
      { userId, read: false },
      { read: true }
    );
    
    return {
      success: true,
      modifiedCount: result.modifiedCount
    };
  } catch (error) {
    throw new Error(`Failed to mark all notifications as read: ${error.message}`);
  }
};

/**
 * Gets unread notification count for a user
 * @param userId - ID of the user
 * @returns Number of unread notifications
 */
export const getUnreadCount = async (userId: string) => {
  try {
    const count = await Notification.countDocuments({
      userId,
      read: false
    });
    
    return count;
  } catch (error) {
    throw new Error(`Failed to get unread notification count: ${error.message}`);
  }
};