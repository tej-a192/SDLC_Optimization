import { Request, Response } from 'express';
import { Notification } from '../models/notification.model';
import { User } from '../models/user.model';
import { Task } from '../models/task.model';

/**
 * Send a notification to a user
 * @param req - Express request object
 * @param res - Express response object
 */
export const sendNotification = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, title, message, taskId } = req.body;

    // Validate required fields
    if (!userId || !title || !message) {
      res.status(400).json({
        success: false,
        message: 'userId, title, and message are required'
      });
      return;
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    // If taskId is provided, verify it exists
    if (taskId) {
      const task = await Task.findById(taskId);
      if (!task) {
        res.status(404).json({
          success: false,
          message: 'Task not found'
        });
        return;
      }
    }

    // Create notification
    const notification = new Notification({
      userId,
      title,
      message,
      taskId: taskId || null,
      read: false
    });

    // Save notification
    const savedNotification = await notification.save();

    res.status(201).json({
      success: true,
      message: 'Notification sent successfully',
      data: savedNotification
    });
  } catch (error) {
    console.error('Error sending notification:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Get all notifications for a user
 * @param req - Express request object
 * @param res - Express response object
 */
export const getUserNotifications = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;

    // Validate userId
    if (!userId) {
      res.status(400).json({
        success: false,
        message: 'userId is required'
      });
      return;
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    // Find notifications for user
    const notifications = await Notification.find({ userId }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: notifications
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Mark a notification as read
 * @param req - Express request object
 * @param res - Express response object
 */
export const markAsRead = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Validate notification ID
    if (!id) {
      res.status(400).json({
        success: false,
        message: 'Notification ID is required'
      });
      return;
    }

    // Find and update notification
    const notification = await Notification.findByIdAndUpdate(
      id,
      { read: true },
      { new: true }
    );

    if (!notification) {
      res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Notification marked as read',
      data: notification
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Delete a notification
 * @param req - Express request object
 * @param res - Express response object
 */
export const deleteNotification = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Validate notification ID
    if (!id) {
      res.status(400).json({
        success: false,
        message: 'Notification ID is required'
      });
      return;
    }

    // Find and delete notification
    const notification = await Notification.findByIdAndDelete(id);

    if (!notification) {
      res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};