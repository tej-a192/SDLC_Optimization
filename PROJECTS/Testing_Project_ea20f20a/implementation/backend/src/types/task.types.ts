export interface ITask {
  id: number;
  title: string;
  description?: string;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type TaskCreationParams = Pick<ITask, 'title' | 'description'>;

export type TaskUpdateParams = Partial<Pick<ITask, 'title' | 'description' | 'completed'>>;