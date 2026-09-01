import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { FormInput, FormSelect } from '../ui/FormFields';
import FormFooter from '../ui/FormFooter';
import { ROLES, DEPARTMENTS } from '../../utils/constants';

const UserForm = ({ defaultValues, onSubmit, onCancel, loading }) => {
  const { t } = useTranslation();
  const { register, handleSubmit, reset } = useForm({
    defaultValues: defaultValues || { role: 'customer_service', isActive: true },
  });

  useEffect(() => {
    if (defaultValues) {
      reset(defaultValues);
    }
  }, [defaultValues, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <FormInput label={t('common.name')} {...register('name', { required: true })} />
        <FormInput label={t('common.email')} type="email" {...register('email', { required: true })} />
        <FormInput label={t('common.phone')} {...register('phone')} />
        <FormSelect label={t('employees.role')} {...register('role')}>
          {ROLES.map((r) => (
            <option key={r} value={r}>{t(`employees.roles.${r}`)}</option>
          ))}
        </FormSelect>
        <FormSelect label={t('employees.department')} {...register('department')}>
          <option value="">—</option>
          {DEPARTMENTS.map((d) => (
            <option key={d} value={d}>{t(`employees.departments.${d}`)}</option>
          ))}
        </FormSelect>
      </div>
      <FormFooter onCancel={onCancel} loading={loading} />
    </form>
  );
};

export default UserForm;
