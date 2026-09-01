import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { FormInput, FormSelect, FormTextarea } from '../ui/FormFields';
import FormFooter from '../ui/FormFooter';
import { CLIENT_TYPES, CLIENT_STATUS, PAYMENT_STATUS } from '../../utils/constants';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';

const schema = (t) =>
  z.object({
    name: z.string().trim().min(2, t('errors.required') || 'Required'),
    companyName: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email(t('errors.invalidEmail')).optional().or(z.literal('')),
    address: z.string().optional(),
    taxNumber: z.string().optional(),
    clientType: z.enum(CLIENT_TYPES),
    monthlyFee: z.coerce.number().min(0).optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    billingDate: z.string().optional(),
    paymentStatus: z.enum(PAYMENT_STATUS).optional(),
    // ObjectId from <select> must be a 24-char hex string; treat empty as "no selection".
    assignedAccountant: z
      .string()
      .optional()
      .refine(
        (v) => !v || /^[a-f\d]{24}$/i.test(v),
        { message: t('errors.invalid') || 'Invalid value' }
      ),
    assignedCustomerService: z
      .string()
      .optional()
      .refine(
        (v) => !v || /^[a-f\d]{24}$/i.test(v),
        { message: t('errors.invalid') || 'Invalid value' }
      ),
    status: z.enum(CLIENT_STATUS).optional(),
    notes: z.string().optional(),
  });

const ClientForm = ({ defaultValues, onSubmit, onCancel, loading }) => {
  const { t } = useTranslation();
  const { data: users } = useQuery({
    queryKey: ['users-list'],
    queryFn: async () => (await api.get('/users?limit=200')).data.data,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm({
    resolver: zodResolver(schema(t)),
    mode: 'onChange',
    defaultValues: defaultValues || {
      clientType: 'monthly',
      status: 'active',
      paymentStatus: 'unpaid',
      monthlyFee: 0,
    },
  });

  useEffect(() => {
    if (defaultValues) {
      reset({
        ...defaultValues,
        startDate: defaultValues.startDate ? defaultValues.startDate.slice(0, 10) : '',
        endDate: defaultValues.endDate ? defaultValues.endDate.slice(0, 10) : '',
        billingDate: defaultValues.billingDate ? defaultValues.billingDate.slice(0, 10) : '',
      });
    }
  }, [defaultValues, reset]);

  const clientType = watch('clientType');
  const accountants = users?.filter((u) => ['accountant', 'manager', 'super_admin'].includes(u.role)) || [];
  const csList = users?.filter((u) => ['manager', 'super_admin'].includes(u.role)) || [];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <FormInput label={t('common.name')} {...register('name')} error={errors.name?.message} />
        <FormInput label={t('clients.companyName')} {...register('companyName')} />
        <FormInput label={t('common.phone')} {...register('phone')} />
        <FormInput label={t('common.email')} type="email" {...register('email')} error={errors.email?.message} />
        <FormInput label={t('clients.taxNumber')} {...register('taxNumber')} />
        <FormSelect label={t('clients.clientType')} {...register('clientType')}>
          {CLIENT_TYPES.map((c) => (
            <option key={c} value={c}>{t(`clients.${c === 'one_time' ? 'oneTime' : c}`)}</option>
          ))}
        </FormSelect>
        {clientType === 'monthly' && (
          <FormInput label={t('clients.monthlyFee')} type="number" step="0.01" {...register('monthlyFee')} />
        )}
        <FormInput label={t('clients.startDate')} type="date" {...register('startDate')} />
        {(clientType === 'temporary' || clientType === 'one_time') && (
          <FormInput label={t('clients.endDate')} type="date" {...register('endDate')} />
        )}
        {clientType === 'monthly' && (
          <FormInput label={t('clients.billingDate')} type="date" {...register('billingDate')} />
        )}
        <FormSelect label={t('clients.paymentStatus')} {...register('paymentStatus')}>
          {PAYMENT_STATUS.map((p) => (
            <option key={p} value={p}>{t(`common.${p === 'partially_paid' ? 'partial' : p}`)}</option>
          ))}
        </FormSelect>
        <FormSelect label={t('clients.status')} {...register('status')}>
          {CLIENT_STATUS.map((s) => (
            <option key={s} value={s}>{t(`clients.${s}`)}</option>
          ))}
        </FormSelect>
        <FormSelect label={t('clients.assignedAccountant')} {...register('assignedAccountant')}>
          <option value="">—</option>
          {accountants.map((u) => (
            <option key={u._id} value={u._id}>{u.name}</option>
          ))}
        </FormSelect>
        <FormSelect label={t('clients.assignedCustomerService')} {...register('assignedCustomerService')}>
          <option value="">—</option>
          {csList.map((u) => (
            <option key={u._id} value={u._id}>{u.name}</option>
          ))}
        </FormSelect>
        <FormInput label={t('common.address')} className="md:col-span-2" {...register('address')} />
        <FormTextarea label={t('common.notes')} className="md:col-span-2" {...register('notes')} />
      </div>
      <FormFooter onCancel={onCancel} loading={loading} />
    </form>
  );
};

export default ClientForm;
