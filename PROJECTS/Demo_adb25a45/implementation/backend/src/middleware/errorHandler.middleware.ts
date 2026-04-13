import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { MongoError } from 'mongodb';

/**
 * Generic error response interface
 */
interface ErrorResponse {
  success: false;
  message: string;
  statusCode: number;
  stack?: string;
}

/**
 * Handles all application errors globally
 * @param err - The error object
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 */
const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let message = err.message || 'Internal Server Error';
  let statusCode = 500;

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    message = err.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
    statusCode = 400;
  }

  // Handle MongoDB duplicate key errors
  else if (err instanceof MongoError && err.code === 11000) {
    message = 'Duplicate field value entered';
    statusCode = 400;
  }

  // Handle MongoDB validation errors
  else if (err.name === 'ValidationError') {
    message = Object.values(err).map(val => val.message).join(', ');
    statusCode = 400;
  }

  // Handle JWT errors
  else if (err.name === 'JsonWebTokenError') {
    message = 'Invalid token';
    statusCode = 401;
  }

  // Handle expired JWT tokens
  else if (err.name === 'TokenExpiredError') {
    message = 'Token expired';
    statusCode = 401;
  }

  // Development vs Production error response
  const response: ErrorResponse = {
    success: false,
    message,
    statusCode,
  };

  // Include stack trace only in development mode
  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

export default errorHandler;