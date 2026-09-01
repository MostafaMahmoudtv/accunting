export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  MANAGER: 'manager',
  ACCOUNTANT: 'accountant',
  CUSTOMER_SERVICE: 'customer_service',
};

export const ROLE_LIST = Object.values(ROLES);

export const CLIENT_TYPES = ['monthly', 'temporary', 'one_time'];

export const CLIENT_STATUS = ['active', 'inactive', 'archived'];

export const PAYMENT_STATUS = ['paid', 'unpaid', 'partially_paid', 'overdue'];

export const TASK_STATUS = [
  'new',
  'pending',
  'in_progress',
  'waiting_client',
  'under_review',
  'completed',
  'cancelled',
];

export const TASK_PRIORITY = ['low', 'medium', 'high', 'urgent'];

export const EXPENSE_CATEGORIES = [
  'salary',
  'marketing',
  'office',
  'software',
  'hosting',
  'transportation',
  'communication',
  'equipment',
  'other',
];

export const REVENUE_CATEGORIES = [
  'monthly_subscription',
  'temporary_service',
  'one_time_service',
  'other',
];

export const DEPARTMENTS = [
  'accounting',
  'customer_service',
  'management',
];

export const PAYMENT_METHODS = ['cash', 'bank_transfer', 'card', 'check', 'other'];
