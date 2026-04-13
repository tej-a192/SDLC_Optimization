import { Tag } from '../models/tag.model';
import { Types } from 'mongoose';

interface CreateTagInput {
  name: string;
  color: string;
  userId: Types.ObjectId;
}

interface UpdateTagInput {
  name?: string;
  color?: string;
}

/**
 * Creates a new tag for a user
 * @param input - Tag creation data
 * @returns Created tag document
 */
export const createTag = async (input: CreateTagInput): Promise<Tag> => {
  try {
    const tag = new Tag({
      name: input.name,
      color: input.color,
      userId: input.userId,
      createdAt: new Date(),
    });
    
    return await tag.save();
  } catch (error) {
    throw new Error(`Failed to create tag: ${error.message}`);
  }
};

/**
 * Gets all tags for a specific user
 * @param userId - User ID to fetch tags for
 * @returns Array of tag documents
 */
export const getUserTags = async (userId: Types.ObjectId): Promise<Tag[]> => {
  try {
    return await Tag.find({ userId }).sort({ name: 1 });
  } catch (error) {
    throw new Error(`Failed to fetch tags: ${error.message}`);
  }
};

/**
 * Gets a specific tag by ID
 * @param tagId - Tag ID to retrieve
 * @param userId - User ID for validation
 * @returns Tag document
 */
export const getTagById = async (tagId: Types.ObjectId, userId: Types.ObjectId): Promise<Tag | null> => {
  try {
    return await Tag.findOne({ _id: tagId, userId });
  } catch (error) {
    throw new Error(`Failed to fetch tag: ${error.message}`);
  }
};

/**
 * Updates an existing tag
 * @param tagId - Tag ID to update
 * @param userId - User ID for validation
 * @param input - Update data
 * @returns Updated tag document
 */
export const updateTag = async (
  tagId: Types.ObjectId,
  userId: Types.ObjectId,
  input: UpdateTagInput
): Promise<Tag | null> => {
  try {
    const updateData: Partial<UpdateTagInput & { updatedAt: Date }> = {
      ...input,
      updatedAt: new Date(),
    };

    return await Tag.findOneAndUpdate(
      { _id: tagId, userId },
      updateData,
      { new: true }
    );
  } catch (error) {
    throw new Error(`Failed to update tag: ${error.message}`);
  }
};

/**
 * Deletes a tag
 * @param tagId - Tag ID to delete
 * @param userId - User ID for validation
 * @returns Deletion result
 */
export const deleteTag = async (tagId: Types.ObjectId, userId: Types.ObjectId): Promise<boolean> => {
  try {
    const result = await Tag.findOneAndDelete({ _id: tagId, userId });
    return !!result;
  } catch (error) {
    throw new Error(`Failed to delete tag: ${error.message}`);
  }
};