import { ITask } from '../models/task.model';

/**
 * Service class for managing tasks
 */
class TaskService {
  private tasks: ITask[] = [];
  private nextId: number = 1;

  /**
   * Get all tasks
   * @returns Array of all tasks
   */
  getAllTasks(): ITask[] {
    return this.tasks;
  }

  /**
   * Get a specific task by ID
   * @param id - Task ID
   * @returns Task object or null if not found
   */
  getTaskById(id: number): ITask | null {
    const task = this.tasks.find(task => task.id === id);
    return task || null;
  }

  /**
   * Create a new task
   * @param title - Task title
   * @param description - Task description
   * @returns Created task object
   */
  createTask(title: string, description?: string): ITask {
    if (!title.trim()) {
      throw new Error('Task title cannot be empty');
    }

    const newTask: ITask = {
      id: this.nextId++,
      title: title.trim(),
      description: description?.trim(),
      completed: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.tasks.push(newTask);
    return newTask;
  }

  /**
   * Update an existing task
   * @param id - Task ID
   * @param updates - Object containing fields to update
   * @returns Updated task object or null if not found
   */
  updateTask(id: number, updates: Partial<Omit<ITask, 'id' | 'createdAt'>>): ITask | null {
    const taskIndex = this.tasks.findIndex(task => task.id === id);
    
    if (taskIndex === -1) {
      return null;
    }

    // Validate title if provided
    if (updates.title !== undefined && !updates.title.trim()) {
      throw new Error('Task title cannot be empty');
    }

    const updatedTask = {
      ...this.tasks[taskIndex],
      ...updates,
      title: updates.title ? updates.title.trim() : this.tasks[taskIndex].title,
      description: updates.description ? updates.description.trim() : this.tasks[taskIndex].description,
      updatedAt: new Date()
    };

    this.tasks[taskIndex] = updatedTask;
    return updatedTask;
  }

  /**
   * Delete a task by ID
   * @param id - Task ID
   * @returns True if deletion was successful, false otherwise
   */
  deleteTask(id: number): boolean {
    const taskIndex = this.tasks.findIndex(task => task.id === id);
    
    if (taskIndex === -1) {
      return false;
    }

    this.tasks.splice(taskIndex, 1);
    return true;
  }

  /**
   * Toggle task completion status
   * @param id - Task ID
   * @returns Updated task object or null if not found
   */
  toggleTaskCompletion(id: number): ITask | null {
    const task = this.getTaskById(id);
    
    if (!task) {
      return null;
    }

    return this.updateTask(id, { completed: !task.completed });
  }
}

export default new TaskService();