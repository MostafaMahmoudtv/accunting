import { Client } from '../models/Client.js';
import { Task } from '../models/Task.js';
import { Payment } from '../models/Payment.js';
import { User } from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { success } from '../utils/apiResponse.js';
import { getMonthlyRevenue, getMonthlyExpenses, getNetProfit, getMonthlySeries, getExpenseBreakdown } from '../services/financeService.js';
import { ROLES } from '../config/constants.js';
import { startOfMonth, endOfMonth } from '../utils/dates.js';

const isOverdue = (d) => d && new Date(d) < new Date() && !(d?.completedAt);

export const dashboardStats = asyncHandler(async (req, res) => {
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  // Update overdue tasks
  await Task.updateMany(
    {
      status: { $nin: ['completed', 'cancelled'] },
      dueDate: { $lt: now },
    },
    { $set: { status: 'overdue' } }
  );

  const [
    totalClients,
    monthlyClients,
    temporaryClients,
    oneTimeClients,
    activeTasks,
    completedTasks,
    overdueTasks,
    pendingTasks,
    todayDueTasks,
    pendingPaymentsAgg,
    overduePaymentsAgg,
    monthlyRevenue,
    monthlyExpenses,
    netProfit,
    monthlySeries,
    expenseBreakdown,
    clientTypeAgg,
    taskStatusAgg,
    teamWorkload,
  ] = await Promise.all([
    Client.countDocuments(),
    Client.countDocuments({ clientType: 'monthly' }),
    Client.countDocuments({ clientType: 'temporary' }),
    Client.countDocuments({ clientType: 'one_time' }),
    Task.countDocuments({ status: { $nin: ['completed', 'cancelled'] } }),
    Task.countDocuments({ status: 'completed' }),
    Task.countDocuments({ status: 'overdue' }),
    Task.countDocuments({ status: { $in: ['new', 'pending', 'in_progress'] } }),
    Task.countDocuments({
      status: { $nin: ['completed', 'cancelled'] },
      dueDate: { $gte: monthStart, $lte: monthEnd },
    }),
    Payment.aggregate([{ $match: { status: { $in: ['unpaid', 'partially_paid'] } } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
    Payment.aggregate([{ $match: { status: 'overdue' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
    getMonthlyRevenue(now),
    getMonthlyExpenses(now),
    getNetProfit(now),
    getMonthlySeries(12),
    getExpenseBreakdown(monthStart, monthEnd),
    Client.aggregate([{ $group: { _id: '$clientType', count: { $sum: 1 } } }]),
    Task.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Task.aggregate([
      { $match: { status: { $nin: ['completed', 'cancelled'] } } },
      { $group: { _id: '$assignedTo', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]),
  ]);

  // populate team workload names
  const userIds = teamWorkload.map((w) => w._id).filter(Boolean);
  const users = await User.find({ _id: { $in: userIds } }, 'name email role');
  const userMap = Object.fromEntries(users.map((u) => [String(u._id), u]));
  const teamWorkloadFormatted = teamWorkload.map((w) => ({
    user: userMap[String(w._id)] || null,
    count: w.count,
  }));

  // Hide revenue/expenses from data entry & customer service
  const canSeeFinancials = [ROLES.SUPER_ADMIN, ROLES.MANAGER, ROLES.ACCOUNTANT].includes(req.user.role);
  const clientTypes = { monthly: 0, temporary: 0, one_time: 0 };
  for (const c of clientTypeAgg) clientTypes[c._id] = c.count;
  const taskStatus = {};
  for (const t of taskStatusAgg) taskStatus[t._id] = t.count;

  const stats = {
    totals: {
      totalClients,
      monthlyClients,
      temporaryClients,
      oneTimeClients,
      activeTasks,
      completedTasks,
      overdueTasks,
      pendingTasks,
      todayDueTasks,
      pendingPayments: pendingPaymentsAgg[0]?.total || 0,
      overduePayments: overduePaymentsAgg[0]?.total || 0,
    },
    financials: canSeeFinancials
      ? { monthlyRevenue, monthlyExpenses, netProfit }
      : { monthlyRevenue: 0, monthlyExpenses: 0, netProfit: 0 },
    charts: {
      monthlySeries,
      expenseBreakdown,
      clientTypes,
      taskStatus,
      teamWorkload: teamWorkloadFormatted,
    },
  };
  return success(res, stats);
});

export const recentActivity = asyncHandler(async (req, res) => {
  const ActivityLog = (await import('../models/ActivityLog.js')).ActivityLog;
  const items = await ActivityLog.find()
    .populate('user', 'name email role')
    .sort({ createdAt: -1 })
    .limit(15);
  return success(res, items);
});

export const alerts = asyncHandler(async (req, res) => {
  const now = new Date();
  const soon = new Date();
  soon.setDate(soon.getDate() + 3);
  const [overdueTasks, dueSoonTasks, overduePayments] = await Promise.all([
    Task.find({ status: { $nin: ['completed', 'cancelled'] }, dueDate: { $lt: now } })
      .populate('assignedTo', 'name')
      .populate('client', 'name')
      .limit(20),
    Task.find({
      status: { $nin: ['completed', 'cancelled'] },
      dueDate: { $gte: now, $lte: soon },
    })
      .populate('assignedTo', 'name')
      .populate('client', 'name')
      .limit(20),
    Payment.find({ status: 'overdue' }).populate('client', 'name').limit(20),
  ]);
  return success(res, { overdueTasks, dueSoonTasks, overduePayments });
});
