import { Client } from '../models/Client.js';
import { Task } from '../models/Task.js';
import { Payment } from '../models/Payment.js';
import { User } from '../models/User.js';
import { Revenue } from '../models/Revenue.js';
import { Expense } from '../models/Expense.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { success } from '../utils/apiResponse.js';
import {
  getMonthlyRevenue,
  getMonthlyExpenses,
  getNetProfit,
  getMonthlySeries,
  getExpenseBreakdown,
} from '../services/financeService.js';
import { ROLES } from '../config/constants.js';

export const financialReport = asyncHandler(async (req, res) => {
  const canSeeFinancials = [ROLES.SUPER_ADMIN, ROLES.MANAGER, ROLES.ACCOUNTANT].includes(req.user.role);
  if (!canSeeFinancials) return success(res, { hidden: true });
  const series = await getMonthlySeries(12);
  const monthRevenue = await getMonthlyRevenue();
  const monthExpenses = await getMonthlyExpenses();
  const monthProfit = await getNetProfit();
  const [outstandingAgg, paidAgg] = await Promise.all([
    Payment.aggregate([
      { $match: { status: { $in: ['unpaid', 'partially_paid', 'overdue'] } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
    Payment.aggregate([{ $match: { status: 'paid' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
  ]);
  return success(res, {
    series,
    monthRevenue,
    monthExpenses,
    monthProfit,
    outstanding: outstandingAgg[0]?.total || 0,
    paidTotal: paidAgg[0]?.total || 0,
  });
});

export const clientReport = asyncHandler(async (req, res) => {
  const [byType, byRevenue, total] = await Promise.all([
    Client.aggregate([{ $group: { _id: '$clientType', count: { $sum: 1 } } }]),
    Revenue.aggregate([
      { $group: { _id: '$client', total: { $sum: '$amount' } } },
      { $sort: { total: -1 } },
      { $limit: 10 },
    ]),
    Client.countDocuments(),
  ]);
  const clientIds = byRevenue.map((b) => b._id).filter(Boolean);
  const clients = await Client.find({ _id: { $in: clientIds } }, 'name companyName clientType');
  const map = Object.fromEntries(clients.map((c) => [String(c._id), c]));
  const top = byRevenue.map((b) => ({ client: map[String(b._id)], total: b.total }));
  const typeMap = { monthly: 0, temporary: 0, one_time: 0 };
  for (const t of byType) typeMap[t._id] = t.count;
  return success(res, { byType: typeMap, total, top });
});

export const teamReport = asyncHandler(async (req, res) => {
  const users = await User.find({ isActive: true });
  const rows = await Promise.all(
    users.map(async (u) => {
      const [assigned, completed, overdue, inProgress] = await Promise.all([
        Task.countDocuments({ assignedTo: u._id }),
        Task.countDocuments({ assignedTo: u._id, status: 'completed' }),
        Task.countDocuments({ assignedTo: u._id, status: 'overdue' }),
        Task.countDocuments({ assignedTo: u._id, status: { $in: ['in_progress', 'pending', 'new', 'waiting_client', 'under_review'] } }),
      ]);
      const completionRate = assigned === 0 ? 0 : Math.round((completed / assigned) * 100);
      return {
        user: { _id: u._id, name: u.name, email: u.email, role: u.role, avatar: u.avatar },
        assigned,
        completed,
        overdue,
        inProgress,
        completionRate,
      };
    })
  );
  return success(res, rows);
});

export const expenseBreakdown = asyncHandler(async (req, res) => {
  const start = req.query.dateFrom ? new Date(req.query.dateFrom) : null;
  const end = req.query.dateTo ? new Date(req.query.dateTo) : null;
  const breakdown = await getExpenseBreakdown(start, end);
  return success(res, breakdown);
});
