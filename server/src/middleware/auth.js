import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { fail } from '../utils/apiResponse.js';

export const protect = async (req, res, next) => {
  try {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith('Bearer ')) {
      return fail(res, 401, 'Not authenticated. Please log in.');
    }
    const token = auth.split(' ')[1];
    if (!token) return fail(res, 401, 'Not authenticated. Please log in.');

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) {
      return fail(res, 401, 'User no longer exists or is inactive.');
    }
    req.user = user;
    next();
  } catch (err) {
    return fail(res, 401, 'Invalid or expired token.');
  }
};

export const authorize =
  (...allowedRoles) =>
  (req, res, next) => {
    if (!req.user) return fail(res, 401, 'Not authenticated.');
    if (!allowedRoles.includes(req.user.role)) {
      return fail(res, 403, 'You do not have permission to perform this action.');
    }
    next();
  };
