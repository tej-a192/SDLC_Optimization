import React, { useState } from 'react';
import { ITask } from '../types/task';

interface AddTaskFormProps {
  onAddTask: (task: Omit<ITask, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

/**
 * Component for adding new tasks
 * @param onAddTask - Callback function to handle task creation
 */
const AddTaskForm: React.FC<AddTaskFormProps> = ({ onAddTask }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      alert('Title is required');
      return;
    }

    onAddTask({
      title: title.trim(),
      description: description.trim(),
      completed: false
    });

    // Reset form
    setTitle('');
    setDescription('');
  };

  return (
    <form onSubmit={handleSubmit} className="add-task-form">
      <div className="form-group">
        <label htmlFor="task-title">Title *</label>
        <input
          id="task-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter task title"
          required
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="task-description">Description</label>
        <textarea
          id="task-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter task description (optional)"
          rows={3}
        />
      </div>
      
      <button type="submit" className="btn-primary">
        Add Task
      </button>
    </form>
  );
};

export default AddTaskForm;