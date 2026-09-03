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

const isManagerOrAdmin = (role) => [ROLES.SUPER_ADMIN, ROLES.MANAGER].includes(role);
const canSeeFinancials = (role) =>
  [ROLES.SUPER_ADMIN, ROLES.MANAGER, ROLES.ACCOUNTANT].includes(role);

export const dashboardStats = asyncHandler(async (req, res) => {
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);
  const role = req.user.role;
  const restricted = !isManagerOrAdmin(role);
  const noFinancials = !canSeeFinancials(role);

  // Task visibility — customer service / accountants only see their own tasks.
  const taskFilter = restricted ? { assignedTo: req.user._id } : {};

  // Update overdue tasks (only the ones visible to this user if restricted)
  await Task.updateMany(
    {
      ...taskFilter,
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
    restricted ? Promise.resolve(0) : Client.countDocuments(),
    restricted ? Promise.resolve(0) : Client.countDocuments({ clientType: 'monthly' }),
    restricted ? Promise.resolve(0) : Client.countDocuments({ clientType: 'temporary' }),
    restricted ? Promise.resolve(0) : Client.countDocuments({ clientType: 'one_time' }),
    Task.countDocuments({ ...taskFilter, status: { $nin: ['completed', 'cancelled'] } }),
    Task.countDocuments({ ...taskFilter, status: 'completed' }),
    Task.countDocuments({ ...taskFilter, status: 'overdue' }),
    Task.countDocuments({ ...taskFilter, status: { $in: ['new', 'pending', 'in_progress'] } }),
    Task.countDocuments({
      ...taskFilter,
      status: { $nin: ['completed', 'cancelled'] },
      dueDate: { $gte: monthStart, $lte: monthEnd },
    }),
    noFinancials
      ? Promise.resolve([])
      : Payment.aggregate([{ $match: { status: { $in: ['unpaid', 'partially_paid'] } } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
    noFinancials
      ? Promise.resolve([])
      : Payment.aggregate([{ $match: { status: 'overdue' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
    noFinancials ? Promise.resolve(0) : getMonthlyRevenue(now),
    noFinancials ? Promise.resolve(0) : getMonthlyExpenses(now),
    noFinancials ? Promise.resolve(0) : getNetProfit(now),
    noFinancials ? Promise.resolve([]) : getMonthlySeries(12),
    noFinancials ? Promise.resolve([]) : getExpenseBreakdown(monthStart, monthEnd),
    restricted ? Promise.resolve([]) : Client.aggregate([{ $group: { _id: '$clientType', count: { $sum: 1 } } }]),
    Task.aggregate([{ $match: taskFilter }, { $group: { _id: '$status', count: { $sum: 1 } } }]),
    restricted
      ? Promise.resolve([])
      : Task.aggregate([
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

  const clientTypes = { monthly: 0, temporary: 0, one_time: 0 };
  for (const c of clientTypeAgg) clientTypes[c._id] = c.count;
  const taskStatus = {};
  for (const t of taskStatusAgg) taskStatus[t._id] = t.count;

  const stats = {
    roleScope: {
      restricted,
      noFinancials,
    },
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
    financials: noFinancials
      ? { monthlyRevenue: 0, monthlyExpenses: 0, netProfit: 0 }
      : { monthlyRevenue, monthlyExpenses, netProfit },
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
  const restricted = !isManagerOrAdmin(req.user.role);
  // Restricted users only see activity entries they themselves produced —
  // this keeps the activity feed useful for them (their own task updates,
  // comments, etc.) while not leaking other users' actions.
  const filter = restricted ? { user: req.user._id } : {};
  const items = await ActivityLog.find(filter)
    .populate('user', 'name email role')
    .sort({ createdAt: -1 })
    .limit(15);
  return success(res, items);
});

export const alerts = asyncHandler(async (req, res) => {
  const now = new Date();
  const soon = new Date();
  soon.setDate(soon.getDate() + 3);
  const restricted = !isManagerOrAdmin(req.user.role);
  const noFinancials = !canSeeFinancials(req.user.role);
  const taskFilter = restricted ? { assignedTo: req.user._id } : {};

  const [overdueTasks, dueSoonTasks, overduePayments] = await Promise.all([
    Task.find({ ...taskFilter, status: { $nin: ['completed', 'cancelled'] }, dueDate: { $lt: now } })
      .populate('assignedTo', 'name')
      .populate('client', 'name')
      .limit(20),
    Task.find({
      ...taskFilter,
      status: { $nin: ['completed', 'cancelled'] },
      dueDate: { $gte: now, $lte: soon },
    })
      .populate('assignedTo', 'name')
      .populate('client', 'name')
      .limit(20),
    noFinancials ? Promise.resolve([]) : Payment.find({ status: 'overdue' }).populate('client', 'name').limit(20),
  ]);
  return success(res, { overdueTasks, dueSoonTasks, overduePayments });
});
