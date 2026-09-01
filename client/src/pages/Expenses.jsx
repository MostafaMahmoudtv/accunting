import CrudPage from '../components/ui/CrudPage';
import ExpenseForm from '../components/forms/ExpenseForm';
import { useTranslation } from 'react-i18next';
import { fmtDate, fmtMoney } from '../utils/format';
import { EXPENSE_CATEGORIES } from '../utils/constants';
import StatusBadge from '../components/ui/StatusBadge';

const Expenses = () => {
  const { t, i18n } = useTranslation();
  const columns = [
    { key: 'title', header: t('common.title'), render: (r) => <span className="font-medium">{r.title}</span> },
    { key: 'category', header: t('common.category'), render: (r) => <StatusBadge status="overdue" label={t(`expenses.categories.${r.category}`)} /> },
    { key: 'date', header: t('common.date'), render: (r) => fmtDate(r.date, i18n.language) },
    {
      key: 'amount',
      header: t('common.amount'),
      render: (r) => <span className="font-semibold text-rose-600">{fmtMoney(r.amount, 'SAR', i18n.language)}</span>,
    },
    { key: 'paidBy', header: t('expenses.paidBy'), render: (r) => r.paidBy || '—' },
  ];
  return (
    <CrudPage
      title={t('expenses.title')}
      subtitle={t('expenses.subtitle')}
      addLabel={t('expenses.add')}
      endpoint="expenses"
      queryKey="expenses"
      columns={columns}
      FormComponent={ExpenseForm}
      filters={[{ key: 'category', label: t('common.category'), options: EXPENSE_CATEGORIES.map((c) => ({ value: c, label: t(`expenses.categories.${c}`) })) }]}
    />
  );
};

export default Expenses;
