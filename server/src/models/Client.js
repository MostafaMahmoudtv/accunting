import mongoose from 'mongoose';
import { CLIENT_TYPES, CLIENT_STATUS, PAYMENT_STATUS } from '../config/constants.js';

const noteSchema = new mongoose.Schema(
  {
    content: { type: String, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

const clientSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, index: true },
    companyName: { type: String, trim: true, index: true },
    phone: { type: String, trim: true, index: true },
    email: { type: String, trim: true, lowercase: true, index: true },
    address: { type: String, trim: true },
    taxNumber: { type: String, trim: true, index: true },
    clientType: { type: String, enum: CLIENT_TYPES, required: true, index: true },
    monthlyFee: { type: Number, default: 0 },
    startDate: { type: Date },
    endDate: { type: Date },
    billingDate: { type: Date },
    paymentStatus: {
      type: String,
      enum: PAYMENT_STATUS,
      default: 'unpaid',
      index: true,
    },
    assignedAccountant: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    assignedCustomerService: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    status: { type: String, enum: CLIENT_STATUS, default: 'active', index: true },
    generalNotes: { type: String, trim: true },
    timeline: [noteSchema],
    documents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Document' }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

clientSchema.index({ name: 'text', companyName: 'text', email: 'text', phone: 'text', taxNumber: 'text' });

export const Client = mongoose.model('Client', clientSchema);
