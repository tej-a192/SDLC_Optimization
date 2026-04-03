import { Request, Response, NextFunction } from 'express';

/**
 * Global error handling middleware
 * Catches synchronous and asynchronous errors and returns a standardized response
 */
const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Default error values
  let statusCode = 500;
  let message = 'Internal Server Error';
  
  // Log the error for debugging purposes
  console.error(err);

  // Handle specific known error types
  if (err.type === 'validation') {
    statusCode = 400;
    message = err.message || 'Validation Error';
  } else if (err.type === 'not_found') {
    statusCode = 404;
    message = err.message || 'Resource Not Found';
  } else if (err.type === 'unauthorized') {
    statusCode = 401;
    message = err.message || 'Unauthorized Access';
  } else if (err.type === 'forbidden') {
    statusCode = 403;
    message = err.message || 'Access Forbidden';
  } else {
    // For all other errors, use the error message if available
    message = err.message || message;
  }

  // Send standardized error response
  res.status(statusCode).json({
    success: false,
    error: {
      message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
};

export default errorHandler;