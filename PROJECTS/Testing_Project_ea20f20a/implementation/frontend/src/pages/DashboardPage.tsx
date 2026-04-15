import { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RTooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  RadialBarChart, RadialBar
} from 'recharts';
import {
  Activity, Target, CheckCircle2, Clock, AlertTriangle,
  TrendingUp, Inbox, Star, Calendar, List
} from 'lucide-react';
import { ITask } from '../types/task';

interface AnalyticsData {
  total: number;
  completed: number;
  pending: number;
  completionRate: number;
  byCategory: { name: string; value: number }[];
  byPriority: { name: string; value: number }[];
}

const PALETTE = ['#2e8b57', '#adff2f', '#90ee90', '#4a5d23', '#d4f9a1'];

// Custom tooltip for charts
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-panel px-4 py-3 bg-white/90 text-sm shadow-neon">
        <p className="font-bold text-primaryDark">{label || payload[0]?.name}</p>
        <p className="text-textMuted">Tasks: <span className="font-bold text-primaryDark">{payload[0]?.value}</span></p>
      </div>
    );
  }
  return null;
};

const StatCard = ({
  title, value, subtitle, icon, accent = false, color
}: {
  title: string; value: string | number; subtitle?: string;
  icon: React.ReactNode; accent?: boolean; color?: string;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={`glass-panel p-6 flex flex-col justify-between h-44 ${accent ? 'bg-primaryDark' : 'bg-white/80'} border-l-4`}
    style={{ borderLeftColor: color || '#adff2f' }}
  >
    <div className={`flex justify-between items-start ${accent ? 'text-primary' : 'text-primaryDark'}`}>
      <h3 className="font-semibold text-base">{title}</h3>
      <div className={`p-2 rounded-lg ${accent ? 'bg-primary/20' : 'bg-primary/10'}`}>{icon}</div>
    </div>
    <div>
      <div className={`text-5xl font-black ${accent ? 'text-primary' : 'text-primaryDark'}`}>{value}</div>
      {subtitle && <div className={`text-sm mt-1 font-medium ${accent ? 'text-secondary/70' : 'text-textMuted'}`}>{subtitle}</div>}
    </div>
  </motion.div>
);

const DashboardPage = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [tasks, setTasks] = useState<ITask[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [analyticsRes, tasksRes] = await Promise.all([
          axios.get('/api/analytics'),
          axios.get('/api/tasks'),
        ]);
        setAnalytics(analyticsRes.data);
        setTasks(tasksRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  if (loading || !analytics) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-primaryDark font-bold">Loading analytics...</p>
        </div>
      </div>
    );
  }

  // Derived data from full task list
  const overdueTasks = tasks.filter(t => !t.completed && t.dueDate && new Date(t.dueDate) < new Date());
  const dueTodayTasks = tasks.filter(t => {
    if (!t.dueDate || t.completed) return false;
    const d = new Date(t.dueDate);
    const today = new Date();
    return d.toDateString() === today.toDateString();
  });
  const highPriorityPending = tasks.filter(t => !t.completed && t.priority === 'high');

  const categoryBarData = analytics.byCategory.map(c => ({
    name: c.name.length > 10 ? c.name.slice(0, 10) + '…' : c.name,
    tasks: c.value,
  }));

  const completionGaugeData = [
    { name: 'Completed', value: analytics.completionRate, fill: '#adff2f' },
    { name: 'Remaining', value: 100 - analytics.completionRate, fill: '#e5e7eb' },
  ];

  // Recent activity (last 5 tasks by creation date)
  const recentTasks = [...tasks]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);



  return (
    <div className="container mx-auto px-6 py-12 max-w-7xl">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-4xl md:text-5xl font-black text-primaryDark mb-2">Command Center</h1>
        <p className="text-textMuted font-medium text-lg">Your complete productivity overview — updated in real time.</p>
      </div>

      {/* ═══ Row 1: Stat Cards ═══ */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard title="Total Tasks" value={analytics.total} subtitle="All time" icon={<List size={22} />} />
        <StatCard title="Completed" value={analytics.completed} subtitle="Tasks done" icon={<CheckCircle2 size={22} />} color="#2e8b57" />
        <StatCard title="Pending" value={analytics.pending} subtitle="Still to do" icon={<Clock size={22} />} color="#90ee90" />
        <StatCard title="Completion Rate" value={`${analytics.completionRate}%`} subtitle="Overall" icon={<Target size={22} />} accent color="#adff2f" />
      </div>

      {/* ═══ Row 2: Alerts + Gauge ═══ */}
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        {/* Urgent Alerts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="glass-panel p-6 bg-white/80 md:col-span-2 space-y-4"
        >
          <h2 className="text-xl font-bold text-primaryDark flex items-center gap-2">
            <AlertTriangle size={20} className="text-amber-500" /> Needs Your Attention
          </h2>

          {overdueTasks.length === 0 && dueTodayTasks.length === 0 && highPriorityPending.length === 0 ? (
            <div className="flex items-center gap-3 p-4 bg-primary/10 rounded-xl text-primaryDark font-semibold">
              <CheckCircle2 size={20} /> You are all caught up! No urgent items.
            </div>
          ) : (
            <div className="space-y-3">
              {overdueTasks.length > 0 && (
                <div className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-xl">
                  <span className="font-bold text-red-700 flex items-center gap-2">
                    <AlertTriangle size={18} /> {overdueTasks.length} Overdue Task{overdueTasks.length > 1 ? 's' : ''}
                  </span>
                  <span className="text-red-500 text-sm font-medium">Past due date</span>
                </div>
              )}
              {dueTodayTasks.length > 0 && (
                <div className="flex items-center justify-between p-4 bg-amber-50 border border-amber-200 rounded-xl">
                  <span className="font-bold text-amber-700 flex items-center gap-2">
                    <Calendar size={18} /> {dueTodayTasks.length} Due Today
                  </span>
                  <span className="text-amber-500 text-sm font-medium">Act now</span>
                </div>
              )}
              {highPriorityPending.length > 0 && (
                <div className="flex items-center justify-between p-4 bg-orange-50 border border-orange-200 rounded-xl">
                  <span className="font-bold text-orange-700 flex items-center gap-2">
                    <Star size={18} /> {highPriorityPending.length} High-Priority Pending
                  </span>
                  <span className="text-orange-500 text-sm font-medium">Needs focus</span>
                </div>
              )}
            </div>
          )}
        </motion.div>

        {/* Completion Gauge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="glass-panel p-6 bg-white/80 flex flex-col items-center justify-center"
        >
          <h2 className="text-xl font-bold text-primaryDark mb-4 self-start">Completion Rate</h2>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="100%" data={completionGaugeData} startAngle={90} endAngle={-270}>
                <RadialBar dataKey="value" cornerRadius={8} />
              </RadialBarChart>
            </ResponsiveContainer>
          </div>
          <div className="text-4xl font-black text-primaryDark -mt-8">{analytics.completionRate}%</div>
          <div className="text-textMuted text-sm mt-1">{analytics.completed} of {analytics.total} tasks done</div>
        </motion.div>
      </div>

      {/* ═══ Row 3: Bar Chart + Pie Chart ═══ */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Category Bar Chart */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }}
          className="glass-panel p-8 bg-white/80"
        >
          <h2 className="text-xl font-bold text-primaryDark mb-6 flex items-center gap-2">
            <Inbox size={20} /> Tasks by Category
          </h2>
          {categoryBarData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-textMuted">No categories yet</div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryBarData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#90ee9040" />
                  <XAxis dataKey="name" tick={{ fill: '#4a5d23', fontWeight: 600, fontSize: 12 }} />
                  <YAxis tick={{ fill: '#4a5d23', fontSize: 12 }} allowDecimals={false} />
                  <RTooltip content={<CustomTooltip />} />
                  <Bar dataKey="tasks" radius={[6, 6, 0, 0]}>
                    {categoryBarData.map((_, index) => (
                      <Cell key={index} fill={PALETTE[index % PALETTE.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </motion.div>

        {/* Priority Donut */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 }}
          className="glass-panel p-8 bg-white/80"
        >
          <h2 className="text-xl font-bold text-primaryDark mb-6 flex items-center gap-2">
            <Activity size={20} /> Tasks by Priority
          </h2>
          {analytics.byPriority.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-textMuted">No data yet</div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={analytics.byPriority} innerRadius={70} outerRadius={110} paddingAngle={5} dataKey="value" nameKey="name">
                    {analytics.byPriority.map((entry, index) => {
                      const c = entry.name === 'high' ? '#ef4444' : entry.name === 'medium' ? '#f59e0b' : '#adff2f';
                      return <Cell key={index} fill={c} />;
                    })}
                  </Pie>
                  <RTooltip content={<CustomTooltip />} />
                  <Legend formatter={(v) => <span className="capitalize font-semibold text-primaryDark">{v}</span>} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </motion.div>
      </div>

      {/* ═══ Row 4: Recent Activity + Quick Stats ═══ */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Recent Tasks */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
          className="glass-panel p-6 bg-white/80 md:col-span-2"
        >
          <h2 className="text-xl font-bold text-primaryDark mb-5 flex items-center gap-2">
            <TrendingUp size={20} /> Recently Added
          </h2>
          {recentTasks.length === 0 ? (
            <div className="text-textMuted text-center py-8">No tasks added yet.</div>
          ) : (
            <div className="space-y-3">
              {recentTasks.map(task => {
                const priorityColor = task.priority === 'high' ? 'bg-red-100 text-red-700' : task.priority === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700';
                return (
                  <div key={task.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-primary/5 transition-colors">
                    <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${task.completed ? 'bg-primary' : 'bg-textMuted/30'}`} />
                    <span className={`flex-grow font-medium ${task.completed ? 'line-through text-textMuted' : 'text-primaryDark'}`}>
                      {task.title}
                    </span>
                    <span className={`text-xs font-bold px-2 py-1 rounded-md capitalize flex-shrink-0 ${priorityColor}`}>
                      {task.priority}
                    </span>
                    <span className="text-xs text-textMuted flex-shrink-0">
                      {new Date(task.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Quick Stats Side Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
          className="space-y-4"
        >
          {[
            {
              label: 'High Priority',
              value: tasks.filter(t => t.priority === 'high').length,
              sub: `${tasks.filter(t => t.priority === 'high' && t.completed).length} completed`,
              color: '#ef4444'
            },
            {
              label: 'Medium Priority',
              value: tasks.filter(t => t.priority === 'medium').length,
              sub: `${tasks.filter(t => t.priority === 'medium' && t.completed).length} completed`,
              color: '#f59e0b'
            },
            {
              label: 'Low Priority',
              value: tasks.filter(t => t.priority === 'low').length,
              sub: `${tasks.filter(t => t.priority === 'low' && t.completed).length} completed`,
              color: '#adff2f'
            },
            {
              label: 'With Due Dates',
              value: tasks.filter(t => t.dueDate).length,
              sub: `${tasks.filter(t => t.dueDate && !t.completed).length} still pending`,
              color: '#2e8b57'
            },
          ].map((item, i) => (
            <div key={i} className="glass-panel px-5 py-4 bg-white/80 flex items-center justify-between border-l-4" style={{ borderLeftColor: item.color }}>
              <div>
                <div className="font-semibold text-primaryDark">{item.label}</div>
                <div className="text-xs text-textMuted">{item.sub}</div>
              </div>
              <div className="text-3xl font-black text-primaryDark">{item.value}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default DashboardPage;
