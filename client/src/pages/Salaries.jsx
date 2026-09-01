import CrudPage from '../components/ui/CrudPage';
import SalaryForm from '../components/forms/SalaryForm';
import { useTranslation } from 'react-i18next';
import { fmtDate, fmtMoney } from '../utils/format';
import StatusBadge from '../components/ui/StatusBadge';
import { PAYMENT_STATUS } from '../utils/constants';

const Salaries = () => {
  const { t, i18n } = useTranslation();
  const columns = [
    { key: 'employee', header: t('salaries.employee'), render: (r) => r.employee?.name || '—' },
    { key: 'baseSalary', header: t('salaries.baseSalary'), render: (r) => fmtMoney(r.baseSalary, 'SAR', i18n.language) },
    { key: 'bonus', header: t('salaries.bonus'), render: (r) => r.bonus || '—' },
    { key: 'deductions', header: t('salaries.deductions'), render: (r) => r.deductions || '—' },
    {
      key: 'netSalary',
      header: t('salaries.netSalary'),
      render: (r) => <span className="font-semibold">{fmtMoney(r.netSalary, 'SAR', i18n.language)}</span>,
    },
    { key: 'period', header: t('salaries.period'), render: (r) => `${r.periodYear}-${String(r.periodMonth).padStart(2, '0')}` },
    { key: 'paymentDate', header: t('salaries.paymentDate'), render: (r) => fmtDate(r.paymentDate, i18n.language) },
    {
      key: 'paymentStatus',
      header: t('common.status'),
      render: (r) => <StatusBadge status={r.paymentStatus} label={t(`common.${r.paymentStatus === 'partially_paid' ? 'partial' : r.paymentStatus}`)} />,
    },
  ];
  return (
    <CrudPage
      title={t('salaries.title')}
      subtitle={t('salaries.subtitle')}
      addLabel={t('salaries.add')}
      endpoint="salaries"
      queryKey="salaries"
      columns={columns}
      FormComponent={SalaryForm}
      filters={[{ key: 'status', label: t('common.status'), options: PAYMENT_STATUS.map((p) => ({ value: p, label: t(`common.${p === 'partially_paid' ? 'partial' : p}`) })) }]}
    />
  );
};

export default Salaries;
