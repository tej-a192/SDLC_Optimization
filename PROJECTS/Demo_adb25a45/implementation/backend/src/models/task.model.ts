import mongoose, { Document, Schema } from 'mongoose';
import { IUser } from './user.model';
import { ITag } from './tag.model';

/**
 * Enum for task status values
 */
export enum TaskStatus {
  Pending = 'pending',
  InProgress = 'in-progress',
  Completed = 'completed'
}

/**
 * Enum for task priority values
 */
export enum TaskPriority {
  Low = 'low',
  Medium = 'medium',
  High = 'high'
}

/**
 * Interface for Task document
 */
export interface ITask extends Document {
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: Date;
  userId: IUser['_id'];
  tags: ITag['_id'][];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Task Schema
 */
const taskSchema: Schema<ITask> = new Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  status: {
    type: String,
    enum: Object.values(TaskStatus),
    default: TaskStatus.Pending
  },
  priority: {
    type: String,
    enum: Object.values(TaskPriority),
    default: TaskPriority.Medium
  },
  dueDate: {
    type: Date,
    validate: {
      validator: function(date: Date) {
        return !date || date > new Date();
      },
      message: 'Due date must be in the future'
    }
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tags: [{
    type: Schema.Types.ObjectId,
    ref: 'Tag'
  }]
}, {
  timestamps: true,
  toJSON: {
    transform: (doc, ret) => {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

/**
 * Indexes for better query performance
 */
taskSchema.index({ userId: 1, status: 1 });
taskSchema.index({ userId: 1, priority: 1 });
taskSchema.index({ userId: 1, dueDate: 1 });
taskSchema.index({ userId: 1, tags: 1 });

export default mongoose.model<ITask>('Task', taskSchema);