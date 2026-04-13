import { Router } from 'express';
import { 
  createTag, 
  getTags, 
  updateTag, 
  deleteTag 
} from '../controllers/tag.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

/**
 * @route   POST /api/tags
 * @desc    Create a new tag
 * @access  Private
 */
router.post('/', authenticate, createTag);

/**
 * @route   GET /api/tags
 * @desc    Get all tags for the authenticated user
 * @access  Private
 */
router.get('/', authenticate, getTags);

/**
 * @route   PUT /api/tags/:id
 * @desc    Update a tag by ID
 * @access  Private
 */
router.put('/:id', authenticate, updateTag);

/**
 * @route   DELETE /api/tags/:id
 * @desc    Delete a tag by ID
 * @access  Private
 */
router.delete('/:id', authenticate, deleteTag);

export default router;