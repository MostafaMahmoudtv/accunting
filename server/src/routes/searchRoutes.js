import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { Client } from '../models/Client.js';
import { Task } from '../models/Task.js';
import { User } from '../models/User.js';
import { Payment } from '../models/Payment.js';
import { Expense } from '../models/Expense.js';

const router = Router();
router.use(protect);

router.get('/', async (req, res) => {
  const q = (req.query.q || '').trim();
  if (!q) return res.json({ success: true, data: { clients: [], tasks: [], employees: [], payments: [], expenses: [] } });
  const re = new RegExp(q, 'i');
  const [clients, tasks, employees, payments, expenses] = await Promise.all([
    Client.find({ $or: [{ name: re }, { companyName: re }, { email: re }, { phone: re }, { taxNumber: re }] })
      .limit(5)
      .select('name companyName clientType'),
    Task.find({ $or: [{ title: re }, { description: re }, { service: re }] })
      .limit(5)
      .select('title status priority'),
    User.find({ $or: [{ name: re }, { email: re }] }).limit(5).select('name email role'),
    Payment.find({ invoice: re }).limit(5).populate('client', 'name'),
    Expense.find({ $or: [{ title: re }, { description: re }] }).limit(5).select('title amount category'),
  ]);
  res.json({
    success: true,
    data: { clients, tasks, employees, payments, expenses },
  });
});

export default router;
