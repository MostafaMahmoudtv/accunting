import mongoose from 'mongoose';
import { EXPENSE_CATEGORIES } from '../config/constants.js';

const expenseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, index: true },
    amount: { type: Number, required: true, min: 0 },
    category: { type: String, enum: EXPENSE_CATEGORIES, default: 'other', index: true },
    date: { type: Date, default: Date.now, index: true },
    description: { type: String, trim: true },
    paidBy: { type: String, trim: true },
    receipt: { url: String, name: String },
    notes: { type: String },
    sourceSalary: { type: mongoose.Schema.Types.ObjectId, ref: 'Salary' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

expenseSchema.index({ sourceSalary: 1 }, { unique: true, sparse: true });

export const Expense = mongoose.model('Expense', expenseSchema);
