import { Salary } from '../models/Salary.js';
import { User } from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { success, created, fail } from '../utils/apiResponse.js';
import { buildPagination, buildMeta } from '../utils/pagination.js';
import { logActivity } from '../services/activityService.js';
import { ROLES } from '../config/constants.js';
import { syncSalaryExpense } from './expenseController.js';

export const listSalaries = asyncHandler(async (req, res) => {
  const { page, limit, skip } = buildPagination(req.query);
  const filter = {};
  if (req.query.employee) filter.employee = req.query.employee;
  if (req.query.year) filter.periodYear = Number(req.query.year);
  if (req.query.month) filter.periodMonth = Number(req.query.month);
  if (req.query.status) filter.paymentStatus = req.query.status;
  const [items, total] = await Promise.all([
    Salary.find(filter)
      .populate('employee', 'name email role')
      .populate('createdBy', 'name email')
      .sort({ paymentDate: -1 })
      .skip(skip)
      .limit(limit),
    Salary.countDocuments(filter),
  ]);
  return success(res, items, buildMeta({ page, limit, total }));
});

export const createSalary = asyncHandler(async (req, res) => {
  const salary = await Salary.create({ ...req.body, createdBy: req.user._id });
  await syncSalaryExpense(salary, { userId: req.user._id });
  await logActivity({
    user: req.user._id,
    action: 'salary.create',
    entityType: 'Salary',
    entityId: salary._id,
    description: `Recorded salary for employee ${salary.employee}`,
  });
  return created(res, salary);
});

export const updateSalary = asyncHandler(async (req, res) => {
  const salary = await Salary.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!salary) return fail(res, 404, 'Salary not found.');
  await syncSalaryExpense(salary, { userId: req.user._id });
  await logActivity({
    user: req.user._id,
    action: 'salary.update',
    entityType: 'Salary',
    entityId: salary._id,
    description: `Updated salary`,
  });
  return success(res, salary);
});

export const deleteSalary = asyncHandler(async (req, res) => {
  const salary = await Salary.findByIdAndDelete(req.params.id);
  if (!salary) return fail(res, 404, 'Salary not found.');
  // Clean up any expense that was auto-generated from this salary.
  const { Expense } = await import('../models/Expense.js');
  await Expense.deleteOne({ sourceSalary: salary._id });
  await logActivity({
    user: req.user._id,
    action: 'salary.delete',
    entityType: 'Salary',
    entityId: salary._id,
    description: `Deleted salary`,
  });
  return success(res, { ok: true });
});

export const mySalaries = asyncHandler(async (req, res) => {
  const items = await Salary.find({ employee: req.user._id }).sort({ paymentDate: -1 });
  return success(res, items);
});
