/**
 * Task Interface
 * Represents the structure of a task entity in the to-do application
 */

export interface ITask {
  /**
   * Unique identifier for the task
   */
  id: number;

  /**
   * Title of the task
   */
  title: string;

  /**
   * Detailed description of the task (optional)
   */
  description?: string;

  /**
   * Completion status of the task
   */
  completed: boolean;

  /**
   * Timestamp when the task was created
   */
  createdAt: Date;

  /**
   * Timestamp when the task was last updated
   */
  updatedAt: Date;
}

/**
 * Task Creation Interface
 * Used when creating a new task (id, createdAt, updatedAt are auto-generated)
 */
export interface ITaskCreate {
  /**
   * Title of the task
   */
  title: string;

  /**
   * Detailed description of the task (optional)
   */
  description?: string;

  /**
   * Initial completion status (defaults to false)
   */
  completed?: boolean;
}

/**
 * Task Update Interface
 * Used when updating an existing task
 */
export interface ITaskUpdate {
  /**
   * Title of the task (optional)
   */
  title?: string;

  /**
   * Detailed description of the task (optional)
   */
  description?: string;

  /**
   * Completion status of the task (optional)
   */
  completed?: boolean;
}