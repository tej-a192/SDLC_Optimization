import { Request, Response } from 'express';
import { Task } from '../models/task.model';

export const getDashboardAnalytics = async (req: Request, res: Response): Promise<void> => {
  try {
    const totalCount = await Task.countDocuments();
    const completedCount = await Task.countDocuments({ completed: true });
    
    const byCategory = await Task.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    const byPriority = await Task.aggregate([
      { $group: { _id: '$priority', count: { $sum: 1 } } }
    ]);

    res.status(200).json({
      total: totalCount,
      completed: completedCount,
      pending: totalCount - completedCount,
      completionRate: totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100),
      byCategory: byCategory.map(c => ({ name: c._id || 'Uncategorized', value: c.count })),
      byPriority: byPriority.map(p => ({ name: p._id || 'low', value: p.count })),
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching analytics', error });
  }
};
