import { Task, ITask } from '../models/task.model';

class TaskService {
  async getAllTasks(): Promise<ITask[]> {
    return Task.find().sort({ createdAt: -1 });
  }

  async getTaskById(id: string): Promise<ITask | null> {
    return Task.findById(id);
  }

  async createTask(data: Partial<ITask>): Promise<ITask> {
    if (!data.title?.trim()) {
      throw new Error('Task title cannot be empty');
    }
    const task = new Task({ ...data });
    return task.save();
  }

  async updateTask(id: string, updates: Partial<ITask>): Promise<ITask | null> {
    return Task.findByIdAndUpdate(id, updates, { new: true });
  }

  async deleteTask(id: string): Promise<boolean> {
    const result = await Task.findByIdAndDelete(id);
    return result !== null;
  }

  async toggleTaskCompletion(id: string): Promise<ITask | null> {
    const task = await Task.findById(id);
    if (!task) return null;
    task.completed = !task.completed;
    return task.save();
  }
}

export default new TaskService();