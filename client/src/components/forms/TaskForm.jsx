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

const TaskForm = ({ defaultValues, onSubmit, onCancel, loading }) => {
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

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <FormInput label={t('tasks.fields.title')} {...register('title')} error={errors.title?.message} className="md:col-span-2" />
        <FormTextarea label={t('tasks.fields.description')} {...register('description')} className="md:col-span-2" />
        <FormSelect label={t('tasks.fields.client')} {...register('client')}>
          <option value="">—</option>
          {clients?.map((c) => (
            <option key={c._id} value={c._id}>{c.name}</option>
          ))}
        </FormSelect>
        <FormInput label={t('tasks.fields.service')} {...register('service')} />
        <FormSelect label={t('tasks.fields.assignedTo')} {...register('assignedTo')}>
          <option value="">—</option>
          {users?.map((u) => (
            <option key={u._id} value={u._id}>{u.name}</option>
          ))}
        </FormSelect>
        <FormSelect label={t('tasks.fields.priority')} {...register('priority')}>
          {TASK_PRIORITY.map((p) => (
            <option key={p} value={p}>{t(`tasks.priority.${p}`)}</option>
          ))}
        </FormSelect>
        <FormSelect label={t('tasks.fields.status')} {...register('status')}>
          {TASK_STATUS.map((s) => (
            <option key={s} value={s}>{t(`tasks.status.${s}`)}</option>
          ))}
        </FormSelect>
        <FormInput label={t('tasks.fields.startDate')} type="date" {...register('startDate')} />
        <FormInput label={t('tasks.fields.dueDate')} type="date" {...register('dueDate')} />
        <FormInput label={t('tasks.fields.estimatedHours')} type="number" step="0.5" {...register('estimatedHours')} />
        <FormInput label={t('tasks.fields.actualHours')} type="number" step="0.5" {...register('actualHours')} />
        <FormSelect label={t('tasks.fields.paymentStatus')} {...register('paymentStatus')}>
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
