import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { ROLES, ROLE_LIST } from '../config/constants.js';
import { success, created, fail } from '../utils/apiResponse.js';
import { logActivity } from '../services/activityService.js';

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

export const register = async (req, res) => {
  const { name, email, password, role, phone, department } = req.body;
  if (!name || !email) {
    return fail(res, 400, 'Name and email are required.');
  }
  const exists = await User.findOne({ email });
  if (exists) return fail(res, 409, 'Email already in use.');

  // Only super_admin (or unauthenticated for first-time bootstrap) can create super_admin.
  // Otherwise default to accountant (no login access) when not specified.
  let assignedRole = role;
  if (!req.user) {
    assignedRole = ROLES.SUPER_ADMIN; // bootstrap first user as super admin
  } else if (req.user.role !== ROLES.SUPER_ADMIN) {
    assignedRole = ROLES.ACCOUNTANT;
  }
  if (!ROLE_LIST.includes(assignedRole)) {
    return fail(res, 400, 'Invalid role.');
  }

  const payload = { name, email, role: assignedRole, phone, department };
  if (password) payload.password = password;
  const user = await User.create(payload);

  await logActivity({
    user: req.user || user._id,
    action: 'user.register',
    entityType: 'User',
    entityId: user._id,
    description: `Created user ${user.email} with role ${user.role}`,
  });

  // Accountants and customer service cannot sign in. Only return a token for roles that may log in.
  if ([ROLES.ACCOUNTANT, ROLES.CUSTOMER_SERVICE].includes(user.role)) {
    return created(res, { user, canLogin: false });
  }
  const token = signToken(user._id);
  return created(res, { token, user, canLogin: true });
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return fail(res, 400, 'Email and password are required.');

  const user = await User.findOne({ email }).select('+password');
  if (!user) return fail(res, 401, 'Invalid credentials.');
  if (!user.isActive) return fail(res, 403, 'Account is inactive.');

  // Accountants and customer service are recorded in the system but do not have login access.
  if ([ROLES.ACCOUNTANT, ROLES.CUSTOMER_SERVICE].includes(user.role)) {
    return fail(res, 403, 'This account does not have sign-in access.');
  }

  if (!user.password) {
    return fail(res, 401, 'Invalid credentials.');
  }

  const matched = await user.comparePassword(password);
  if (!matched) return fail(res, 401, 'Invalid credentials.');

  user.lastLoginAt = new Date();
  await user.save({ validateBeforeSave: false });

  await logActivity({
    user: user._id,
    action: 'user.login',
    entityType: 'User',
    entityId: user._id,
    description: `${user.email} signed in`,
  });

  const token = signToken(user._id);
  return success(res, { token, user });
};

export const logout = async (req, res) => {
  if (req.user) {
    await logActivity({
      user: req.user._id,
      action: 'user.logout',
      entityType: 'User',
      entityId: req.user._id,
      description: `${req.user.email} signed out`,
    });
  }
  return success(res, { ok: true });
};

export const me = async (req, res) => {
  return success(res, { user: req.user });
};
