import { Request, Response } from 'express';
import { Tag } from '../models/tag.model';
import { AuthRequest } from '../middleware/auth.middleware';

/**
 * Create a new tag
 * @param req - Express request object
 * @param res - Express response object
 */
export const createTag = async (req: AuthRequest, res: Response) => {
  try {
    const { name, color } = req.body;
    const userId = req.user!._id;

    const tag = new Tag({
      name,
      color,
      userId
    });

    await tag.save();
    res.status(201).json({ success: true, data: tag });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create tag', error });
  }
};

/**
 * Get all tags for the authenticated user
 * @param req - Express request object
 * @param res - Express response object
 */
export const getUserTags = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!._id;
    const tags = await Tag.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: tags });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to retrieve tags', error });
  }
};

/**
 * Update a tag by ID
 * @param req - Express request object
 * @param res - Express response object
 */
export const updateTag = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, color } = req.body;
    const userId = req.user!._id;

    const tag = await Tag.findOneAndUpdate(
      { _id: id, userId },
      { name, color },
      { new: true, runValidators: true }
    );

    if (!tag) {
      return res.status(404).json({ success: false, message: 'Tag not found' });
    }

    res.status(200).json({ success: true, data: tag });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update tag', error });
  }
};

/**
 * Delete a tag by ID
 * @param req - Express request object
 * @param res - Express response object
 */
export const deleteTag = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!._id;

    const tag = await Tag.findOneAndDelete({ _id: id, userId });

    if (!tag) {
      return res.status(404).json({ success: false, message: 'Tag not found' });
    }

    res.status(200).json({ success: true, message: 'Tag deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete tag', error });
  }
};