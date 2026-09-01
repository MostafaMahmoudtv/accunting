import mongoose from 'mongoose';
import { PAYMENT_STATUS, PAYMENT_METHODS } from '../config/constants.js';

const paymentSchema = new mongoose.Schema(
  {
    client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true, index: true },
    invoice: { type: String, trim: true },
    amount: { type: Number, required: true, min: 0 },
    paymentDate: { type: Date },
    dueDate: { type: Date, index: true },
    paymentMethod: { type: String, enum: PAYMENT_METHODS, default: 'bank_transfer' },
    status: { type: String, enum: PAYMENT_STATUS, default: 'unpaid', index: true },
    notes: { type: String },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

export const Payment = mongoose.model('Payment', paymentSchema);
