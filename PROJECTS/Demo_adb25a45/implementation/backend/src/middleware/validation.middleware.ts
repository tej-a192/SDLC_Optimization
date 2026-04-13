import { Request, Response, NextFunction } from 'express';
import { body, validationResult, ValidationChain, param, query } from 'express-validator';

/**
 * Middleware to handle validation results
 * @param req Express request object
 * @param res Express response object
 * @param next Express next function
 */
const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

/**
 * Validation rules for user registration
 */
export const registerValidation = [
  body('username')
    .isString()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  handleValidationErrors
];

/**
 * Validation rules for user login
 */
export const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

/**
 * Validation rules for task creation
 */
export const createTaskValidation = [
  body('title')
    .isString()
    .isLength({ min: 1, max: 100 })
    .withMessage('Title must be between 1 and 100 characters'),
  body('description')
    .optional({ nullable: true })
    .isString()
    .isLength({ max: 1000 })
    .withMessage('Description must be less than 1000 characters'),
  body('status')
    .optional()
    .isIn(['pending', 'in-progress', 'completed'])
    .withMessage("Status must be 'pending', 'in-progress', or 'completed'"),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage("Priority must be 'low', 'medium', or 'high'"),
  body('dueDate')
    .optional({ nullable: true })
    .isISO8601()
    .withMessage('Due date must be a valid ISO 8601 date')
    .toDate(),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array of tag IDs'),
  handleValidationErrors
];

/**
 * Validation rules for task updates
 */
export const updateTaskValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid task ID format'),
  body('title')
    .optional()
    .isString()
    .isLength({ min: 1, max: 100 })
    .withMessage('Title must be between 1 and 100 characters'),
  body('description')
    .optional({ nullable: true })
    .isString()
    .isLength({ max: 1000 })
    .withMessage('Description must be less than 1000 characters'),
  body('status')
    .optional()
    .isIn(['pending', 'in-progress', 'completed'])
    .withMessage("Status must be 'pending', 'in-progress', or 'completed'"),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage("Priority must be 'low', 'medium', or 'high'"),
  body('dueDate')
    .optional({ nullable: true })
    .isISO8601()
    .withMessage('Due date must be a valid ISO 8601 date')
    .toDate(),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array of tag IDs'),
  handleValidationErrors
];

/**
 * Validation rules for getting a task by ID
 */
export const getTaskValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid task ID format'),
  handleValidationErrors
];

/**
 * Validation rules for deleting a task
 */
export const deleteTaskValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid task ID format'),
  handleValidationErrors
];

/**
 * Validation rules for creating a tag
 */
export const createTagValidation = [
  body('name')
    .isString()
    .isLength({ min: 1, max: 30 })
    .withMessage('Tag name must be between 1 and 30 characters'),
  body('color')
    .optional()
    .isHexColor()
    .withMessage('Color must be a valid hex color code'),
  handleValidationErrors
];

/**
 * Validation rules for updating a tag
 */
export const updateTagValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid tag ID format'),
  body('name')
    .optional()
    .isString()
    .isLength({ min: 1, max: 30 })
    .withMessage('Tag name must be between 1 and 30 characters'),
  body('color')
    .optional()
    .isHexColor()
    .withMessage('Color must be a valid hex color code'),
  handleValidationErrors
];

/**
 * Validation rules for deleting a tag
 */
export const deleteTagValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid tag ID format'),
  handleValidationErrors
];

/**
 * Validation rules for task filtering and searching
 */
export const taskFilterValidation = [
  query('status')
    .optional()
    .isIn(['pending', 'in-progress', 'completed'])
    .withMessage("Status must be 'pending', 'in-progress', or 'completed'"),
  query('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage("Priority must be 'low', 'medium', or 'high'"),
  query('search')
    .optional()
    .isString()
    .withMessage('Search term must be a string'),
  query('sortBy')
    .optional()
    .isIn(['createdAt', 'dueDate', 'priority'])
    .withMessage("SortBy must be 'createdAt', 'dueDate', or 'priority'"),
  query('order')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage("Order must be 'asc' or 'desc'"),
  handleValidationErrors
];