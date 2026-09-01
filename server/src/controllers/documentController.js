import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import multer from 'multer';
import { v4 as uuid } from 'uuid';
import { Document } from '../models/Document.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { success, created, fail } from '../utils/apiResponse.js';
import { logActivity } from '../services/activityService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOAD_ROOT = path.resolve(__dirname, '../../uploads');

// Ensure upload root exists
if (!fs.existsSync(UPLOAD_ROOT)) {
  fs.mkdirSync(UPLOAD_ROOT, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const now = new Date();
    const sub = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const dir = path.join(UPLOAD_ROOT, sub);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const safe = file.originalname.replace(/[^\w.\-]+/g, '_');
    cb(null, `${Date.now()}-${uuid().slice(0, 8)}-${safe}`);
  },
});

export const uploadMiddleware = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB
});

export const listDocuments = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.client) filter.client = req.query.client;
  if (req.query.task) filter.task = req.query.task;
  if (req.query.payment) filter.payment = req.query.payment;
  if (req.query.expense) filter.expense = req.query.expense;
  const items = await Document.find(filter)
    .populate('uploadedBy', 'name email')
    .populate('client', 'name')
    .populate('task', 'title')
    .sort({ createdAt: -1 });
  return success(res, items);
});

export const createDocument = asyncHandler(async (req, res) => {
  if (req.file) {
    const now = new Date();
    const sub = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const url = `/uploads/${sub}/${req.file.filename}`;
    const doc = await Document.create({
      name: req.body.name || req.file.originalname,
      url,
      type: req.file.mimetype,
      size: req.file.size,
      uploadedBy: req.user._id,
      client: req.body.client || undefined,
      task: req.body.task || undefined,
      payment: req.body.payment || undefined,
      expense: req.body.expense || undefined,
    });
    await logActivity({
      user: req.user._id,
      action: 'document.upload',
      entityType: 'Document',
      entityId: doc._id,
      description: `Uploaded ${doc.name}`,
    });
    return created(res, doc);
  }
  // No file: create a metadata-only record
  if (!req.body.name || !req.body.url) {
    return fail(res, 400, 'Provide a file or a name and url.');
  }
  const doc = await Document.create({
    ...req.body,
    uploadedBy: req.user._id,
  });
  await logActivity({
    user: req.user._id,
    action: 'document.create',
    entityType: 'Document',
    entityId: doc._id,
    description: `Linked document ${doc.name}`,
  });
  return created(res, doc);
});

export const deleteDocument = asyncHandler(async (req, res) => {
  const doc = await Document.findById(req.params.id);
  if (!doc) return fail(res, 404, 'Document not found.');
  // Try to remove the underlying file (best effort)
  if (doc.url && doc.url.startsWith('/uploads/')) {
    const filePath = path.join(UPLOAD_ROOT, doc.url.replace('/uploads/', ''));
    fs.unlink(filePath, () => {});
  }
  await doc.deleteOne();
  await logActivity({
    user: req.user._id,
    action: 'document.delete',
    entityType: 'Document',
    entityId: doc._id,
    description: `Deleted document ${doc.name}`,
  });
  return success(res, { ok: true });
});
