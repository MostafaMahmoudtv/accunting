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
  'overdue',
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
export const REVENUE_CATEGORIES = ['monthly_subscription', 'temporary_service', 'one_time_service', 'other'];
export const DEPARTMENTS = ['accounting', 'customer_service', 'management'];
export const PAYMENT_METHODS = ['cash', 'bank_transfer', 'card', 'check', 'other'];
export const ROLES = ['super_admin', 'manager', 'accountant', 'customer_service'];

export const statusColor = (status) => {
  const map = {
    paid: 'bg-emerald-100 text-emerald-700',
    unpaid: 'bg-amber-100 text-amber-700',
    partially_paid: 'bg-sky-100 text-sky-700',
    overdue: 'bg-rose-100 text-rose-700',
    active: 'bg-emerald-100 text-emerald-700',
    inactive: 'bg-ink-100 text-ink-700',
    archived: 'bg-ink-200 text-ink-700',
    new: 'bg-sky-100 text-sky-700',
    pending: 'bg-amber-100 text-amber-700',
    in_progress: 'bg-indigo-100 text-indigo-700',
    waiting_client: 'bg-fuchsia-100 text-fuchsia-700',
    under_review: 'bg-violet-100 text-violet-700',
    completed: 'bg-emerald-100 text-emerald-700',
    cancelled: 'bg-ink-200 text-ink-700',
    low: 'bg-emerald-100 text-emerald-700',
    medium: 'bg-sky-100 text-sky-700',
    high: 'bg-amber-100 text-amber-700',
    urgent: 'bg-rose-100 text-rose-700',
  };
  return map[status] || 'bg-ink-100 text-ink-700';
};
