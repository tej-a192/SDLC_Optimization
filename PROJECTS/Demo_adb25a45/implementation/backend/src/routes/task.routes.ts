import { Router, Request, Response, NextFunction } from 'express';
import { TaskController } from '../controllers/task.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();
const taskController = new TaskController();

/**
 * @route   GET /api/tasks
 * @desc    Get all tasks for the authenticated user
 * @access  Private
 */
router.get('/', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user._id;
    const tasks = await taskController.getAllTasks(userId);
    res.status(200).json({ success: true, data: tasks });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/tasks/:id
 * @desc    Get a specific task by ID for the authenticated user
 * @access  Private
 */
router.get('/:id', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user._id;
    const taskId = req.params.id;
    const task = await taskController.getTaskById(taskId, userId);
    res.status(200).json({ success: true, data: task });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/tasks
 * @desc    Create a new task for the authenticated user
 * @access  Private
 */
router.post('/', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user._id;
    const taskData = { ...req.body, userId };
    const newTask = await taskController.createTask(taskData);
    res.status(201).json({ success: true, data: newTask });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   PUT /api/tasks/:id
 * @desc    Update an existing task by ID for the authenticated user
 * @access  Private
 */
router.put('/:id', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user._id;
    const taskId = req.params.id;
    const updateData = req.body;
    const updatedTask = await taskController.updateTask(taskId, updateData, userId);
    res.status(200).json({ success: true, data: updatedTask });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   DELETE /api/tasks/:id
 * @desc    Delete a specific task by ID for the authenticated user
 * @access  Private
 */
router.delete('/:id', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user._id;
    const taskId = req.params.id;
    await taskController.deleteTask(taskId, userId);
    res.status(200).json({ success: true, message: 'Task deleted successfully' });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   DELETE /api/tasks
 * @desc    Delete all completed tasks for the authenticated user
 * @access  Private
 */
router.delete('/', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user._id;
    await taskController.deleteAllCompletedTasks(userId);
    res.status(200).json({ success: true, message: 'All completed tasks deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;