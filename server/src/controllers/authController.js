import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { PasswordResetToken } from '../models/PasswordResetToken.js';
import { ROLES, ROLE_LIST } from '../config/constants.js';
import { success, created, fail } from '../utils/apiResponse.js';
import { logActivity } from '../services/activityService.js';
import { sendPasswordResetEmail, isMailerConfigured } from '../services/mailer.js';

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

/**
 * Build a fully-qualified reset URL pointing at the SPA. The link contains
 * the raw token (a 64-char hex string); the server only stores its hash.
 *
 * In dev: falls back to http://localhost:5173 if CLIENT_URL is missing.
 */
const buildResetUrl = (rawToken, locale) => {
  const clientUrl = (process.env.CLIENT_URL || 'http://localhost:5173')
    .split(',')[0]
    .trim()
    .replace(/\/$/, '');
  const lang = locale && /^en$|^ar$/.test(locale) ? locale : 'ar';
  const params = new URLSearchParams({ token: rawToken, lang });
  return `${clientUrl}/reset-password?${params.toString()}`;
};

export const forgotPassword = async (req, res) => {
  const { email, locale } = req.body || {};
  if (!email) return fail(res, 400, 'Email is required.');

  // Always respond 200 with the same message — never leak whether the email
  // exists. The mailer is only invoked when the user actually exists.
  const genericResponse = () =>
    success(res, {
      message:
        'If an account exists for that email, a password reset link has been sent.',
    });

  const user = await User.findOne({ email: String(email).toLowerCase().trim() });
  if (!user) return genericResponse();
  if (!user.isActive) return genericResponse();
  if (!isMailerConfigured()) {
    console.warn('⚠️  forgotPassword called but RESEND_API_KEY is not configured');
    return genericResponse();
  }

  try {
    const rawToken = await PasswordResetToken.createForUser(user._id, {
      ip: req.ip,
      userAgent: req.get('user-agent'),
    });
    const resetUrl = buildResetUrl(rawToken, locale);
    await sendPasswordResetEmail({
      to: user.email,
      name: user.name,
      resetUrl,
      locale,
    });
  } catch (err) {
    console.error('forgotPassword email error:', err);
    // Do not surface the underlying error to the client to avoid info leaks.
  }
  return genericResponse();
};

export const resetPassword = async (req, res) => {
  const { token, password } = req.body || {};
  if (!token || !password) {
    return fail(res, 400, 'Token and new password are required.');
  }
  if (typeof password !== 'string' || password.length < 6) {
    return fail(res, 400, 'Password must be at least 6 characters.');
  }

  const record = await PasswordResetToken.consume(token);
  if (!record) return fail(res, 400, 'This reset link is invalid or has expired.');

  const user = await User.findById(record.user);
  if (!user) return fail(res, 400, 'Account no longer exists.');
  if (!user.isActive) return fail(res, 403, 'Account is inactive.');

  user.password = password;
  await user.save(); // pre('save') hook re-hashes

  await logActivity({
    user: user._id,
    action: 'user.password_reset',
    entityType: 'User',
    entityId: user._id,
    description: `${user.email} reset their password`,
  });

  return success(res, { ok: true });
};
