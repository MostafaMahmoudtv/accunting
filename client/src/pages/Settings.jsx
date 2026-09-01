import { useTranslation } from 'react-i18next';

const Settings = () => {
  const { t } = useTranslation();

  return (
    <div className="space-y-4 sm:space-y-5">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight">{t('settings.title')}</h1>
        <p className="text-xs sm:text-sm text-ink-500 mt-1">{t('settings.subtitle')}</p>
      </div>
    </div>
  );
};

export default Settings;
