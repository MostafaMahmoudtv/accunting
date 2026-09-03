import mongoose from 'mongoose';
import { REVENUE_CATEGORIES, PAYMENT_STATUS } from '../config/constants.js';

const revenueSchema = new mongoose.Schema(
  {
    title: { type: String, trim: true },
    client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', index: true },
    amount: { type: Number, required: true, min: 0 },
    category: { type: String, enum: REVENUE_CATEGORIES, default: 'other', index: true },
    date: { type: Date, default: Date.now, index: true },
    description: { type: String, trim: true },
    paymentStatus: { type: String, enum: PAYMENT_STATUS, default: 'paid' },
    // When a payment flips to "paid", an auto-generated revenue record is
    // created and linked back to that payment so the two stay in sync.
    sourcePayment: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

revenueSchema.index({ sourcePayment: 1 }, { unique: true, sparse: true });

export const Revenue = mongoose.model('Revenue', revenueSchema);
