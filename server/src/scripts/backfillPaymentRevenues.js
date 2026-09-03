/**
 * Backfill script: for every existing Payment that has no linked Revenue,
 * create one. Idempotent — safe to re-run.
 *
 * Run with: node src/scripts/backfillPaymentRevenues.js
 */
import 'dotenv/config';
import mongoose from 'mongoose';
import { Payment } from '../models/Payment.js';
import { Revenue } from '../models/Revenue.js';
import { Client } from '../models/Client.js';
import { connectDB } from '../config/db.js';

const run = async () => {
  await connectDB();
  const payments = await Payment.find();
  console.log(`Found ${payments.length} payments.`);

  let created = 0;
  let skipped = 0;
  for (const payment of payments) {
    const existing = await Revenue.findOne({ sourcePayment: payment._id });
    if (existing) {
      skipped += 1;
      continue;
    }
    let clientName = '';
    if (payment.client) {
      const c = await Client.findById(payment.client).select('name companyName');
      clientName = c?.companyName || c?.name || '';
    }
    const title = clientName
      ? `Payment from ${clientName}`
      : `Payment ${payment.invoice || payment._id.toString().slice(-6)}`;
    await Revenue.create({
      title,
      client: payment.client,
      amount: payment.amount,
      category: 'other',
      date: payment.paymentDate || new Date(),
      description: payment.notes,
      paymentStatus: payment.status,
      sourcePayment: payment._id,
      createdBy: payment.createdBy,
    });
    created += 1;
    console.log(`  + ${title} (${payment.amount}) [${payment.status}]`);
  }
  console.log(`Created ${created} revenue(s), skipped ${skipped} (already linked).`);
  await mongoose.disconnect();
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
