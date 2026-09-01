import { Revenue } from '../models/Revenue.js';
import { Expense } from '../models/Expense.js';
import { startOfMonth, endOfMonth } from '../utils/dates.js';

export const sumAmount = async (Model, match) => {
  const result = await Model.aggregate([
    { $match: match },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);
  return result[0]?.total || 0;
};

export const getMonthlyRevenue = async (date = new Date()) => {
  return sumAmount(Revenue, {
    date: { $gte: startOfMonth(date), $lte: endOfMonth(date) },
    paymentStatus: { $ne: 'cancelled' },
  });
};

export const getMonthlyExpenses = async (date = new Date()) => {
  return sumAmount(Expense, {
    date: { $gte: startOfMonth(date), $lte: endOfMonth(date) },
  });
};

export const getNetProfit = async (date = new Date()) => {
  const [revenue, expenses] = await Promise.all([
    getMonthlyRevenue(date),
    getMonthlyExpenses(date),
  ]);
  return revenue - expenses;
};

export const getMonthlySeries = async (months = 12) => {
  const now = new Date();
  const series = [];
  for (let i = months - 1; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const start = startOfMonth(d);
    const end = endOfMonth(d);
    const [rev, exp] = await Promise.all([
      sumAmount(Revenue, { date: { $gte: start, $lte: end } }),
      sumAmount(Expense, { date: { $gte: start, $lte: end } }),
    ]);
    series.push({
      month: d.toISOString().slice(0, 7),
      label: d.toLocaleString('en', { month: 'short' }),
      revenue: rev,
      expenses: exp,
      profit: rev - exp,
    });
  }
  return series;
};

export const getExpenseBreakdown = async (start, end) => {
  const match = {};
  if (start || end) {
    match.date = {};
    if (start) match.date.$gte = new Date(start);
    if (end) match.date.$lte = new Date(end);
  }
  const rows = await Expense.aggregate([
    { $match: match },
    { $group: { _id: '$category', total: { $sum: '$amount' } } },
    { $project: { category: '$_id', total: 1, _id: 0 } },
    { $sort: { total: -1 } },
  ]);
  return rows;
};
