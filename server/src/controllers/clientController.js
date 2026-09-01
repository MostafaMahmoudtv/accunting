import { Client } from '../models/Client.js';
import { Task } from '../models/Task.js';
import { Payment } from '../models/Payment.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { success, created, fail } from '../utils/apiResponse.js';
import { buildPagination, buildMeta } from '../utils/pagination.js';
import { logActivity } from '../services/activityService.js';
import { createNotification } from '../services/notificationService.js';

export const listClients = asyncHandler(async (req, res) => {
  const { page, limit, skip } = buildPagination(req.query);
  const filter = {};
  if (req.query.clientType) filter.clientType = req.query.clientType;
  if (req.query.status) filter.status = req.query.status;
  if (req.query.paymentStatus) filter.paymentStatus = req.query.paymentStatus;
  if (req.query.assignedAccountant) filter.assignedAccountant = req.query.assignedAccountant;
  if (req.query.q) {
    const q = req.query.q;
    filter.$or = [
      { name: { $regex: q, $options: 'i' } },
      { companyName: { $regex: q, $options: 'i' } },
      { email: { $regex: q, $options: 'i' } },
      { phone: { $regex: q, $options: 'i' } },
      { taxNumber: { $regex: q, $options: 'i' } },
    ];
  }
  const [items, total] = await Promise.all([
    Client.find(filter)
      .populate('assignedAccountant', 'name email role')
      .populate('assignedCustomerService', 'name email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Client.countDocuments(filter),
  ]);
  return success(res, items, buildMeta({ page, limit, total }));
});

export const getClient = asyncHandler(async (req, res) => {
  const client = await Client.findById(req.params.id)
    .populate('assignedAccountant', 'name email role')
    .populate('assignedCustomerService', 'name email role')
    .populate('createdBy', 'name email')
    .populate('timeline.createdBy', 'name email');
  if (!client) return fail(res, 404, 'Client not found.');
  return success(res, client);
});

// Strip empty-string fields so Mongoose doesn't choke on "" sent from the
// client. ObjectId fields (assignedAccountant, assignedCustomerService) are
// dropped entirely; scalar fields (notes, address, etc.) are dropped too so
// they stay undefined rather than empty strings, which is friendlier to the
// client (avoids ""-vs-absent inconsistencies) and to Mongoose sub-doc arrays.
//
// The form sends a free-form "notes" string — the model stores that as
// `generalNotes`. The sub-doc array is now `timeline`, only populated by the
// dedicated /clients/:id/notes route. We also remap the incoming `notes`
// field onto the correct storage field so the client's textarea just works.
const normalizeRelations = (body) => {
  if (!body || typeof body !== 'object') return body;
  const cleaned = { ...body };

  // If the form sent a free-form notes string, remap to generalNotes
  // and drop any array-shaped notes it might also carry.
  if (typeof cleaned.notes === 'string') {
    cleaned.generalNotes = cleaned.notes;
    delete cleaned.notes;
  } else if (Array.isArray(cleaned.notes)) {
    // The form shouldn't send notes as an array, but if it does, drop it —
    // timeline entries must go through the dedicated addNote route.
    delete cleaned.notes;
  }

  for (const key of [
    'assignedAccountant',
    'assignedCustomerService',
    'address',
    'companyName',
    'phone',
    'email',
    'taxNumber',
    'endDate',
    'billingDate',
    'startDate',
  ]) {
    if (cleaned[key] === '' || cleaned[key] === null) {
      delete cleaned[key];
    }
  }
  return cleaned;
};

export const createClient = asyncHandler(async (req, res) => {
  const client = await Client.create({ ...normalizeRelations(req.body), createdBy: req.user._id });
  await logActivity({
    user: req.user._id,
    action: 'client.create',
    entityType: 'Client',
    entityId: client._id,
    description: `Created client ${client.name}`,
  });
  // Notify assigned accountant
  if (client.assignedAccountant) {
    await createNotification({
      recipient: client.assignedAccountant,
      title: 'New client assigned',
      body: `You have been assigned to client ${client.name}`,
      type: 'new_client',
      link: `/clients/${client._id}`,
      relatedEntity: { entityType: 'Client', entityId: client._id },
    });
  }
  return created(res, client);
});

export const updateClient = asyncHandler(async (req, res) => {
  const before = await Client.findById(req.params.id);
  if (!before) return fail(res, 404, 'Client not found.');
  const client = await Client.findByIdAndUpdate(
    req.params.id,
    normalizeRelations(req.body),
    { new: true, runValidators: true }
  );
  await logActivity({
    user: req.user._id,
    action: 'client.update',
    entityType: 'Client',
    entityId: client._id,
    description: `Updated client ${client.name}`,
  });
  // If accountant changed, notify
  if (
    req.body.assignedAccountant &&
    String(req.body.assignedAccountant) !== String(before.assignedAccountant || '')
  ) {
    await createNotification({
      recipient: req.body.assignedAccountant,
      title: 'Client assigned to you',
      body: `You have been assigned to client ${client.name}`,
      type: 'new_client',
      link: `/clients/${client._id}`,
      relatedEntity: { entityType: 'Client', entityId: client._id },
    });
  }
  return success(res, client);
});

export const deleteClient = asyncHandler(async (req, res) => {
  const client = await Client.findByIdAndDelete(req.params.id);
  if (!client) return fail(res, 404, 'Client not found.');
  await logActivity({
    user: req.user._id,
    action: 'client.delete',
    entityType: 'Client',
    entityId: client._id,
    description: `Deleted client ${client.name}`,
  });
  return success(res, { ok: true });
});

export const addNote = asyncHandler(async (req, res) => {
  const { content } = req.body;
  if (!content) return fail(res, 400, 'Note content is required.');
  const client = await Client.findById(req.params.id);
  if (!client) return fail(res, 404, 'Client not found.');
  client.timeline.push({ content, createdBy: req.user._id });
  await client.save();
  await client.populate('timeline.createdBy', 'name email');
  await logActivity({
    user: req.user._id,
    action: 'client.note',
    entityType: 'Client',
    entityId: client._id,
    description: `Added note to ${client.name}`,
  });
  return created(res, client.timeline[client.timeline.length - 1]);
});

export const clientStats = asyncHandler(async (req, res) => {
  const stats = await Client.aggregate([
    { $group: { _id: '$clientType', count: { $sum: 1 } } },
  ]);
  const total = await Client.countDocuments();
  const formatted = { monthly: 0, temporary: 0, one_time: 0, total };
  for (const s of stats) formatted[s._id] = s.count;
  return success(res, formatted);
});

export const clientSummary = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const [tasks, payments] = await Promise.all([
    Task.find({ client: id }).populate('assignedTo', 'name email').sort({ createdAt: -1 }).limit(50),
    Payment.find({ client: id }).sort({ createdAt: -1 }).limit(50),
  ]);
  return success(res, { tasks, payments });
});
