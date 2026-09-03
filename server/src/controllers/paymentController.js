import { Payment } from '../models/Payment.js';
import { Client } from '../models/Client.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { success, created, fail } from '../utils/apiResponse.js';
import { buildPagination, buildMeta } from '../utils/pagination.js';
import { logActivity } from '../services/activityService.js';
import { syncPaymentRevenue } from './revenueController.js';

const refreshClientStatus = async (clientId) => {
  if (!clientId) return;
  const payments = await Payment.find({ client: clientId });
  if (!payments.length) return;
  const allPaid = payments.every((p) => p.status === 'paid');
  const anyOverdue = payments.some((p) => p.status === 'overdue' || (p.status !== 'paid' && p.dueDate && p.dueDate < new Date()));
  const anyPart = payments.some((p) => p.status === 'partially_paid');
  let status = 'unpaid';
  if (allPaid) status = 'paid';
  else if (anyOverdue) status = 'overdue';
  else if (anyPart) status = 'partially_paid';
  await Client.findByIdAndUpdate(clientId, { paymentStatus: status });
};

export const listPayments = asyncHandler(async (req, res) => {
  const { page, limit, skip } = buildPagination(req.query);
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.query.client) filter.client = req.query.client;
  if (req.query.dateFrom) filter.paymentDate = { $gte: new Date(req.query.dateFrom) };
  if (req.query.dateTo) filter.paymentDate = { ...(filter.paymentDate || {}), $lte: new Date(req.query.dateTo) };
  const [items, total] = await Promise.all([
    Payment.find(filter)
      .populate('client', 'name companyName')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Payment.countDocuments(filter),
  ]);
  return success(res, items, buildMeta({ page, limit, total }));
});

export const createPayment = asyncHandler(async (req, res) => {
  const payment = await Payment.create({ ...req.body, createdBy: req.user._id });
  await logActivity({
    user: req.user._id,
    action: 'payment.create',
    entityType: 'Payment',
    entityId: payment._id,
    description: `Created payment of ${payment.amount}`,
  });
  await refreshClientStatus(payment.client);
  await syncPaymentRevenue(payment, { userId: req.user._id });
  return created(res, payment);
});

export const updatePayment = asyncHandler(async (req, res) => {
  const payment = await Payment.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!payment) return fail(res, 404, 'Payment not found.');
  await logActivity({
    user: req.user._id,
    action: 'payment.update',
    entityType: 'Payment',
    entityId: payment._id,
    description: `Updated payment`,
  });
  await refreshClientStatus(payment.client);
  await syncPaymentRevenue(payment, { userId: req.user._id });
  return success(res, payment);
});

export const deletePayment = asyncHandler(async (req, res) => {
  const payment = await Payment.findByIdAndDelete(req.params.id);
  if (!payment) return fail(res, 404, 'Payment not found.');
  await logActivity({
    user: req.user._id,
    action: 'payment.delete',
    entityType: 'Payment',
    entityId: payment._id,
    description: `Deleted payment`,
  });
  await refreshClientStatus(payment.client);
  // Clean up any revenue that was auto-generated from this payment.
  const { Revenue } = await import('../models/Revenue.js');
  await Revenue.deleteOne({ sourcePayment: payment._id });
  return success(res, { ok: true });
});

export const paymentStats = asyncHandler(async (req, res) => {
  const total = await Payment.aggregate([
    { $group: { _id: '$status', total: { $sum: '$amount' }, count: { $sum: 1 } } },
  ]);
  const map = { paid: 0, unpaid: 0, partially_paid: 0, overdue: 0 };
  for (const row of total) map[row._id] = { total: row.total, count: row.count };
  // Detect overdue
  await Payment.updateMany(
    { status: { $nin: ['paid', 'cancelled'] }, dueDate: { $lt: new Date() } },
    { $set: { status: 'overdue' } }
  );
  return success(res, map);
});
