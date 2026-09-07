import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { FormInput, FormSelect, FormTextarea } from '../ui/FormFields';
import FormFooter from '../ui/FormFooter';
import { TASK_STATUS, TASK_PRIORITY, PAYMENT_STATUS } from '../../utils/constants';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';

const schema = (t) =>
  z.object({
    title: z.string().min(2, t('errors.required')),
    description: z.string().optional(),
    client: z.string().optional(),
    service: z.string().optional(),
    assignedTo: z.string().optional(),
    priority: z.enum(TASK_PRIORITY).optional(),
    status: z.enum(TASK_STATUS).optional(),
    startDate: z.string().optional(),
    dueDate: z.string().optional(),
    estimatedHours: z.coerce.number().min(0).optional(),
    actualHours: z.coerce.number().min(0).optional(),
    paymentStatus: z.enum(PAYMENT_STATUS).optional(),
  });

const TaskForm = ({ defaultValues, onSubmit, onCancel, loading, serverErrors }) => {
  const { t } = useTranslation();
  const { data: clients } = useQuery({
    queryKey: ['my-clients-options'],
    queryFn: async () => (await api.get('/tasks/my-clients')).data.data,
  });
  const { data: users } = useQuery({
    queryKey: ['users-list'],
    queryFn: async () => (await api.get('/users?limit=200')).data.data,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setError,
  } = useForm({
    resolver: zodResolver(schema(t)),
    defaultValues: defaultValues || {
      priority: 'medium',
      status: 'new',
      paymentStatus: 'unpaid',
    },
  });

  useEffect(() => {
    if (defaultValues) {
      reset({
        ...defaultValues,
        client: defaultValues.client?._id || defaultValues.client,
        assignedTo: defaultValues.assignedTo?._id || defaultValues.assignedTo,
        startDate: defaultValues.startDate ? defaultValues.startDate.slice(0, 10) : '',
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
        <FormInput label={t('tasks.fields.title')} {...register('title')} error={errors.title?.message} className="md:col-span-2" />
        <FormTextarea label={t('tasks.fields.description')} {...register('description')} error={errors.description?.message} className="md:col-span-2" />
        <FormSelect label={t('tasks.fields.client')} {...register('client')} error={errors.client?.message}>
          <option value="">—</option>
          {clients?.map((c) => (
            <option key={c._id} value={c._id}>{c.name}</option>
          ))}
        </FormSelect>
        <FormInput label={t('tasks.fields.service')} {...register('service')} error={errors.service?.message} />
        <FormSelect label={t('tasks.fields.assignedTo')} {...register('assignedTo')} error={errors.assignedTo?.message}>
          <option value="">—</option>
          {users?.map((u) => (
            <option key={u._id} value={u._id}>{u.name}</option>
          ))}
        </FormSelect>
        <FormSelect label={t('tasks.fields.priority')} {...register('priority')} error={errors.priority?.message}>
          {TASK_PRIORITY.map((p) => (
            <option key={p} value={p}>{t(`tasks.priority.${p}`)}</option>
          ))}
        </FormSelect>
        <FormSelect label={t('tasks.fields.status')} {...register('status')} error={errors.status?.message}>
          {TASK_STATUS.map((s) => (
            <option key={s} value={s}>{t(`tasks.status.${s}`)}</option>
          ))}
        </FormSelect>
        <FormInput label={t('tasks.fields.startDate')} type="date" {...register('startDate')} error={errors.startDate?.message} />
        <FormInput label={t('tasks.fields.dueDate')} type="date" {...register('dueDate')} error={errors.dueDate?.message} />
        <FormInput label={t('tasks.fields.estimatedHours')} type="number" step="0.5" {...register('estimatedHours')} error={errors.estimatedHours?.message} />
        <FormInput label={t('tasks.fields.actualHours')} type="number" step="0.5" {...register('actualHours')} error={errors.actualHours?.message} />
        <FormSelect label={t('tasks.fields.paymentStatus')} {...register('paymentStatus')} error={errors.paymentStatus?.message}>
          {PAYMENT_STATUS.map((p) => (
            <option key={p} value={p}>{t(`common.${p === 'partially_paid' ? 'partial' : p}`)}</option>
          ))}
        </FormSelect>
      </div>
      <FormFooter onCancel={onCancel} loading={loading} />
    </form>
  );
};

export default TaskForm;
