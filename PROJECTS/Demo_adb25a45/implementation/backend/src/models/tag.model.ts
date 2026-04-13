import { Schema, model, Document } from 'mongoose';
import { User } from './user.model';

/**
 * Interface representing a Tag document in MongoDB
 */
export interface ITag extends Document {
  name: string;
  color: string;
  userId: typeof User._id;
  createdAt: Date;
}

/**
 * Tag Schema for MongoDB collection
 */
const tagSchema = new Schema<ITag>({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 30
  },
  color: {
    type: String,
    required: true,
    match: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

/**
 * Tag model for MongoDB
 */
export const Tag = model<ITag>('Tag', tagSchema);