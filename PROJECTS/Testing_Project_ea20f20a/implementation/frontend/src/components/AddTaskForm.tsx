import React, { useState } from 'react';
import { ITask } from '../types/task';
import { PlusCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface AddTaskFormProps {
  onAddTask: (task: Omit<ITask, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

const AddTaskForm: React.FC<AddTaskFormProps> = ({ onAddTask }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low'|'medium'|'high'>('low');
  const [category, setCategory] = useState('Inbox');
  const [dueDate, setDueDate] = useState('');
  const [expanded, setExpanded] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAddTask({
      title: title.trim(),
      description: description.trim(),
      completed: false,
      priority,
      category: category.trim() || 'Inbox',
      ...(dueDate ? { dueDate } : {}) // pass dueDate conditionally
    });

    setTitle('');
    setDescription('');
    setPriority('low');
    setCategory('Inbox');
    setDueDate('');
    setExpanded(false);
  };

  return (
    <motion.form 
      layout
      onSubmit={handleSubmit} 
      className="glass-panel p-6 shadow-glass relative group border border-primary/20"
    >
      <div className="flex flex-col gap-4">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What needs to be done?"
          className="w-full bg-transparent text-2xl font-bold text-primaryDark placeholder:text-primaryDark/40 focus:outline-none"
          required
          onFocus={() => setExpanded(true)}
        />
        
        {expanded && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="flex flex-col gap-4 mt-2"
          >
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description (optional)"
              className="input-field resize-none bg-white/40 border-none"
              rows={2}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold text-primaryDark uppercase mb-1 block">Priority</label>
                <select value={priority} onChange={e => setPriority(e.target.value as any)} className="input-field py-2 bg-white/40 border-none w-full">
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-primaryDark uppercase mb-1 block">Due Date</label>
                <input type="datetime-local" value={dueDate} onChange={e => setDueDate(e.target.value)} className="input-field py-2 bg-white/40 border-none w-full" />
              </div>
              <div>
                <label className="text-xs font-bold text-primaryDark uppercase mb-1 block">Category</label>
                <input type="text" value={category} onChange={e => setCategory(e.target.value)} placeholder="e.g. Work" className="input-field py-2 bg-white/40 border-none w-full" />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <button type="button" onClick={() => setExpanded(false)} className="px-4 py-2 text-textMuted font-bold hover:bg-black/5 rounded-xl transition-colors">Cancel</button>
              <button type="submit" className="btn-neon flex items-center gap-2 py-2 px-6">
                <PlusCircle size={20} /> Add Task
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </motion.form>
  );
};

export default AddTaskForm;