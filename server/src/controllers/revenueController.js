import { Revenue } from '../models/Revenue.js';
import { Client } from '../models/Client.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { success, created, fail } from '../utils/apiResponse.js';
import { buildPagination, buildMeta } from '../utils/pagination.js';
import { logActivity } from '../services/activityService.js';

/**
 * Keep the Revenue collection in sync with Payment records.
 *
 * Every payment (regardless of its status) is mirrored as a Revenue record so
 * the two stay in sync: anything you can see in Payments is also reflected in
 * Revenue. Edits to the payment amount/status/date propagate to the linked
 * revenue; deleting a payment removes the revenue.
 *
 * Idempotent: re-running with the same payment is a no-op (or an update).
 */
export const syncPaymentRevenue = async (payment, { userId } = {}) => {
  if (!payment) return;
  let clientName = '';
  if (payment.client) {
    const c = await Client.findById(payment.client).select('name companyName');
    clientName = c?.companyName || c?.name || '';
  }
  const title = clientName
    ? `Payment from ${clientName}`
    : `Payment ${payment.invoice || payment._id.toString().slice(-6)}`;

  const update = {
    client: payment.client,
    amount: payment.amount,
    category: 'other',
    date: payment.paymentDate || new Date(),
    description: payment.notes,
    paymentStatus: payment.status,
    title,
  };

  await Revenue.findOneAndUpdate(
    { sourcePayment: payment._id },
    { $set: update, $setOnInsert: { sourcePayment: payment._id, createdBy: userId || payment.createdBy } },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );
};

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
