import CrudPage from '../components/ui/CrudPage';
import RevenueForm from '../components/forms/RevenueForm';
import { useTranslation } from 'react-i18next';
import { fmtDate, fmtMoney } from '../utils/format';
import { REVENUE_CATEGORIES } from '../utils/constants';
import StatusBadge from '../components/ui/StatusBadge';

const Revenue = () => {
  const { t, i18n } = useTranslation();
  const columns = [
    { key: 'date', header: t('common.date'), render: (r) => fmtDate(r.date, i18n.language) },
    { key: 'client', header: t('common.name'), render: (r) => r.client?.name || '—' },
    { key: 'category', header: t('common.category'), render: (r) => <StatusBadge status="in_progress" label={t(`revenue.categories.${r.category}`)} /> },
    {
      key: 'amount',
      header: t('common.amount'),
      render: (r) => <span className="font-semibold text-emerald-600">{fmtMoney(r.amount, 'SAR', i18n.language)}</span>,
    },
    { key: 'description', header: t('common.description'), render: (r) => r.description || '—' },
  ];
  return (
    <CrudPage
      title={t('revenue.title')}
      subtitle={t('revenue.subtitle')}
      addLabel={t('revenue.add')}
      endpoint="revenue"
      queryKey="revenue"
      columns={columns}
      FormComponent={RevenueForm}
      filters={[{ key: 'category', label: t('common.category'), options: REVENUE_CATEGORIES.map((c) => ({ value: c, label: t(`revenue.categories.${c}`) })) }]}
    />
  );
};

export default Revenue;
