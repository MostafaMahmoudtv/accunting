import { Expense } from '../models/Expense.js';
import { Salary } from '../models/Salary.js';
import { User } from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { success, created, fail } from '../utils/apiResponse.js';
import { buildPagination, buildMeta } from '../utils/pagination.js';
import { logActivity } from '../services/activityService.js';

/**
 * Ensure an Expense record exists for a paid salary. Idempotent:
 * - if a salary becomes "paid" and no linked expense exists, create one
 *   (category=salary) so it shows up in the expenses list/aggregations.
 * - if a salary is no longer "paid", remove the linked expense so it
 *   drops out of the expenses view.
 */
export const syncSalaryExpense = async (salary, { userId } = {}) => {
  if (!salary) return;
  if (salary.paymentStatus === 'paid') {
    const existing = await Expense.findOne({ sourceSalary: salary._id });
    if (existing) return;
    const employee = await User.findById(salary.employee).select('name');
    const monthName = new Date(0, (salary.periodMonth || 1) - 1).toLocaleString('en', {
      month: 'long',
    });
    await Expense.create({
      title: `Salary — ${employee?.name || 'Employee'} (${monthName} ${salary.periodYear})`,
      amount: salary.netSalary,
      category: 'salary',
      date: salary.paymentDate || new Date(),
      description: salary.notes,
      paidBy: 'bank_transfer',
      sourceSalary: salary._id,
      createdBy: userId || salary.createdBy,
    });
  } else {
    await Expense.deleteOne({ sourceSalary: salary._id });
  }
};

export const listExpenses = asyncHandler(async (req, res) => {
  const { page, limit, skip } = buildPagination(req.query);
  const filter = {};
  if (req.query.category) filter.category = req.query.category;
  if (req.query.dateFrom) filter.date = { $gte: new Date(req.query.dateFrom) };
  if (req.query.dateTo) filter.date = { ...(filter.date || {}), $lte: new Date(req.query.dateTo) };
  if (req.query.q) {
    const q = req.query.q;
    filter.$or = [
      { title: { $regex: q, $options: 'i' } },
      { description: { $regex: q, $options: 'i' } },
    ];
  }
  const [items, total] = await Promise.all([
    Expense.find(filter)
      .populate('createdBy', 'name email')
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit),
    Expense.countDocuments(filter),
  ]);
  return success(res, items, buildMeta({ page, limit, total }));
});

export const createExpense = asyncHandler(async (req, res) => {
  const expense = await Expense.create({ ...req.body, createdBy: req.user._id });
  await logActivity({
    user: req.user._id,
    action: 'expense.create',
    entityType: 'Expense',
    entityId: expense._id,
    description: `Recorded expense ${expense.title} (${expense.amount})`,
  });
  return created(res, expense);
});

export const updateExpense = asyncHandler(async (req, res) => {
  const expense = await Expense.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!expense) return fail(res, 404, 'Expense not found.');
  await logActivity({
    user: req.user._id,
    action: 'expense.update',
    entityType: 'Expense',
    entityId: expense._id,
    description: `Updated expense ${expense.title}`,
  });
  return success(res, expense);
});

export const deleteExpense = asyncHandler(async (req, res) => {
  const expense = await Expense.findByIdAndDelete(req.params.id);
  if (!expense) return fail(res, 404, 'Expense not found.');
  await logActivity({
    user: req.user._id,
    action: 'expense.delete',
    entityType: 'Expense',
    entityId: expense._id,
    description: `Deleted expense ${expense.title}`,
  });
  return success(res, { ok: true });
});
