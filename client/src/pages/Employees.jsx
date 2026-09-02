import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import { fmtRelative, fmtMoney } from '../utils/format';
import { useNavigate } from 'react-router-dom';
import { initials } from '../utils/format';
import StatCard from '../components/ui/StatCard';
import { UserCog, Briefcase, Clock, TrendingUp } from 'lucide-react';
import EmptyState from '../components/ui/EmptyState';

const Employees = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const { data: report, isLoading } = useQuery({
    queryKey: ['team-report'],
    queryFn: async () => (await api.get('/reports/team')).data.data,
  });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t('employees.title')}</h1>
        <p className="text-sm text-ink-500 mt-1">{t('employees.subtitle')}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label={t('common.total')}
          value={isLoading ? '…' : report?.length || 0}
          icon={UserCog}
          accent="brand"
        />
        <StatCard
          label={t('employees.assigned')}
          value={isLoading ? '…' : report?.reduce((s, r) => s + r.assigned, 0) || 0}
          icon={Briefcase}
          accent="sky"
        />
        <StatCard
          label={t('employees.overdue')}
          value={isLoading ? '…' : report?.reduce((s, r) => s + r.overdue, 0) || 0}
          icon={Clock}
          accent="rose"
        />
        <StatCard
          label={t('employees.completionRate')}
          value={`${isLoading ? '…' : Math.round((report?.reduce((s, r) => s + r.completionRate, 0) || 0) / Math.max(1, report?.length || 1))}%`}
          icon={TrendingUp}
          accent="emerald"
        />
      </div>

      {isLoading ? (
        <div className="card p-6 h-64 animate-pulse" />
      ) : report?.length ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {report.map((r) => (
            <div key={r.user._id} className="card p-5">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-brand-100 text-brand-700 font-semibold flex items-center justify-center">
                  {initials(r.user.name)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold truncate">{r.user.name}</div>
                  <div className="text-xs text-ink-500">{t(`employees.roles.${r.user.role}`)}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-4 text-sm">
                <div>
                  <div className="text-xs text-ink-500">{t('employees.assigned')}</div>
                  <div className="font-semibold">{r.assigned}</div>
                </div>
                <div>
                  <div className="text-xs text-ink-500">{t('tasks.status.completed')}</div>
                  <div className="font-semibold text-emerald-600">{r.completed}</div>
                </div>
                <div>
                  <div className="text-xs text-ink-500">{t('employees.overdue')}</div>
                  <div className="font-semibold text-rose-600">{r.overdue}</div>
                </div>
                <div>
                  <div className="text-xs text-ink-500">{t('employees.workload')}</div>
                  <div className="font-semibold">{r.inProgress}</div>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span>{t('employees.completionRate')}</span>
                  <span className="font-semibold">{r.completionRate}%</span>
                </div>
                <div className="h-2 rounded-full bg-app-muted overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-brand-500 to-brand-700"
                    style={{ width: `${r.completionRate}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState title={t('common.noData')} />
      )}
    </div>
  );
};

export default Employees;
