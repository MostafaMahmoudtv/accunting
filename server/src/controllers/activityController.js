import { ActivityLog } from '../models/ActivityLog.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { success } from '../utils/apiResponse.js';
import { buildPagination, buildMeta } from '../utils/pagination.js';
import { ROLES } from '../config/constants.js';

export const listActivity = asyncHandler(async (req, res) => {
  const { page, limit, skip } = buildPagination(req.query);
  const filter = {};
  // Non-admins see only their own activity feed
  if (![ROLES.SUPER_ADMIN, ROLES.MANAGER].includes(req.user.role)) {
    filter.user = req.user._id;
  }
  if (req.query.user) filter.user = req.query.user;
  if (req.query.entityType) filter.entityType = req.query.entityType;
  if (req.query.entityId) filter.entityId = req.query.entityId;
  if (req.query.action) filter.action = req.query.action;
  const [items, total] = await Promise.all([
    ActivityLog.find(filter)
      .populate('user', 'name email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    ActivityLog.countDocuments(filter),
  ]);
  return success(res, items, buildMeta({ page, limit, total }));
});
