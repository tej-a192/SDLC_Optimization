import mongoose, { Document, Schema } from 'mongoose';

export interface ITask extends Document {
  title: string;
  description?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  dueDate?: Date;
  category: string;
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema: Schema = new Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 255 },
    description: { type: String, trim: true },
    completed: { type: Boolean, default: false },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'low' },
    dueDate: { type: Date },
    category: { type: String, default: 'Inbox', trim: true }
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt
  }
);

// Mongoose intercepts 'id' natively with _id. We can add a toJSON transform to expose 'id'
TaskSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
  }
});

export const Task = mongoose.model<ITask>('Task', TaskSchema);