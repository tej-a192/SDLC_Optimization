/**
 * @typedef {Object} User
 * @property {string} id - UUID of the user
 * @property {string} email - User's email address
 * @property {boolean} is_active - Whether the user account is active
 * @property {boolean} is_superuser - Whether the user has superuser privileges
 * @property {Date} created_at - Account creation timestamp
 * @property {Date} updated_at - Last update timestamp
 */

/**
 * @typedef {Object} Task
 * @property {string} id - UUID of the task
 * @property {string} title - Task title
 * @property {string} description - Detailed task description
 * @property {('todo'|'in_progress'|'done')} status - Current task status
 * @property {number} priority - Priority level (1-5)
 * @property {Date} due_date - Task deadline
 * @property {string} owner_id - UUID of the task owner
 * @property {Date} created_at - Task creation timestamp
 * @property {Date} updated_at - Last update timestamp
 */

/**
 * @typedef {Object} Tag
 * @property {string} id - UUID of the tag
 * @property {string} name - Tag name
 * @property {string} color - Hex color code for the tag
 * @property {Date} created_at - Tag creation timestamp
 */