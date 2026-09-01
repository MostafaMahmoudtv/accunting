import mongoose from 'mongoose';
import { TASK_STATUS, TASK_PRIORITY, PAYMENT_STATUS } from '../config/constants.js';

const commentSchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

const attachmentSchema = new mongoose.Schema(
  {
    name: String,
    url: String,
    type: String,
    size: Number,
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, index: true },
    description: { type: String },
    client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', index: true },
    service: { type: String, trim: true },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    priority: { type: String, enum: TASK_PRIORITY, default: 'medium', index: true },
    status: { type: String, enum: TASK_STATUS, default: 'new', index: true },
    startDate: { type: Date },
    dueDate: { type: Date, index: true },
    estimatedHours: { type: Number, default: 0 },
    actualHours: { type: Number, default: 0 },
    price: { type: Number, default: 0 },
    paymentStatus: { type: String, enum: PAYMENT_STATUS, default: 'unpaid' },
    workflow: { type: mongoose.Schema.Types.ObjectId, ref: 'Workflow' },
    attachments: [attachmentSchema],
    comments: [commentSchema],
    completedAt: { type: Date },
  },
  { timestamps: true }
);

taskSchema.index({ title: 'text', description: 'text', service: 'text' });

export const Task = mongoose.model('Task', taskSchema);
