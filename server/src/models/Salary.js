import mongoose from 'mongoose';
import { PAYMENT_STATUS } from '../config/constants.js';

const salarySchema = new mongoose.Schema(
  {
    employee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    baseSalary: { type: Number, required: true, min: 0 },
    bonus: { type: Number, default: 0, min: 0 },
    deductions: { type: Number, default: 0, min: 0 },
    netSalary: { type: Number, required: true, min: 0 },
    paymentDate: { type: Date, default: Date.now, index: true },
    paymentStatus: { type: String, enum: PAYMENT_STATUS, default: 'paid' },
    notes: { type: String, trim: true },
    periodMonth: { type: Number, min: 1, max: 12, required: true, index: true },
    periodYear: { type: Number, required: true, index: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

salarySchema.index({ employee: 1, periodYear: -1, periodMonth: -1 });

salarySchema.pre('validate', function (next) {
  this.netSalary = (this.baseSalary || 0) + (this.bonus || 0) - (this.deductions || 0);
  next();
});

export const Salary = mongoose.model('Salary', salarySchema);
