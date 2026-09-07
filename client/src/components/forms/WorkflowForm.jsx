import { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { FormInput, FormTextarea } from '../ui/FormFields';
import { Plus, Trash2 } from 'lucide-react';

const WorkflowForm = ({ defaultValues, onSubmit, onCancel, loading, serverErrors }) => {
  const { t } = useTranslation();
  const {
    register,
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm({
    defaultValues: defaultValues || { name: '', description: '', steps: [{ name: '', order: 1 }] },
  });
  const { fields, append, remove } = useFieldArray({ control, name: 'steps' });
  const [list, setList] = useState([]);

  useEffect(() => {
    if (defaultValues) {
      reset({
        ...defaultValues,
        steps: defaultValues.steps?.length ? defaultValues.steps : [{ name: '', order: 1 }],
      });
    }
  }, [defaultValues, reset]);

  useEffect(() => {
    setList(fields.map((f) => f.id));
  }, [fields]);

  // Map server-side validation errors onto RHF fields so they render inline.
  // Server can return field-level errors as { name: 'Required' } or
  // { 'steps.0.name': 'Required' } for nested field array entries.
  useEffect(() => {
    if (!serverErrors) return;
    for (const [field, message] of Object.entries(serverErrors)) {
      setError(field, { type: 'server', message });
    }
  }, [serverErrors, setError]);

  return (
    <form onSubmit={handleSubmit((v) => onSubmit({
      ...v,
      steps: (v.steps || []).map((s, idx) => ({ ...s, order: idx + 1 })),
    }))} className="space-y-4">
      <div className="grid grid-cols-1 gap-3">
        <FormInput
          label={t('common.name')}
          {...register('name', { required: true })}
          error={errors.name?.message}
        />
        <FormTextarea
          label={t('common.description')}
          {...register('description')}
          error={errors.description?.message}
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold">{t('workflows.steps')}</h3>
          <button
            type="button"
            className="btn-ghost text-xs"
            onClick={() => append({ name: '', order: fields.length + 1 })}
          >
            <Plus className="h-3.5 w-3.5" /> {t('workflows.addStep')}
          </button>
        </div>
        <div className="space-y-2">
          {fields.map((field, index) => (
            <div key={field.id} className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs text-ink-500 w-5 sm:w-6 text-center shrink-0">{index + 1}.</span>
                <input
                  className={`input flex-1 min-w-0 ${errors?.steps?.[index]?.name ? 'border-rose-500' : ''}`}
                  placeholder={t('workflows.stepName')}
                  {...register(`steps.${index}.name`, { required: true })}
                />
                <button type="button" className="btn-ghost p-2 text-rose-600 shrink-0 touch-manipulation" onClick={() => remove(index)} aria-label="Remove step">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              {errors?.steps?.[index]?.name && (
                <p className="text-xs text-rose-600 ps-7">{errors.steps[index].name.message}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2 pt-2">
        <button type="button" className="btn-ghost w-full sm:w-auto justify-center" onClick={onCancel}>{t('common.cancel')}</button>
        <button type="submit" className="btn-primary w-full sm:w-auto justify-center" disabled={loading}>
          {loading ? t('common.loading') : t('common.save')}
        </button>
      </div>
    </form>
  );
};

export default WorkflowForm;
