import { Router } from 'express';
import { 
  createTask, 
  getAllTasks, 
  getTaskById, 
  updateTask, 
  deleteTask, 
  toggleTaskCompletion 
} from '../controllers/task.controller';

const router = Router();

/**
 * @route GET /api/tasks
 * @desc Get all tasks
 * @access Public
 */
router.get('/', getAllTasks);

/**
 * @route POST /api/tasks
 * @desc Create a new task
 * @access Public
 */
router.post('/', createTask);

/**
 * @route GET /api/tasks/:id
 * @desc Get a specific task by ID
 * @access Public
 */
router.get('/:id', getTaskById);

/**
 * @route PUT /api/tasks/:id
 * @desc Update a task
 * @access Public
 */
router.put('/:id', updateTask);

/**
 * @route DELETE /api/tasks/:id
 * @desc Delete a task
 * @access Public
 */
router.delete('/:id', deleteTask);

/**
 * @route PATCH /api/tasks/:id/toggle
 * @desc Toggle task completion status
 * @access Public
 */
router.patch('/:id/toggle', toggleTaskCompletion);

export default router;