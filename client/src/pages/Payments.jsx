import CrudPage from '../components/ui/CrudPage';
import PaymentForm from '../components/forms/PaymentForm';
import { useTranslation } from 'react-i18next';
import StatusBadge from '../components/ui/StatusBadge';
import { fmtDate, fmtMoney } from '../utils/format';
import { PAYMENT_STATUS } from '../utils/constants';
import { useAuth } from '../context/AuthContext';

const Payments = () => {
  const { t, i18n } = useTranslation();
  const { canSeeFinancials } = useAuth();
  const columns = [
    { key: 'invoice', header: t('payments.invoice'), render: (r) => r.invoice || '—' },
    { key: 'client', header: t('common.name'), render: (r) => r.client?.name || '—' },
    {
      key: 'amount',
      header: t('common.amount'),
      render: (r) => <span className="font-semibold">{fmtMoney(r.amount, 'SAR', i18n.language)}</span>,
    },
    {
      key: 'status',
      header: t('common.status'),
      render: (r) => <StatusBadge status={r.status} label={t(`common.${r.status === 'partially_paid' ? 'partial' : r.status}`)} />,
    },
    { key: 'paymentMethod', header: t('payments.paymentMethod'), render: (r) => t(`payments.method.${r.paymentMethod}`) },
    { key: 'paymentDate', header: t('payments.paymentDate'), render: (r) => fmtDate(r.paymentDate, i18n.language) },
    { key: 'dueDate', header: t('payments.dueDate'), render: (r) => fmtDate(r.dueDate, i18n.language) },
  ];
  return (
    <CrudPage
      title={t('payments.title')}
      subtitle={t('payments.subtitle')}
      addLabel={t('payments.add')}
      endpoint="payments"
      queryKey="payments"
      columns={columns}
      FormComponent={PaymentForm}
      canEdit={canSeeFinancials ? () => true : () => false}
      filters={[{ key: 'status', label: t('common.status'), options: PAYMENT_STATUS.map((p) => ({ value: p, label: t(`common.${p === 'partially_paid' ? 'partial' : p}`) })) }]}
    />
  );
};

export default Payments;
