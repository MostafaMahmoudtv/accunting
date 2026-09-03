import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { FormInput, FormSelect, FormTextarea } from '../ui/FormFields';
import FormFooter from '../ui/FormFooter';
import { EXPENSE_CATEGORIES } from '../../utils/constants';

const ExpenseForm = ({ defaultValues, onSubmit, onCancel, loading }) => {
  const { t } = useTranslation();
  const { register, handleSubmit, reset } = useForm({
    defaultValues: defaultValues || { category: 'other' },
  });

  useEffect(() => {
    if (defaultValues) {
      reset({
        ...defaultValues,
        date: defaultValues.date ? defaultValues.date.slice(0, 10) : '',
      });
    }
  }, [defaultValues, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <FormInput label={t('common.title')} {...register('title', { required: true })} />
        <FormInput label={t('common.amount')} type="number" step="0.01" {...register('amount', { required: true })} />
        <FormSelect label={t('common.category')} {...register('category')}>
          {EXPENSE_CATEGORIES.map((c) => (
            <option key={c} value={c}>{t(`expenses.categories.${c}`)}</option>
          ))}
        </FormSelect>
        <FormInput label={t('common.date')} type="date" {...register('date')} />
        <FormSelect label={t('expenses.paidBy')} {...register('paidBy')}>
          <option value="cash">{t('expenses.paymentMethods.cash')}</option>
          <option value="bank_transfer">{t('expenses.paymentMethods.bankTransfer')}</option>
        </FormSelect>
        <FormTextarea label={t('common.description')} className="md:col-span-2" {...register('description')} />
        <FormTextarea label={t('common.notes')} className="md:col-span-2" {...register('notes')} />
      </div>
      <FormFooter onCancel={onCancel} loading={loading} />
    </form>
  );
};

export default ExpenseForm;
