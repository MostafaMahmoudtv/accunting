 import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import { User } from '../models/User.js';
import { Client } from '../models/Client.js';
import { Task } from '../models/Task.js';
import { Payment } from '../models/Payment.js';
import { Revenue } from '../models/Revenue.js';
import { Expense } from '../models/Expense.js';
import { Salary } from '../models/Salary.js';
import { Workflow } from '../models/Workflow.js';
import { Notification } from '../models/Notification.js';
import { ActivityLog } from '../models/ActivityLog.js';
import { Document } from '../models/Document.js';
import {
  ROLES,
  DEPARTMENTS,
  EXPENSE_CATEGORIES,
  REVENUE_CATEGORIES,
  PAYMENT_STATUS,
  TASK_STATUS,
  TASK_PRIORITY,
} from '../config/constants.js';
import { startOfMonth, endOfMonth } from '../utils/dates.js';

dotenv.config();

const clearDatabase = async () => {
  await Promise.all([
    User.deleteMany({}),
    Client.deleteMany({}),
    Task.deleteMany({}),
    Payment.deleteMany({}),
    Revenue.deleteMany({}),
    Expense.deleteMany({}),
    Salary.deleteMany({}),
    Workflow.deleteMany({}),
    Notification.deleteMany({}),
    ActivityLog.deleteMany({}),
    Document.deleteMany({}),
  ]);
};

const monthsAgo = (n) => {
  const d = new Date();
  d.setMonth(d.getMonth() - n);
  return d;
};

const daysAgo = (n) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
};

const daysFromNow = (n) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d;
};

