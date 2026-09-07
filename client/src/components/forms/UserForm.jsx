import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { FormInput, FormSelect } from '../ui/FormFields';
import FormFooter from '../ui/FormFooter';
import { ROLES, DEPARTMENTS } from '../../utils/constants';

const UserForm = ({ defaultValues, onSubmit, onCancel, loading, serverErrors }) => {
  const { t } = useTranslation();
  const isEdit = Boolean(defaultValues);
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm({
    defaultValues: defaultValues || { role: 'customer_service', isActive: true },
  });

  useEffect(() => {
    if (defaultValues) {
      reset({
        ...defaultValues,
        password: '', // never pre-fill; let admin type a new one if they want to change it
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
        <FormInput
          label={t('common.name')}
          {...register('name', { required: true })}
          error={errors.name?.message}
        />
        <FormInput
          label={t('common.email')}
          type="email"
          {...register('email', { required: true })}
          error={errors.email?.message}
        />
        <FormInput
          label={t('common.phone')}
          {...register('phone')}
          error={errors.phone?.message}
        />
        <FormSelect
          label={t('employees.role')}
          {...register('role')}
          error={errors.role?.message}
        >
          {ROLES.map((r) => (
            <option key={r} value={r}>{t(`employees.roles.${r}`)}</option>
          ))}
        </FormSelect>
        <FormSelect
          label={t('employees.department')}
          {...register('department')}
          error={errors.department?.message}
        >
          <option value="">—</option>
          {DEPARTMENTS.map((d) => (
            <option key={d} value={d}>{t(`employees.departments.${d}`)}</option>
          ))}
        </FormSelect>
        <FormInput
          label={t('common.password')}
          type="password"
          autoComplete="new-password"
          placeholder={isEdit ? t('users.passwordPlaceholderEdit') : t('users.passwordPlaceholderAdd')}
          {...register('password', {
            required: !isEdit,
            minLength: { value: 6, message: t('users.passwordTooShort') },
            validate: (v) => !v || v.length >= 6 || t('users.passwordTooShort'),
          })}
          error={errors.password?.message}
        />
      </div>
      <FormFooter onCancel={onCancel} loading={loading} />
    </form>
  );
};

export default UserForm;
