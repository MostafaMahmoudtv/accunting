import multer from 'multer';
import { fail } from '../utils/apiResponse.js';

export const notFound = (req, res, next) => {
  return fail(res, 404, `Route not found: ${req.method} ${req.originalUrl}`);
};

// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, next) => {
  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((e) => ({ field: e.path, message: e.message }));
    console.warn('⚠️  Validation error on', req.method, req.originalUrl, '→', errors);
    return fail(res, 422, 'Validation failed', errors);
  }
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return fail(res, 409, `Duplicate value for ${field}`);
  }
  if (err.name === 'CastError') {
    return fail(res, 400, `Invalid value for ${err.path}`);
  }
  if (err instanceof multer.MulterError) {
    return fail(res, 400, `Upload error: ${err.message}`);
  }
  const status = err.statusCode || 500;
  const message = err.message || 'Internal server error';
  if (status >= 500) console.error('🔥 Server error:', err);
  return fail(res, status, message);
};
