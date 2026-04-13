// backend/src/config/constants.ts

/**
 * Application-wide constants for TaskFlow
 */

// JWT Constants
export const JWT_SECRET = process.env.JWT_SECRET || 'taskflow-secret-key';
export const JWT_EXPIRES_IN = '24h';

// Password Constants
export const MIN_PASSWORD_LENGTH = 8;

// Task Status Constants
export const TASK_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in-progress',
  COMPLETED: 'completed'
} as const;

// Task Priority Constants
export const TASK_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high'
} as const;

// Default Pagination Values
export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 100;

// Tag Color Constants
export const DEFAULT_TAG_COLOR = '#808080'; // Gray

// Notification Constants
export const NOTIFICATION_TYPES = {
  TASK_DUE_SOON: 'task_due_soon',
  TASK_OVERDUE: 'task_overdue',
  TASK_COMPLETED: 'task_completed'
} as const;

// Date Format Constants
export const DATE_FORMAT = 'YYYY-MM-DD';
export const DATETIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';

// Email Constants
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Rate Limiting Constants
export const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
export const RATE_LIMIT_MAX_REQUESTS = 100; // limit each IP to 100 requests per windowMs

// CORS Constants
export const CORS_OPTIONS = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
};