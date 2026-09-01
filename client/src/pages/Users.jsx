import CrudPage from '../components/ui/CrudPage';
import UserForm from '../components/forms/UserForm';
import { useTranslation } from 'react-i18next';
import { fmtDate, initials } from '../utils/format';
import StatusBadge from '../components/ui/StatusBadge';

const Users = () => {
  const { t, i18n } = useTranslation();
  const columns = [
    {
      key: 'name',
      header: t('common.name'),
      render: (r) => (
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-full bg-brand-100 text-brand-700 text-xs font-semibold flex items-center justify-center">
            {initials(r.name)}
          </div>
          <div>
            <div className="font-medium">{r.name}</div>
            <div className="text-xs text-ink-500">{r.email}</div>
          </div>
        </div>
      ),
    },
    { key: 'role', header: t('employees.role'), render: (r) => <StatusBadge status="in_progress" label={t(`employees.roles.${r.role}`)} /> },
    { key: 'department', header: t('employees.department'), render: (r) => r.department ? t(`employees.departments.${r.department}`) : '—' },
    { key: 'phone', header: t('common.phone'), render: (r) => r.phone || '—' },
    { key: 'lastLoginAt', header: t('common.createdAt'), render: (r) => r.lastLoginAt ? fmtDate(r.lastLoginAt, i18n.language) : '—' },
    {
      key: 'isActive',
      header: t('common.status'),
      render: (r) => <StatusBadge status={r.isActive ? 'active' : 'inactive'} label={t(`clients.${r.isActive ? 'active' : 'inactive'}`)} />,
    },
  ];
  return (
    <CrudPage
      title={t('users.title')}
      subtitle={t('users.subtitle')}
      addLabel={t('users.add')}
      endpoint="users"
      queryKey="users"
      columns={columns}
      FormComponent={UserForm}
    />
  );
};

export default Users;
