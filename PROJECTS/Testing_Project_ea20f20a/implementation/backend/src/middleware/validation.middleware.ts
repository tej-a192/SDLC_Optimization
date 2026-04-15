import { Request, Response, NextFunction } from 'express';
import { body, validationResult, param } from 'express-validator';

/**
 * Validation rules for creating/updating a task
 */
export const taskValidationRules = () => {
  return [
    body('title')
      .isString()
      .withMessage('Title must be a string')
      .trim()
      .notEmpty()
      .withMessage('Title is required')
      .isLength({ max: 255 })
      .withMessage('Title must be at most 255 characters long'),
    body('description')
      .optional({ nullable: true })
      .isString()
      .withMessage('Description must be a string')
      .trim(),
    body('completed')
      .optional()
      .isBoolean()
      .withMessage('Completed must be a boolean value')
  ];
};

/**
 * Validation rules for task ID parameter
 */
export const taskIdValidationRule = () => {
  return [
    param('id')
      .isString()
      .withMessage('ID must be a valid string')
      .isLength({ min: 10 })
      .withMessage('ID must be a valid length')
  ];
};

/**
 * Middleware to check for validation errors
 */
export const validate = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
    return;
  }
  
  next();
};