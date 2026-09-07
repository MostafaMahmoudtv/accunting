import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { FormInput, FormSelect, FormTextarea } from '../ui/FormFields';
import FormFooter from '../ui/FormFooter';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import { REVENUE_CATEGORIES, PAYMENT_STATUS } from '../../utils/constants';

const RevenueForm = ({ defaultValues, onSubmit, onCancel, loading, serverErrors }) => {
  const { t } = useTranslation();
  const { data: clients } = useQuery({
    queryKey: ['clients-options'],
    queryFn: async () => (await api.get('/clients?limit=200')).data.data,
  });

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm({
    defaultValues: defaultValues || { category: 'other', paymentStatus: 'paid' },
  });

  useEffect(() => {
    if (defaultValues) {
      reset({
        ...defaultValues,
        client: defaultValues.client?._id || defaultValues.client,
        date: defaultValues.date ? defaultValues.date.slice(0, 10) : '',
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

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <FormSelect
          label={t('common.name') /* client name */}
          {...register('client', { required: true })}
          error={errors.client?.message}
        >
          <option value="">—</option>
          {clients?.map((c) => (
            <option key={c._id} value={c._id}>{c.name}</option>
          ))}
        </FormSelect>
        <FormSelect
          label={t('common.category')}
          {...register('category')}
          error={errors.category?.message}
        >
          {REVENUE_CATEGORIES.map((c) => (
            <option key={c} value={c}>{t(`revenue.categories.${c}`)}</option>
          ))}
        </FormSelect>
        <FormInput
          label={t('common.amount')}
          type="number"
          step="0.01"
          {...register('amount', { required: true })}
          error={errors.amount?.message}
        />
        <FormInput
          label={t('common.date')}
          type="date"
          {...register('date')}
          error={errors.date?.message}
        />
        <FormSelect
          label={t('common.status')}
          {...register('paymentStatus')}
          error={errors.paymentStatus?.message}
        >
          {PAYMENT_STATUS.map((p) => (
            <option key={p} value={p}>{t(`common.${p === 'partially_paid' ? 'partial' : p}`)}</option>
          ))}
        </FormSelect>
        <FormTextarea
          label={t('common.description')}
          className="md:col-span-2"
          {...register('description')}
          error={errors.description?.message}
        />
      </div>
      <FormFooter onCancel={onCancel} loading={loading} />
    </form>
  );
};

export default RevenueForm;
