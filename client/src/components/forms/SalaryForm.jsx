import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { FormInput, FormSelect, FormTextarea } from '../ui/FormFields';
import FormFooter from '../ui/FormFooter';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import { PAYMENT_STATUS } from '../../utils/constants';

const SalaryForm = ({ defaultValues, onSubmit, onCancel, loading, serverErrors }) => {
  const { t } = useTranslation();
  const { data: users } = useQuery({
    queryKey: ['users-list'],
    queryFn: async () => (await api.get('/users?limit=200')).data.data,
  });

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setError,
    formState: { errors },
  } = useForm({
    defaultValues: defaultValues || {
      baseSalary: 0,
      bonus: 0,
      deductions: 0,
      periodMonth: new Date().getMonth() + 1,
      periodYear: new Date().getFullYear(),
      paymentStatus: 'paid',
    },
  });

  useEffect(() => {
    if (defaultValues) {
      reset({
        ...defaultValues,
        employee: defaultValues.employee?._id || defaultValues.employee,
        paymentDate: defaultValues.paymentDate ? defaultValues.paymentDate.slice(0, 10) : '',
      });
    }
  }, [defaultValues, reset]);

  // Map server-side validation errors onto RHF fields so they render inline.
  useEffect(() => {
    if (!serverErrors) return;
    for (const [field, message] of Object.entries(serverErrors)) {
      setError(field, { type: 'server', message });
    }
  }, [serverErrors, setError]);

  const base = Number(watch('baseSalary') || 0);
  const bonus = Number(watch('bonus') || 0);
  const ded = Number(watch('deductions') || 0);
  const net = base + bonus - ded;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <FormSelect
          label={t('salaries.employee')}
          {...register('employee', { required: true })}
          error={errors.employee?.message}
        >
          <option value="">—</option>
          {users?.map((u) => (
            <option key={u._id} value={u._id}>{u.name}</option>
          ))}
        </FormSelect>
        <FormInput
          label={t('salaries.baseSalary')}
          type="number"
          step="0.01"
          {...register('baseSalary', { required: true })}
          error={errors.baseSalary?.message}
        />
        <FormInput
          label={t('salaries.bonus')}
          type="number"
          step="0.01"
          {...register('bonus')}
          error={errors.bonus?.message}
        />
        <FormInput
          label={t('salaries.deductions')}
          type="number"
          step="0.01"
          {...register('deductions')}
          error={errors.deductions?.message}
        />
        <FormInput
          label={t('salaries.paymentDate')}
          type="date"
          {...register('paymentDate')}
          error={errors.paymentDate?.message}
        />
        <FormSelect
          label={t('salaries.paymentStatus')}
          {...register('paymentStatus')}
          error={errors.paymentStatus?.message}
        >
          {PAYMENT_STATUS.map((p) => (
            <option key={p} value={p}>{t(`common.${p === 'partially_paid' ? 'partial' : p}`)}</option>
          ))}
        </FormSelect>
        <FormInput
          label={t('salaries.month')}
          type="number"
          min="1"
          max="12"
          {...register('periodMonth', { required: true })}
          error={errors.periodMonth?.message}
        />
        <FormInput
          label={t('salaries.year')}
          type="number"
          {...register('periodYear', { required: true })}
          error={errors.periodYear?.message}
        />
        <div className="md:col-span-2 p-3 rounded-xl bg-app-muted text-sm font-semibold flex items-center justify-between text-app-heading border border-app-border">
          <span>{t('salaries.netSalary')}</span>
          <span className="text-brand-500">{net.toFixed(2)}</span>
        </div>
        <FormTextarea
          label={t('common.notes')}
          className="md:col-span-2"
          {...register('notes')}
          error={errors.notes?.message}
        />
      </div>
      <div className="flex items-center justify-end gap-2 pt-2">
        <button type="button" className="btn-ghost" onClick={onCancel}>{t('common.cancel')}</button>
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? t('common.loading') : t('common.save')}
        </button>
      </div>
    </form>
  );
};

export default SalaryForm;
