import { Schema, model, Document, Types } from 'mongoose';
import { User } from './user.model';
import { Task } from './task.model';

/**
 * Interface representing a Notification document in MongoDB
 */
export interface INotification extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId; // Reference to User
  title: string;
  message: string;
  read: boolean;
  taskId?: Types.ObjectId; // Optional reference to Task
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Mongoose schema for Notification
 */
const notificationSchema = new Schema<INotification>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    message: {
      type: String,
      required: true,
      trim: true
    },
    read: {
      type: Boolean,
      default: false,
      index: true
    },
    taskId: {
      type: Schema.Types.ObjectId,
      ref: 'Task',
      default: null
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform: function(doc, ret) {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      }
    }
  }
);

/**
 * Indexes for better query performance
 */
notificationSchema.index({ userId: 1, read: 1 });
notificationSchema.index({ userId: 1, createdAt: -1 });

/**
 * Pre-save hook to ensure updatedAt is updated on every save
 */
notificationSchema.pre('save', function(next) {
  if (!this.isNew) {
    this.updatedAt = new Date();
  }
  next();
});

/**
 * Static method to get unread notifications count for a user
 */
notificationSchema.statics.getUnreadCount = async function(userId: Types.ObjectId): Promise<number> {
  return this.countDocuments({ userId, read: false });
};

/**
 * Instance method to mark notification as read
 */
notificationSchema.methods.markAsRead = async function(): Promise<void> {
  this.read = true;
  await this.save();
};

/**
 * Model for Notification
 */
export const Notification = model<INotification>('Notification', notificationSchema);