import { User } from '../models/User.js';
import { ROLES, ROLE_LIST, DEPARTMENTS } from '../config/constants.js';
import { success, created, fail } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { buildPagination, buildMeta } from '../utils/pagination.js';
import { logActivity } from '../services/activityService.js';

export const listUsers = asyncHandler(async (req, res) => {
  const { page, limit, skip } = buildPagination(req.query);
  const filter = { isActive: { $ne: false } };
  if (req.query.role) filter.role = req.query.role;
  if (req.query.status) filter.isActive = req.query.status === 'active';
  if (req.query.q) {
    const q = req.query.q;
    filter.$or = [
      { name: { $regex: q, $options: 'i' } },
      { email: { $regex: q, $options: 'i' } },
    ];
  }
  const [items, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    User.countDocuments(filter),
  ]);
  return success(res, items, buildMeta({ page, limit, total }));
});

export const createUser = asyncHandler(async (req, res) => {
  const { name, email, password, role, phone, department } = req.body;
  if (!name || !email) return fail(res, 400, 'Name and email are required.');
  if (role && !ROLE_LIST.includes(role)) return fail(res, 400, 'Invalid role.');
  if (department && !DEPARTMENTS.includes(department)) return fail(res, 400, 'Invalid department.');
  const exists = await User.findOne({ email });
  if (exists) return fail(res, 409, 'Email already in use.');

  // Password is required so the user can sign in. Minimum 6 chars (matches schema).
  if (!password || password.length < 6) {
    return fail(res, 400, 'Password is required (minimum 6 characters).');
  }

  const payload = { name, email, password, role, phone, department };
  const user = await User.create(payload);
  await logActivity({
    user: req.user._id,
    action: 'user.create',
    entityType: 'User',
    entityId: user._id,
    description: `Created user ${user.email}`,
  });
  return created(res, user);
});

export const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updates = { ...req.body };

  // Only apply password update if a non-empty value was sent (lets the form
  // submit without changing the password by leaving the field blank).
  if (updates.password !== undefined) {
    if (updates.password && updates.password.length < 6) {
      return fail(res, 400, 'Password must be at least 6 characters.');
    }
    if (!updates.password) {
      delete updates.password;
    }
  }
  if (updates.role && !ROLE_LIST.includes(updates.role)) return fail(res, 400, 'Invalid role.');
  if (updates.department && !DEPARTMENTS.includes(updates.department)) {
    return fail(res, 400, 'Invalid department.');
  }

  // Use findById + save so the pre('save') password hook fires (findByIdAndUpdate
  // bypasses save middleware, which would store the password unhashed).
  const user = await User.findById(id);
  if (!user) return fail(res, 404, 'User not found.');

  const assignable = ['name', 'email', 'phone', 'role', 'department', 'isActive'];
  for (const key of assignable) {
    if (updates[key] !== undefined) user[key] = updates[key];
  }
  if (updates.password) user.password = updates.password;
  await user.save();

  await logActivity({
    user: req.user._id,
    action: 'user.update',
    entityType: 'User',
    entityId: user._id,
    description: `Updated user ${user.email}`,
  });
  return success(res, user);
});

export const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (String(req.user._id) === String(id)) {
    return fail(res, 400, 'You cannot delete your own account.');
  }
  const user = await User.findByIdAndDelete(id);
  if (!user) return fail(res, 404, 'User not found.');
  await logActivity({
    user: req.user._id,
    action: 'user.delete',
    entityType: 'User',
    entityId: user._id,
    description: `Deleted user ${user.email}`,
  });
  return success(res, { ok: true });
});

export const getRoles = asyncHandler(async (req, res) => {
  return success(res, ROLE_LIST);
});

export const ROLES_EXPORT = ROLES;
