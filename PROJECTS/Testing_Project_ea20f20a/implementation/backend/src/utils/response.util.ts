import { Response } from 'express';

/**
 * Standardized API response structure
 */
interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

/**
 * Sends a standardized success response
 * @param res - Express Response object
 * @param data - Data to send in the response
 * @param message - Success message
 * @param statusCode - HTTP status code (default: 200)
 */
export const sendSuccess = <T>(
  res: Response,
  data: T,
  message: string = 'Request successful',
  statusCode: number = 200
): void => {
  const response: ApiResponse<T> = {
    success: true,
    message,
    data
  };
  
  res.status(statusCode).json(response);
};

/**
 * Sends a standardized error response
 * @param res - Express Response object
 * @param error - Error message or object
 * @param message - Custom error message
 * @param statusCode - HTTP status code (default: 500)
 */
export const sendError = (
  res: Response,
  error: string | Error,
  message: string = 'An error occurred',
  statusCode: number = 500
): void => {
  const response: ApiResponse = {
    success: false,
    message,
    error: typeof error === 'string' ? error : error.message
  };

  res.status(statusCode).json(response);
};

/**
 * Sends a standardized validation error response
 * @param res - Express Response object
 * @param errors - Array of validation errors
 * @param message - Custom error message
 * @param statusCode - HTTP status code (default: 400)
 */
export const sendValidationError = (
  res: Response,
  errors: string[],
  message: string = 'Validation failed',
  statusCode: number = 400
): void => {
  const response: ApiResponse<{ errors: string[] }> = {
    success: false,
    message,
    data: { errors }
  };

  res.status(statusCode).json(response);
};