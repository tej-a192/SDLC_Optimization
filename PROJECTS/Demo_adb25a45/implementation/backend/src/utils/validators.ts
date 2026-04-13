import { Types } from 'mongoose';

/**
 * Validates if a string is a valid email format
 * @param email - Email string to validate
 * @returns True if valid email, false otherwise
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validates if a string meets password requirements
 * - At least 8 characters long
 * - Contains at least one uppercase letter
 * - Contains at least one lowercase letter
 * - Contains at least one number
 * @param password - Password string to validate
 * @returns True if valid password, false otherwise
 */
export function isValidPassword(password: string): boolean {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
}

/**
 * Validates if a string is a valid MongoDB ObjectId
 * @param id - String to validate
 * @returns True if valid ObjectId, false otherwise
 */
export function isValidObjectId(id: string): boolean {
  return Types.ObjectId.isValid(id);
}

/**
 * Validates task priority value
 * @param priority - Priority string to validate
 * @returns True if valid priority, false otherwise
 */
export function isValidPriority(priority: string): boolean {
  return ['low', 'medium', 'high'].includes(priority);
}

/**
 * Validates task status value
 * @param status - Status string to validate
 * @returns True if valid status, false otherwise
 */
export function isValidStatus(status: string): boolean {
  return ['pending', 'in-progress', 'completed'].includes(status);
}

/**
 * Validates if a string is not empty and within a maximum length
 * @param str - String to validate
 * @param maxLength - Maximum allowed length
 * @returns True if valid, false otherwise
 */
export function isValidString(str: string, maxLength: number): boolean {
  return typeof str === 'string' && str.trim().length > 0 && str.length <= maxLength;
}

/**
 * Validates if a date is in the future
 * @param date - Date to validate
 * @returns True if valid future date, false otherwise
 */
export function isValidFutureDate(date: Date): boolean {
  return date instanceof Date && !isNaN(date.getTime()) && date > new Date();
}