import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true },
    body: { type: String, trim: true },
    type: {
      type: String,
      enum: ['task_assigned', 'task_deadline', 'task_overdue', 'payment_overdue', 'new_client', 'payment_received', 'general'],
      default: 'general',
    },
    isRead: { type: Boolean, default: false, index: true },
    link: { type: String },
    relatedEntity: {
      entityType: { type: String },
      entityId: { type: mongoose.Schema.Types.ObjectId },
    },
  },
  { timestamps: true }
);

export const Notification = mongoose.model('Notification', notificationSchema);
