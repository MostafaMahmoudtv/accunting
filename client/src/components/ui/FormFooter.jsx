/**
 * Responsive form footer.
 * - On mobile: full-width stacked buttons.
 * - On sm+: inline right-aligned buttons.
 */
import { useTranslation } from 'react-i18next';

const FormFooter = ({ onCancel, loading, submitLabel, cancelLabel, extra }) => {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2 pt-2">
      {extra}
      <button
        type="button"
        className="btn-ghost w-full sm:w-auto justify-center"
        onClick={onCancel}
      >
        {cancelLabel || t('common.cancel')}
      </button>
      <button
        type="submit"
        className="btn-primary w-full sm:w-auto justify-center"
        disabled={loading}
      >
        {loading ? t('common.loading') : submitLabel || t('common.save')}
      </button>
    </div>
  );
};

export default FormFooter;
