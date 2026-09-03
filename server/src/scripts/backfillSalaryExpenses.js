/**
 * Backfill script: for every existing Salary with paymentStatus='paid' that
 * has no linked Expense, create one (category=salary). Idempotent — safe to
 * re-run; it skips salaries that already have an expense.
 *
 * Run with: node --experimental-vm-modules src/scripts/backfillSalaryExpenses.js
 * Or via the helper at the bottom of this file.
 */
import mongoose from 'mongoose';
import { Salary } from '../models/Salary.js';
import { Expense } from '../models/Expense.js';
import { User } from '../models/User.js';
import { connectDB } from '../config/db.js';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const buildTitle = (name, periodMonth, periodYear) =>
  `Salary — ${name || 'Employee'} (${MONTHS[(periodMonth || 1) - 1]} ${periodYear})`;

const run = async () => {
  await connectDB();
  const paidSalaries = await Salary.find({ paymentStatus: 'paid' });
  console.log(`Found ${paidSalaries.length} paid salaries.`);

  let created = 0;
  let skipped = 0;
  for (const salary of paidSalaries) {
    const existing = await Expense.findOne({ sourceSalary: salary._id });
    if (existing) {
      skipped += 1;
      continue;
    }
    const employee = await User.findById(salary.employee).select('name');
    await Expense.create({
      title: buildTitle(employee?.name, salary.periodMonth, salary.periodYear),
      amount: salary.netSalary,
      category: 'salary',
      date: salary.paymentDate || new Date(),
      description: salary.notes,
      paidBy: 'bank_transfer',
      sourceSalary: salary._id,
      createdBy: salary.createdBy,
    });
    created += 1;
  }
  console.log(`Created ${created} expense(s), skipped ${skipped} (already linked).`);
  await mongoose.disconnect();
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
