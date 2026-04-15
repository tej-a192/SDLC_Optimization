import React, { useMemo } from 'react';
import { ITask } from '../types/task';
import { Calendar as CalendarIcon, Trash2, CheckCircle, Circle, Tag } from 'lucide-react';
import { motion } from 'framer-motion';

interface TaskItemProps {
  task: ITask;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

const parseDateForGCAL = (dateStr: string) => {
  const d = new Date(dateStr);
  return d.toISOString().replace(/-|:|\.\d\d\d/g, '');
};

const TaskItem: React.FC<TaskItemProps> = ({ task, onToggle, onDelete }) => {
  const priorityColor = {
    high: 'text-red-500 bg-red-100',
    medium: 'text-amber-500 bg-amber-100',
    low: 'text-blue-500 bg-blue-100'
  }[task.priority];

  const gcalLink = useMemo(() => {
    if (!task.dueDate) return null;
    const start = parseDateForGCAL(task.dueDate);
    // Add 1 hour by default for end time
    const end = parseDateForGCAL(new Date(new Date(task.dueDate).getTime() + 60*60*1000).toISOString());
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(task.title)}&dates=${start}/${end}&details=${encodeURIComponent(task.description || '')}`;
  }, [task]);

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={`group relative glass-panel p-5 transition-all duration-300 hover:shadow-neon ${task.completed ? 'opacity-60 bg-white/20' : 'bg-white/70'}`}
    >
      <div className="flex items-start gap-4">
        <button onClick={() => onToggle(task.id)} className="mt-1 flex-shrink-0 text-primaryDark hover:text-primary transition-colors">
          {task.completed ? <CheckCircle size={28} className="text-secondary" /> : <Circle size={28} />}
        </button>
        
        <div className="flex-grow">
          <h3 className={`text-xl font-bold transition-all ${task.completed ? 'line-through text-textMuted' : 'text-primaryDark'}`}>
            {task.title}
          </h3>
          {task.description && (
            <p className="text-textMuted/80 text-sm mt-1">{task.description}</p>
          )}
          
          <div className="flex flex-wrap items-center gap-3 mt-4 text-xs font-bold">
            <span className={`px-2 py-1 rounded-md uppercase tracking-wider ${priorityColor}`}>
              {task.priority}
            </span>
            <span className="flex items-center gap-1 text-primaryDark bg-primary/20 px-2 py-1 rounded-md">
              <Tag size={14} /> {task.category}
            </span>
            
            {task.dueDate && (
              <span className="flex items-center gap-1 text-primaryDark bg-secondary/30 px-2 py-1 rounded-md">
                <CalendarIcon size={14} /> 
                {new Date(task.dueDate).toLocaleString(undefined, {
                  month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
                })}
              </span>
            )}

            {gcalLink && !task.completed && (
              <a 
                href={gcalLink} 
                target="_blank" 
                rel="noreferrer"
                className="opacity-0 group-hover:opacity-100 transition-opacity ml-auto text-primaryDark underline hover:text-seaGreen flex items-center gap-1"
              >
                <CalendarIcon size={14} /> Add to GCal
              </a>
            )}
          </div>
        </div>

        <button 
          onClick={() => onDelete(task.id)}
          className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-600 p-2"
        >
          <Trash2 size={20} />
        </button>
      </div>
    </motion.div>
  );
};

export default TaskItem;