const run = async () => {
  await connectDB();

  console.log('🌱 Seeding database…');

  await clearDatabase();

  // --- USERS ---
  const password = 'Password123!';

  // Accountants are recorded in the system but do NOT have login access —
  // they are created without a password.
  const users = await User.create([
    {
      name: 'Sara Admin',
      email: 'admin@demo.io',
      password,
      role: ROLES.SUPER_ADMIN,
      department: DEPARTMENTS.find((d) => d === 'management'),
      phone: '+966500000001',
    },
    {
      name: 'Mohammed Manager',
      email: 'manager@demo.io',
      password,
      role: ROLES.MANAGER,
      department: 'management',
      phone: '+966500000002',
    },
    {
      name: 'Aisha Accountant',
      email: 'accountant1@demo.io',
      role: ROLES.ACCOUNTANT,
      department: 'accounting',
      phone: '+966500000003',
    },
    {
      name: 'Omar Accountant',
      email: 'accountant2@demo.io',
      role: ROLES.ACCOUNTANT,
      department: 'accounting',
      phone: '+966500000004',
    },
    {
      name: 'Layla Accountant',
      email: 'accountant3@demo.io',
      role: ROLES.ACCOUNTANT,
      department: 'accounting',
      phone: '+966500000005',
    },
    {
      name: 'Hala CS',
      email: 'cs1@demo.io',
      role: ROLES.CUSTOMER_SERVICE,
      department: 'customer_service',
      phone: '+966500000006',
    },
    {
      name: 'Yara CS',
      email: 'cs2@demo.io',
      role: ROLES.CUSTOMER_SERVICE,
      department: 'customer_service',
      phone: '+966500000007',
    },
    {
      name: 'Noor Data',
      email: 'data1@demo.io',
      role: ROLES.ACCOUNTANT,
      department: 'accounting',
      phone: '+966500000008',
    },
  ]);

  const [admin, manager, acc1, acc2, acc3, cs1, cs2, data1] = users;

  const accountants = [acc1, acc2, acc3, data1];

  // --- WORKFLOWS ---
  const workflows = await Workflow.create([
    {
      name: 'Monthly Bookkeeping',
      description: 'Standard monthly bookkeeping flow',
      createdBy: manager._id,
      steps: [
        { name: 'Receive Documents', order: 1 },
        { name: 'Data Entry', order: 2 },
        { name: 'Accounting Review', order: 3 },
        { name: 'Financial Statements', order: 4 },
        { name: 'Manager Review', order: 5 },
        { name: 'Client Delivery', order: 6 },
        { name: 'Completed', order: 7 },
      ],
    },
    {
      name: 'Tax Filing',
      description: 'Annual tax filing workflow',
      createdBy: manager._id,
      steps: [
        { name: 'Collect Financials', order: 1 },
        { name: 'Prepare Tax Return', order: 2 },
        { name: 'Internal Review', order: 3 },
        { name: 'Client Approval', order: 4 },
        { name: 'Government Submission', order: 5 },
        { name: 'Completed', order: 6 },
      ],
    },
    {
      name: 'One-Time Engagement',
      description: 'One-time accounting service workflow',
      createdBy: manager._id,
      steps: [
        { name: 'Intake', order: 1 },
        { name: 'Document Collection', order: 2 },
        { name: 'Execution', order: 3 },
        { name: 'Delivery', order: 4 },
        { name: 'Completed', order: 5 },
      ],
    },
  ]);

  // --- CLIENTS ---
  const clientsRaw = [
    {
      name: 'Al Noor Trading',
      companyName: 'Al Noor Trading Co.',
      clientType: 'monthly',
      monthlyFee: 2500,
      assignedAccountant: acc1._id,
      assignedCustomerService: cs1._id,
      phone: '+96611000001',
      email: 'finance@alnoor.example',
      address: 'Riyadh',
      taxNumber: '300000000000001',
      paymentStatus: 'paid',
    },
    {
      name: 'Barakah Foods',
      companyName: 'Barakah Foods LLC',
      clientType: 'monthly',
      monthlyFee: 3200,
      assignedAccountant: acc2._id,
      assignedCustomerService: cs1._id,
      phone: '+96611000002',
      email: 'accounts@barakah.example',
      address: 'Jeddah',
      taxNumber: '300000000000002',
      paymentStatus: 'paid',
    },
    {
      name: 'Safa Logistics',
      companyName: 'Safa Logistics Group',
      clientType: 'monthly',
      monthlyFee: 4800,
      assignedAccountant: acc3._id,
      assignedCustomerService: cs2._id,
      phone: '+96611000003',
      email: 'finance@safa.example',
      address: 'Dammam',
      taxNumber: '300000000000003',
      paymentStatus: 'overdue',
    },
    {
      name: 'Mawared Tech',
      companyName: 'Mawared Technologies',
      clientType: 'monthly',
      monthlyFee: 5800,
      assignedAccountant: acc1._id,
      assignedCustomerService: cs2._id,
      phone: '+96611000004',
      email: 'billing@mawared.example',
      address: 'Riyadh',
      taxNumber: '300000000000004',
      paymentStatus: 'partially_paid',
    },
    {
      name: 'Rouh Construction',
      companyName: 'Rouh Construction',
      clientType: 'monthly',
      monthlyFee: 6000,
      assignedAccountant: acc2._id,
      assignedCustomerService: cs1._id,
      phone: '+96611000005',
      email: 'info@rouh.example',
      address: 'Mecca',
      taxNumber: '300000000000005',
      paymentStatus: 'unpaid',
    },
    {
      name: 'Tarek Al-Sayed',
      companyName: '',
      clientType: 'temporary',
      assignedAccountant: acc3._id,
      assignedCustomerService: cs2._id,
      phone: '+96611000006',
      email: 'tarek@example.com',
      address: 'Medina',
      taxNumber: '',
      paymentStatus: 'unpaid',
    },
    {
      name: 'Dana Real Estate',
      companyName: 'Dana Real Estate',
      clientType: 'temporary',
      assignedAccountant: acc1._id,
      assignedCustomerService: cs1._id,
      phone: '+96611000007',
      email: 'dana@re.example',
      address: 'Riyadh',
      taxNumber: '',
      paymentStatus: 'paid',
    },
    {
      name: 'Falak Marketing',
      companyName: 'Falak Marketing Agency',
      clientType: 'temporary',
      assignedAccountant: acc2._id,
      assignedCustomerService: cs2._id,
      phone: '+96611000008',
      email: 'hello@falak.example',
      address: 'Jeddah',
      taxNumber: '',
      paymentStatus: 'unpaid',
    },
    {
      name: 'Faisal Al-Harbi',
      companyName: '',
      clientType: 'one_time',
      assignedAccountant: acc3._id,
      assignedCustomerService: cs1._id,
      phone: '+96611000009',
      email: 'faisal@example.com',
      address: 'Riyadh',
      taxNumber: '',
      paymentStatus: 'paid',
    },
    {
      name: 'Iman Tailoring',
      companyName: 'Iman Tailoring & Fashion',
      clientType: 'one_time',
      assignedAccountant: acc1._id,
      assignedCustomerService: cs2._id,
      phone: '+96611000010',
      email: 'iman@fashion.example',
      address: 'Jeddah',
      taxNumber: '',
      paymentStatus: 'paid',
    },
    {
      name: 'Kayan Studio',
      companyName: 'Kayan Design Studio',
      clientType: 'one_time',
      assignedAccountant: acc2._id,
      assignedCustomerService: cs2._id,
      phone: '+96611000011',
      email: 'studio@kayan.example',
      address: 'Riyadh',
      taxNumber: '',
      paymentStatus: 'unpaid',
    },
  ];

  const clients = [];

  for (let i = 0; i < clientsRaw.length; i += 1) {
    const c = clientsRaw[i];

    const startDate = monthsAgo(2 + (i % 4));

    const endDate =
      c.clientType === 'temporary'
        ? daysFromNow(5 + i)
        : c.clientType === 'one_time'
          ? daysFromNow(20)
          : null;

    const billingDate =
      c.clientType === 'monthly'
        ? new Date(startDate.getFullYear(), startDate.getMonth() + 1, 1)
        : null;

    const client = await Client.create({
      ...c,
      startDate,
      endDate,
      billingDate,
      createdBy: manager._id,
    });

    clients.push(client);
  }

  // --- TASKS ---
  const tasks = [];

  const services = [
    'Bookkeeping',
    'Tax Filing',
    'Audit',
    'Payroll',
    'Financial Statements',
    'VAT Return',
    'Consulting',
  ];

  const priorities = TASK_PRIORITY;
  const statuses = TASK_STATUS;

  for (let i = 0; i < 25; i += 1) {
    const client = clients[i % clients.length];

    /*
     * IMPORTANT:
     * "overdue" is a PAYMENT_STATUS, not a TASK_STATUS.
     *
     * For overdue tasks we use "pending" as the task status
     * and set the dueDate in the past.
     */
    const isOverdue = i % 11 === 0;

    const status = isOverdue
      ? 'pending'
      : i % 7 === 0
        ? 'completed'
        : statuses[i % statuses.length];

    const assignee = accountants[i % accountants.length];

    const due = isOverdue
      ? daysAgo(2)
      : daysFromNow(i % 14);

    const start = daysAgo(10 - (i % 10));

    const completedAt =
      status === 'completed'
        ? daysAgo(i % 5)
        : undefined;

    const price =
      client.clientType === 'monthly'
        ? client.monthlyFee
        : 1500 + (i % 5) * 500;

    const task = await Task.create({
      title: `${services[i % services.length]} – ${client.name}`,
      description: `Complete ${services[i % services.length].toLowerCase()} for ${client.name}.`,
      client: client._id,
      service: services[i % services.length],
      assignedTo: assignee._id,
      createdBy: manager._id,
      priority: priorities[i % priorities.length],
      status,
      startDate: start,
      dueDate: due,
      estimatedHours: 4 + (i % 6),
      actualHours:
        status === 'completed'
          ? 4 + (i % 6)
          : i % 5,
      price,
      paymentStatus: client.paymentStatus,
      workflow: workflows[i % workflows.length]._id,
      completedAt,
    });

    tasks.push(task);
  }

  // --- PAYMENTS ---
  const payments = [];

  for (let i = 0; i < 30; i += 1) {
    const client = clients[i % clients.length];

    const amount =
      client.clientType === 'monthly'
        ? client.monthlyFee
        : 1000 + (i % 6) * 250;

    const monthOffset = i % 4;

    const due = monthsAgo(monthOffset);

    const paid = monthOffset > 0;

    const status = paid
      ? 'paid'
      : i % 3 === 0
        ? 'overdue'
        : i % 2 === 0
          ? 'unpaid'
          : 'partially_paid';

    const payment = await Payment.create({
      client: client._id,
      invoice: `INV-${1000 + i}`,
      amount,
      paymentDate: paid ? due : null,
      dueDate: due,
      paymentMethod: ['bank_transfer', 'cash', 'card'][i % 3],
      status,
      createdBy: manager._id,
    });

    payments.push(payment);
  }

  // --- REVENUE (last 6 months) ---
  for (let m = 0; m < 6; m += 1) {
    for (let i = 0; i < 4; i += 1) {
      const client = clients[(m + i) % clients.length];

      const amount =
        client.clientType === 'monthly'
          ? client.monthlyFee
          : 2000 + i * 350;

      await Revenue.create({
        client: client._id,
        amount,
        category:
          REVENUE_CATEGORIES[
            i % REVENUE_CATEGORIES.length
          ],
        date: monthsAgo(m),
        description: `Monthly revenue for ${client.name}`,
        paymentStatus: 'paid',
        createdBy: manager._id,
      });
    }
  }

  // --- EXPENSES ---
  for (let m = 0; m < 6; m += 1) {
    for (let i = 0; i < 5; i += 1) {
      const cat =
        EXPENSE_CATEGORIES[
          (m + i) % EXPENSE_CATEGORIES.length
        ];

      await Expense.create({
        title: `${cat} expense ${m}-${i}`,
        amount:
          500 +
          i * 220 +
          (cat === 'marketing' ? 600 : 0),
        category: cat,
        date: monthsAgo(m),
        description: `${cat} monthly cost`,
        paidBy: 'Company',
        createdBy: manager._id,
      });
    }
  }

  // --- SALARIES ---
  for (const u of users.slice(1)) {
    for (let m = 0; m < 3; m += 1) {
      const d = monthsAgo(m);

      const base =
        u.role === ROLES.MANAGER
          ? 12000
          : u.role === ROLES.ACCOUNTANT
            ? 9000
            : 5000;

      await Salary.create({
        employee: u._id,
        baseSalary: base,
        bonus: m === 0 ? 500 : 0,
        deductions: m === 1 ? 200 : 0,
        netSalary:
          base +
          (m === 0 ? 500 : 0) -
          (m === 1 ? 200 : 0),
        paymentDate: d,
        periodMonth: d.getMonth() + 1,
        periodYear: d.getFullYear(),
        paymentStatus: 'paid',
        createdBy: admin._id,
      });
    }
  }

  // --- NOTIFICATIONS ---
  await Notification.create([
    {
      recipient: acc1._id,
      title: 'New task assigned',
      body: 'You have been assigned: Bookkeeping – Al Noor Trading',
      type: 'task_assigned',
      link: '/tasks',
    },
    {
      recipient: acc1._id,
      title: 'Payment overdue',
      body: 'Mawared Tech has an overdue payment',
      type: 'payment_overdue',
      link: '/payments',
    },
    {
      recipient: manager._id,
      title: 'New client',
      body: 'Kayan Studio was added by Hala CS',
      type: 'new_client',
      link: '/clients',
    },
    {
      recipient: acc2._id,
      title: 'Task due soon',
      body: 'Barakah Foods tax filing is due in 2 days',
      type: 'task_deadline',
    },
    {
      recipient: data1._id,
      title: 'New task assigned',
      body: 'Please process payroll for Al Noor',
      type: 'task_assigned',
    },
  ]);

  // --- ACTIVITY LOGS ---
  await ActivityLog.create([
    {
      user: manager._id,
      action: 'client.create',
      entityType: 'Client',
      entityId: clients[0]._id,
      description: `Created client ${clients[0].name}`,
    },
    {
      user: acc1._id,
      action: 'task.complete',
      entityType: 'Task',
      entityId: tasks[0]._id,
      description: `Completed task "${tasks[0].title}"`,
    },
    {
      user: admin._id,
      action: 'user.create',
      entityType: 'User',
      entityId: acc1._id,
      description: 'Created user accountant1@demo.io',
    },
    {
      user: manager._id,
      action: 'payment.create',
      entityType: 'Payment',
      entityId: payments[0]._id,
      description: 'Created payment INV-1000',
    },
    {
      user: cs1._id,
      action: 'client.create',
      entityType: 'Client',
      entityId: clients[5]._id,
      description: `Created client ${clients[5].name}`,
    },
  ]);

  // --- DOCUMENTS ---
  await Document.create([
    {
      name: 'Al Noor Contract.pdf',
      url: '/uploads/alnoor-contract.pdf',
      type: 'application/pdf',
      size: 120000,
      uploadedBy: cs1._id,
      client: clients[0]._id,
    },
    {
      name: 'Tax Return Draft.docx',
      url: '/uploads/tax-return.docx',
      type: 'application/docx',
      size: 80000,
      uploadedBy: acc1._id,
      client: clients[2]._id,
      task: tasks[1]._id,
    },
  ]);

  console.log('✅ Seed complete.');

  console.log('   Login with:');
  console.log('   admin@demo.io / Password123!  (super_admin)');
  console.log('   manager@demo.io / Password123!  (manager)');
  console.log('   accountant1@demo.io  (accountant — recorded, no login access)');

  await mongoose.connection.close();

  process.exit(0);
};

run().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
 