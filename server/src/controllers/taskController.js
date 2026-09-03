import { Task } from '../models/Task.js';
import { Client } from '../models/Client.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { success, created, fail } from '../utils/apiResponse.js';
import { buildPagination, buildMeta } from '../utils/pagination.js';
import { logActivity } from '../services/activityService.js';
import { createNotification } from '../services/notificationService.js';
import { ROLES } from '../config/constants.js';

const visibilityFilter = (user) => {
  // Customer service, data entry, accountant see only their own tasks; managers/admins see all.
  if ([ROLES.SUPER_ADMIN, ROLES.MANAGER].includes(user.role)) return {};
  return { assignedTo: user._id };
};

export const listTasks = asyncHandler(async (req, res) => {
  const { page, limit, skip } = buildPagination(req.query);
  const filter = { ...visibilityFilter(req.user) };
  if (req.query.status) filter.status = req.query.status;
  if (req.query.priority) filter.priority = req.query.priority;
  if (req.query.client) filter.client = req.query.client;
  if (req.query.assignedTo) {
    // ensure non-managers can't filter others
    if (![ROLES.SUPER_ADMIN, ROLES.MANAGER].includes(req.user.role)) {
      delete filter.assignedTo;
    } else {
      filter.assignedTo = req.query.assignedTo;
    }
  }
  if (req.query.dueBefore) filter.dueDate = { $lte: new Date(req.query.dueBefore) };
  if (req.query.dueAfter) filter.dueDate = { ...(filter.dueDate || {}), $gte: new Date(req.query.dueAfter) };
  if (req.query.q) {
    const q = req.query.q;
    filter.$or = [
      { title: { $regex: q, $options: 'i' } },
      { description: { $regex: q, $options: 'i' } },
      { service: { $regex: q, $options: 'i' } },
    ];
  }

  const [items, total] = await Promise.all([
    Task.find(filter)
      .populate('client', 'name companyName clientType')
      .populate('assignedTo', 'name email role')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Task.countDocuments(filter),
  ]);
  return success(res, items, buildMeta({ page, limit, total }));
});

export const getTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id)
    .populate('client', 'name companyName clientType')
    .populate('assignedTo', 'name email role')
    .populate('createdBy', 'name email')
    .populate('comments.createdBy', 'name email')
    .populate('attachments.uploadedBy', 'name email');
  if (!task) return fail(res, 404, 'Task not found.');
  // Authorization
  if (
    ![ROLES.SUPER_ADMIN, ROLES.MANAGER].includes(req.user.role) &&
    String(task.assignedTo?._id) !== String(req.user._id)
  ) {
    return fail(res, 403, 'You do not have permission to view this task.');
  }
  return success(res, task);
});

export const createTask = asyncHandler(async (req, res) => {
  const task = await Task.create({ ...req.body, createdBy: req.user._id });
  await logActivity({
    user: req.user._id,
    action: 'task.create',
    entityType: 'Task',
    entityId: task._id,
    description: `Created task "${task.title}"`,
  });
  if (task.assignedTo && String(task.assignedTo) !== String(req.user._id)) {
    await createNotification({
      recipient: task.assignedTo,
      title: 'New task assigned',
      body: `You have been assigned: ${task.title}`,
      type: 'task_assigned',
      link: `/tasks/${task._id}`,
      relatedEntity: { entityType: 'Task', entityId: task._id },
    });
  }
  return created(res, task);
});

export const updateTask = asyncHandler(async (req, res) => {
  const before = await Task.findById(req.params.id);
  if (!before) return fail(res, 404, 'Task not found.');
  if (
    ![ROLES.SUPER_ADMIN, ROLES.MANAGER].includes(req.user.role) &&
    String(before.assignedTo) !== String(req.user._id)
  ) {
    return fail(res, 403, 'You can only update your own tasks.');
  }
  const task = await Task.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (req.body.status === 'completed' && !task.completedAt) {
    task.completedAt = new Date();
    await task.save();
  }
  await logActivity({
    user: req.user._id,
    action: 'task.update',
    entityType: 'Task',
    entityId: task._id,
    description: `Updated task "${task.title}"`,
  });
  if (
    req.body.assignedTo &&
    String(req.body.assignedTo) !== String(before.assignedTo || '')
  ) {
    await createNotification({
      recipient: req.body.assignedTo,
      title: 'Task reassigned',
      body: `Task "${task.title}" has been assigned to you`,
      type: 'task_assigned',
      link: `/tasks/${task._id}`,
      relatedEntity: { entityType: 'Task', entityId: task._id },
    });
  }
  return success(res, task);
});

export const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findByIdAndDelete(req.params.id);
  if (!task) return fail(res, 404, 'Task not found.');
  await logActivity({
    user: req.user._id,
    action: 'task.delete',
    entityType: 'Task',
    entityId: task._id,
    description: `Deleted task "${task.title}"`,
  });
  return success(res, { ok: true });
});

export const addComment = asyncHandler(async (req, res) => {
  const { text } = req.body;
  if (!text) return fail(res, 400, 'Comment text is required.');
  const task = await Task.findById(req.params.id);
  if (!task) return fail(res, 404, 'Task not found.');
  task.comments.push({ text, createdBy: req.user._id });
  await task.save();
  await task.populate('comments.createdBy', 'name email');
  return created(res, task.comments[task.comments.length - 1]);
});

export const changeStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!status) return fail(res, 400, 'Status is required.');
  const task = await Task.findById(req.params.id);
  if (!task) return fail(res, 404, 'Task not found.');
  task.status = status;
  if (status === 'completed') task.completedAt = new Date();
  await task.save();
  await logActivity({
    user: req.user._id,
    action: 'task.status',
    entityType: 'Task',
    entityId: task._id,
    description: `Status changed to ${status}`,
    metadata: { from: task.status, to: status },
  });
  return success(res, task);
});

export const kanbanTasks = asyncHandler(async (req, res) => {
  const filter = visibilityFilter(req.user);
  const tasks = await Task.find(filter)
    .populate('client', 'name clientType')
    .populate('assignedTo', 'name')
    .sort({ priority: -1, dueDate: 1 });
  return success(res, tasks);
});

// Lightweight client list for select-boxes in task / payment forms. Customer
// service and accountants only see clients that are actually tied to one of
// their tasks — managers and admins see everyone.
export const myClients = asyncHandler(async (req, res) => {
  const isManager = [ROLES.SUPER_ADMIN, ROLES.MANAGER].includes(req.user.role);
  if (isManager) {
    const clients = await Client.find().select('name companyName clientType').sort({ name: 1 }).limit(200);
    return success(res, clients);
  }
  // Distinct client ids from this user's tasks.
  const taskClients = await Task.distinct('client', { assignedTo: req.user._id, client: { $ne: null } });
  const clients = await Client.find({ _id: { $in: taskClients } })
    .select('name companyName clientType')
    .sort({ name: 1 });
  return success(res, clients);
});
