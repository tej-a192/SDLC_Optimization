import React from 'react';
import { ITask } from '../types/task';

interface TaskItemProps {
  task: ITask;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
}

/**
 * TaskItem Component
 * 
 * Displays a single task with toggle completion and delete functionality
 * 
 * @param {TaskItemProps} props - Component properties
 * @returns {JSX.Element} Task item component
 */
const TaskItem: React.FC<TaskItemProps> = ({ task, onToggle, onDelete }) => {
  return (
    <div className="task-item">
      <div className="task-content">
        <input
          type="checkbox"
          checked={task.completed}
          onChange={() => onToggle(task.id)}
          aria-label={`Mark "${task.title}" as ${task.completed ? 'incomplete' : 'complete'}`}
        />
        <span className={task.completed ? 'completed' : ''}>{task.title}</span>
      </div>
      <button 
        onClick={() => onDelete(task.id)}
        aria-label={`Delete task "${task.title}"`}
        className="delete-button"
      >
        Delete
      </button>
    </div>
  );
};

export default TaskItem;