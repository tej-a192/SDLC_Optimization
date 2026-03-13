import React from 'react';
import { FaTrash, FaEdit } from 'react-icons/fa';

/**
 * TaskItem Component
 * Displays individual task with actions to edit/delete
 * @param {Object} props - Component props
 * @param {Object} props.task - Task object containing id, title, description, status, priority, due_date
 * @param {Function} props.onDelete - Function to handle task deletion
 * @param {Function} props.onEdit - Function to handle task editing
 */
const TaskItem = ({ task, onDelete, onEdit }) => {
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'No due date';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Get priority label
  const getPriorityLabel = (priority) => {
    switch (priority) {
      case 1: return 'Low';
      case 2: return 'Medium';
      case 3: return 'High';
      case 4: return 'Urgent';
      case 5: return 'Critical';
      default: return 'None';
    }
  };

  // Get status class for styling
  const getStatusClass = (status) => {
    switch (status) {
      case 'done': return 'status-done';
      case 'in_progress': return 'status-in-progress';
      default: return 'status-todo';
    }
  };

  return (
    <div className="task-item">
      <div className="task-header">
        <h3 className="task-title">{task.title}</h3>
        <div className="task-actions">
          <button 
            className="edit-button" 
            onClick={() => onEdit(task)}
            aria-label={`Edit task: ${task.title}`}
          >
            <FaEdit />
          </button>
          <button 
            className="delete-button" 
            onClick={() => onDelete(task.id)}
            aria-label={`Delete task: ${task.title}`}
          >
            <FaTrash />
          </button>
        </div>
      </div>
      
      <p className="task-description">{task.description || 'No description provided'}</p>
      
      <div className="task-details">
        <div className="task-meta">
          <span className={`status-badge ${getStatusClass(task.status)}`}>
            {task.status.replace('_', ' ')}
          </span>
          <span className="priority-badge">
            Priority: {getPriorityLabel(task.priority)}
          </span>
        </div>
        
        <div className="task-dates">
          <span>Due: {formatDate(task.due_date)}</span>
        </div>
      </div>
    </div>
  );
};

export default TaskItem;