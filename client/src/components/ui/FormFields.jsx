import { forwardRef } from 'react';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';

export const FormInput = forwardRef(({ label, error, className, ...props }, ref) => {
  const { t } = useTranslation();
  return (
    <div className={className}>
      {label && <label className="label">{label}</label>}
      <input
        ref={ref}
        className={clsx('input', error && 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/30')}
        {...props}
      />
      {error && <p className="text-xs text-rose-500 mt-1">{t(error, { defaultValue: error })}</p>}
    </div>
  );
});
FormInput.displayName = 'FormInput';

export const FormTextarea = forwardRef(({ label, error, className, rows = 4, ...props }, ref) => {
  const { t } = useTranslation();
  return (
    <div className={className}>
      {label && <label className="label">{label}</label>}
      <textarea
        ref={ref}
        rows={rows}
        className={clsx('input resize-none', error && 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/30')}
        {...props}
      />
      {error && <p className="text-xs text-rose-500 mt-1">{t(error, { defaultValue: error })}</p>}
    </div>
  );
});
FormTextarea.displayName = 'FormTextarea';

export const FormSelect = forwardRef(({ label, error, options = [], className, children, ...props }, ref) => (
  <div className={className}>
    {label && <label className="label">{label}</label>}
    <select
      ref={ref}
      className={clsx('input pr-8 appearance-none', error && 'border-rose-400')}
      {...props}
    >
      {children ||
        options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
    </select>
    {error && <p className="text-xs text-rose-500 mt-1">{error}</p>}
  </div>
));
FormSelect.displayName = 'FormSelect';
