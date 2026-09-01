import { format, formatDistanceToNow, parseISO } from 'date-fns';
import ar from 'date-fns/locale/ar';
import en from 'date-fns/locale/en-US';

export const fmtMoney = (value, currency = 'SAR', locale = 'en') => {
  const num = Number(value || 0);
  return new Intl.NumberFormat(locale === 'ar' ? 'ar-SA' : 'en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(num);
};

export const fmtNumber = (value, locale = 'en') => {
  return new Intl.NumberFormat(locale === 'ar' ? 'ar-SA' : 'en-US').format(Number(value || 0));
};

export const fmtDate = (value, locale = 'en', withTime = false) => {
  if (!value) return '—';
  try {
    const d = typeof value === 'string' ? parseISO(value) : new Date(value);
    return format(d, withTime ? 'PPp' : 'PP', { locale: locale === 'ar' ? ar : en });
  } catch {
    return '—';
  }
};

export const fmtRelative = (value, locale = 'en') => {
  if (!value) return '—';
  try {
    const d = typeof value === 'string' ? parseISO(value) : new Date(value);
    return formatDistanceToNow(d, { addSuffix: true, locale: locale === 'ar' ? ar : en });
  } catch {
    return '—';
  }
};

export const initials = (name = '') => {
  return name
    .split(' ')
    .filter(Boolean)
    .map((p) => p[0]?.toUpperCase())
    .slice(0, 2)
    .join('');
};
