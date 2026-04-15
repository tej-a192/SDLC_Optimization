import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ITask } from '../types/task';
import AddTaskForm from '../components/AddTaskForm';
import TaskItem from '../components/TaskItem';
import { motion, AnimatePresence } from 'framer-motion';

const TasksPage: React.FC = () => {
  const [tasks, setTasks] = useState<ITask[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'today' | 'important'>('all');

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/tasks');
      setTasks(res.data);
    } catch (err) {
      setError('Failed to fetch tasks');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = async (taskData: Omit<ITask, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const response = await axios.post('/api/tasks', taskData);
      setTasks([response.data, ...tasks]);
    } catch (err) {
      setError('Failed to add task');
      console.error(err);
    }
  };

  const handleToggleTask = async (id: string) => {
    try {
      await axios.patch(`/api/tasks/${id}/toggle`);
      setTasks(tasks.map(t =>(t.id === id ? { ...t, completed: !t.completed } : t)));
    } catch (err) {
      setError('Failed to update task');
      console.error(err);
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      await axios.delete(`/api/tasks/${id}`);
      setTasks(tasks.filter(t => t.id !== id));
    } catch (err) {
      setError('Failed to delete task');
      console.error(err);
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (activeTab === 'all') return true;
    if (activeTab === 'important') return task.priority === 'high';
    if (activeTab === 'today') {
      if (!task.dueDate) return false;
      const due = new Date(task.dueDate);
      const today = new Date();
      return due.toDateString() === today.toDateString();
    }
    return true;
  });

  return (
    <div className="container mx-auto px-6 py-12 max-w-4xl">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-4xl font-black text-primaryDark mb-2">My Tasks</h1>
          <p className="text-textMuted font-medium">Keep your focus crystal clear.</p>
        </div>
      </div>

      <AddTaskForm onAddTask={handleAddTask} />

      {error && <div className="p-4 bg-red-100 text-red-600 rounded-xl my-6">{error}</div>}

      <div className="flex gap-4 mt-12 mb-6 border-b-2 border-primary/20 pb-2">
        {(['all', 'today', 'important'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-bold capitalize transition-colors relative ${activeTab === tab ? 'text-primaryDark' : 'text-textMuted hover:text-primaryDark'}`}
          >
            {tab}
            {activeTab === tab && (
              <motion.div layoutId="taskTab" className="absolute bottom-[-10px] left-0 w-full h-1 bg-primary shadow-neon rounded-full" />
            )}
          </button>
        ))}
      </div>

      <div className="mt-6 flex flex-col gap-4">
        {loading ? (
           <div className="text-center py-20 animate-pulse text-primaryDark font-bold">Synchronizing with MongoDB...</div>
        ) : filteredTasks.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} 
            className="text-center py-20 glass-panel"
          >
            <h3 className="text-2xl font-bold text-primaryDark">Clear skies!</h3>
            <p className="text-textMuted">No tasks found in this view.</p>
          </motion.div>
        ) : (
          <AnimatePresence>
            {filteredTasks.map(task => (
              <TaskItem 
                key={task.id} 
                task={task} 
                onToggle={handleToggleTask} 
                onDelete={handleDeleteTask} 
              />
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export default TasksPage;