import { Workflow } from '../models/Workflow.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { success, created, fail } from '../utils/apiResponse.js';
import { buildPagination, buildMeta } from '../utils/pagination.js';
import { logActivity } from '../services/activityService.js';

export const listWorkflows = asyncHandler(async (req, res) => {
  const { page, limit, skip } = buildPagination(req.query);
  const filter = {};
  if (req.query.q) {
    const q = req.query.q;
    filter.$or = [{ name: { $regex: q, $options: 'i' } }, { description: { $regex: q, $options: 'i' } }];
  }
  const [items, total] = await Promise.all([
    Workflow.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Workflow.countDocuments(filter),
  ]);
  return success(res, items, buildMeta({ page, limit, total }));
});

export const getWorkflow = asyncHandler(async (req, res) => {
  const workflow = await Workflow.findById(req.params.id);
  if (!workflow) return fail(res, 404, 'Workflow not found.');
  return success(res, workflow);
});

export const createWorkflow = asyncHandler(async (req, res) => {
  const workflow = await Workflow.create({ ...req.body, createdBy: req.user._id });
  await logActivity({
    user: req.user._id,
    action: 'workflow.create',
    entityType: 'Workflow',
    entityId: workflow._id,
    description: `Created workflow ${workflow.name}`,
  });
  return created(res, workflow);
});

export const updateWorkflow = asyncHandler(async (req, res) => {
  const workflow = await Workflow.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!workflow) return fail(res, 404, 'Workflow not found.');
  await logActivity({
    user: req.user._id,
    action: 'workflow.update',
    entityType: 'Workflow',
    entityId: workflow._id,
    description: `Updated workflow ${workflow.name}`,
  });
  return success(res, workflow);
});

export const deleteWorkflow = asyncHandler(async (req, res) => {
  const workflow = await Workflow.findByIdAndDelete(req.params.id);
  if (!workflow) return fail(res, 404, 'Workflow not found.');
  await logActivity({
    user: req.user._id,
    action: 'workflow.delete',
    entityType: 'Workflow',
    entityId: workflow._id,
    description: `Deleted workflow ${workflow.name}`,
  });
  return success(res, { ok: true });
});
