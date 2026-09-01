import { ActivityLog } from '../models/ActivityLog.js';

export const logActivity = async ({ user, action, entityType, entityId, description, metadata }) => {
  try {
    if (!user) return;
    await ActivityLog.create({
      user: user._id || user,
      action,
      entityType,
      entityId,
      description,
      metadata,
    });
  } catch (err) {
    console.error('Failed to log activity', err.message);
  }
};
