import { Revenue } from '../models/Revenue.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { success, created, fail } from '../utils/apiResponse.js';
import { buildPagination, buildMeta } from '../utils/pagination.js';
import { logActivity } from '../services/activityService.js';

export const listRevenue = asyncHandler(async (req, res) => {
  const { page, limit, skip } = buildPagination(req.query);
  const filter = {};
  if (req.query.category) filter.category = req.query.category;
  if (req.query.client) filter.client = req.query.client;
  if (req.query.dateFrom) filter.date = { $gte: new Date(req.query.dateFrom) };
  if (req.query.dateTo) filter.date = { ...(filter.date || {}), $lte: new Date(req.query.dateTo) };
  const [items, total] = await Promise.all([
    Revenue.find(filter)
      .populate('client', 'name companyName')
      .populate('createdBy', 'name email')
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit),
    Revenue.countDocuments(filter),
  ]);
  return success(res, items, buildMeta({ page, limit, total }));
});

export const createRevenue = asyncHandler(async (req, res) => {
  const revenue = await Revenue.create({ ...req.body, createdBy: req.user._id });
  await logActivity({
    user: req.user._id,
    action: 'revenue.create',
    entityType: 'Revenue',
    entityId: revenue._id,
    description: `Recorded revenue of ${revenue.amount}`,
  });
  return created(res, revenue);
});

export const updateRevenue = asyncHandler(async (req, res) => {
  const revenue = await Revenue.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!revenue) return fail(res, 404, 'Revenue not found.');
  await logActivity({
    user: req.user._id,
    action: 'revenue.update',
    entityType: 'Revenue',
    entityId: revenue._id,
    description: `Updated revenue`,
  });
  return success(res, revenue);
});

export const deleteRevenue = asyncHandler(async (req, res) => {
  const revenue = await Revenue.findByIdAndDelete(req.params.id);
  if (!revenue) return fail(res, 404, 'Revenue not found.');
  await logActivity({
    user: req.user._id,
    action: 'revenue.delete',
    entityType: 'Revenue',
    entityId: revenue._id,
    description: `Deleted revenue`,
  });
  return success(res, { ok: true });
});
