import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { FormInput, FormSelect, FormTextarea } from '../ui/FormFields';
import FormFooter from '../ui/FormFooter';
import { EXPENSE_CATEGORIES } from '../../utils/constants';

const schema = (t) =>
  z.object({
    title: z.string().trim().min(1, t('errors.required')),
    amount: z
      .preprocess((v) => (v === '' || v == null ? undefined : Number(v)), z.number({
        invalid_type_error: t('errors.invalidNumber') || t('errors.required'),
      })
        .positive(t('errors.positiveNumber') || t('errors.required'))),
    category: z.string().min(1, t('errors.required')),
    date: z.string().optional(),
    paidBy: z.string().optional(),
    description: z.string().optional(),
    notes: z.string().optional(),
  });

const ExpenseForm = ({ defaultValues, onSubmit, onCancel, loading, serverErrors }) => {
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema(t)),
    defaultValues: { category: 'other', paidBy: 'cash', ...(defaultValues || {}) },
  });

  useEffect(() => {
    if (defaultValues) {
      reset({
        ...defaultValues,
        date: defaultValues.date ? defaultValues.date.slice(0, 10) : '',
      });
    }
  }, [defaultValues, reset]);

  // Map server-side validation errors (e.g. { title: 'Required', amount: 'Invalid' })
  // into react-hook-form field errors so they render inline under each field.
  useEffect(() => {
    if (!serverErrors) return;
    for (const [field, message] of Object.entries(serverErrors)) {
      setError(field, { type: 'server', message });
    }
  }, [serverErrors, setError]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <FormInput
          label={t('common.title')}
          {...register('title')}
          error={errors.title?.message}
        />
        <FormInput
          label={t('common.amount')}
          type="number"
          step="0.01"
          {...register('amount')}
          error={errors.amount?.message}
        />
        <FormSelect
          label={t('common.category')}
          {...register('category')}
          error={errors.category?.message}
        >
          {EXPENSE_CATEGORIES.map((c) => (
            <option key={c} value={c}>{t(`expenses.categories.${c}`)}</option>
          ))}
        </FormSelect>
        <FormInput
          label={t('common.date')}
          type="date"
          {...register('date')}
          error={errors.date?.message}
        />
        <FormSelect
          label={t('expenses.paidBy')}
          {...register('paidBy')}
          error={errors.paidBy?.message}
        >
          <option value="cash">{t('expenses.paymentMethods.cash')}</option>
          <option value="bank_transfer">{t('expenses.paymentMethods.bankTransfer')}</option>
        </FormSelect>
        <FormTextarea
          label={t('common.description')}
          className="md:col-span-2"
          {...register('description')}
          error={errors.description?.message}
        />
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

export default ExpenseForm;
