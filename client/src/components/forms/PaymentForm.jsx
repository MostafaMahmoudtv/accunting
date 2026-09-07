import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { FormInput, FormSelect, FormTextarea } from '../ui/FormFields';
import FormFooter from '../ui/FormFooter';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import { PAYMENT_STATUS, PAYMENT_METHODS } from '../../utils/constants';

const PaymentForm = ({ defaultValues, onSubmit, onCancel, loading, serverErrors }) => {
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
    defaultValues: defaultValues || { status: 'unpaid', paymentMethod: 'bank_transfer' },
  });

  useEffect(() => {
    if (defaultValues) {
      reset({
        ...defaultValues,
        client: defaultValues.client?._id || defaultValues.client,
        paymentDate: defaultValues.paymentDate ? defaultValues.paymentDate.slice(0, 10) : '',
        dueDate: defaultValues.dueDate ? defaultValues.dueDate.slice(0, 10) : '',
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
          label={t('common.name') /* using common.name for client name */}
          {...register('client', { required: true })}
          error={errors.client?.message}
        >
          <option value="">—</option>
          {clients?.map((c) => (
            <option key={c._id} value={c._id}>{c.name}</option>
          ))}
        </FormSelect>
        <FormInput
          label={t('payments.invoice')}
          {...register('invoice')}
          error={errors.invoice?.message}
        />
        <FormInput
          label={t('common.amount')}
          type="number"
          step="0.01"
          {...register('amount', { required: true })}
          error={errors.amount?.message}
        />
        <FormInput
          label={t('payments.dueDate')}
          type="date"
          {...register('dueDate')}
          error={errors.dueDate?.message}
        />
        <FormInput
          label={t('payments.paymentDate')}
          type="date"
          {...register('paymentDate')}
          error={errors.paymentDate?.message}
        />
        <FormSelect
          label={t('payments.paymentMethod')}
          {...register('paymentMethod')}
          error={errors.paymentMethod?.message}
        >
          {PAYMENT_METHODS.map((m) => (
            <option key={m} value={m}>{t(`payments.method.${m}`)}</option>
          ))}
        </FormSelect>
        <FormSelect
          label={t('common.status')}
          {...register('status')}
          error={errors.status?.message}
        >
          {PAYMENT_STATUS.map((p) => (
            <option key={p} value={p}>{t(`common.${p === 'partially_paid' ? 'partial' : p}`)}</option>
          ))}
        </FormSelect>
        <FormTextarea
          label={t('common.notes')}
          className="md:col-span-2"
          {...register('notes')}
          error={errors.notes?.message}
        />
      </div>
      <FormFooter onCancel={onCancel} loading={loading} />
    </form>
  );
};

export default PaymentForm;
