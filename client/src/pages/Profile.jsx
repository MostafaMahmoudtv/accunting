import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { initials } from '../utils/format';
import { Mail, Phone, Shield, User as UserIcon } from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  if (!user) return null;
  return (
    <div className="space-y-4 sm:space-y-5 max-w-2xl">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight">{t('nav.myAccount')}</h1>
      </div>
      <div className="card p-4 sm:p-6 flex items-center gap-3 sm:gap-4">
        <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-white text-lg sm:text-xl font-semibold flex items-center justify-center shrink-0">
          {initials(user.name)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-base sm:text-lg font-semibold truncate">{user.name}</div>
          <div className="text-xs sm:text-sm text-ink-500 truncate">{user.email}</div>
        </div>
      </div>
      <div className="card p-4 sm:p-5 grid grid-cols-1 md:grid-cols-2 gap-3">
        <Field icon={Mail} label={t('common.email')} value={user.email} />
        <Field icon={Phone} label={t('common.phone')} value={user.phone || '—'} />
        <Field icon={Shield} label={t('employees.role')} value={t(`employees.roles.${user.role}`)} />
        <Field icon={UserIcon} label={t('employees.department')} value={user.department ? t(`employees.departments.${user.department}`) : '—'} />
      </div>
    </div>
  );
};

const Field = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-2.5 min-w-0">
    <div className="h-9 w-9 rounded-xl bg-ink-100 dark:bg-ink-800 flex items-center justify-center shrink-0">
      <Icon className="h-4 w-4 text-ink-500" />
    </div>
    <div className="min-w-0 flex-1">
      <div className="text-[10px] sm:text-[11px] uppercase text-ink-500 tracking-wide">{label}</div>
      <div className="text-xs sm:text-sm font-medium truncate">{value}</div>
    </div>
  </div>
);

export default Profile;
