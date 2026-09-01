import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import StatCard from '../components/ui/StatCard';
import { fmtMoney, fmtRelative } from '../utils/format';
import {
  Users,
  UserCheck,
  UserPlus,
  Briefcase,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Wallet,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Activity as ActivityIcon,
  Bell,
  Receipt,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import StatusBadge from '../components/ui/StatusBadge';
import EmptyState from '../components/ui/EmptyState';
import { fmtDate } from '../utils/format';

const PIE_COLORS = ['#3266ff', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6'];

const Dashboard = () => {
  const { t, i18n } = useTranslation();
  const { canSeeFinancials } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => (await api.get('/dashboard/stats')).data.data,
  });

  const { data: activity } = useQuery({
    queryKey: ['recent-activity'],
    queryFn: async () => (await api.get('/dashboard/activity?limit=10')).data.data,
  });

  const { data: alerts } = useQuery({
    queryKey: ['dashboard-alerts'],
    queryFn: async () => (await api.get('/dashboard/alerts')).data.data,
  });

  const totals = data?.totals || {};
  const financials = data?.financials || {};
  const charts = data?.charts || {};
  const clientTypes = charts.clientTypes || { monthly: 0, temporary: 0, one_time: 0 };
  const taskStatus = charts.taskStatus || {};
  const monthlySeries = charts.monthlySeries || [];
  const teamWorkload = charts.teamWorkload || [];
  const expenseBreakdown = charts.expenseBreakdown || [];

  const clientTypeData = [
    { name: t('clients.monthly'), value: clientTypes.monthly || 0, key: 'monthly' },
    { name: t('clients.temporary'), value: clientTypes.temporary || 0, key: 'temporary' },
    { name: t('clients.oneTime'), value: clientTypes.one_time || 0, key: 'one_time' },
  ];
  const taskStatusData = [
    { name: t('tasks.status.new'), value: taskStatus.new || 0, key: 'new' },
    { name: t('tasks.status.pending'), value: taskStatus.pending || 0, key: 'pending' },
    { name: t('tasks.status.in_progress'), value: taskStatus.in_progress || 0, key: 'in_progress' },
    { name: t('tasks.status.waiting_client'), value: taskStatus.waiting_client || 0, key: 'waiting_client' },
    { name: t('tasks.status.under_review'), value: taskStatus.under_review || 0, key: 'under_review' },
    { name: t('tasks.status.completed'), value: taskStatus.completed || 0, key: 'completed' },
    { name: t('tasks.status.overdue'), value: taskStatus.overdue || 0, key: 'overdue' },
  ];

  return (
    <div className="space-y-5 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight">{t('dashboard.title')}</h1>
        <p className="text-xs sm:text-sm text-ink-500 mt-1">{t('dashboard.subtitle')}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          label={t('dashboard.totalClients')}
          value={isLoading ? '…' : totals.totalClients}
          icon={Users}
          accent="brand"
        />
        <StatCard
          label={t('dashboard.monthlyClients')}
          value={isLoading ? '…' : totals.monthlyClients}
          icon={UserCheck}
          accent="emerald"
        />
        <StatCard
          label={t('dashboard.temporaryClients')}
          value={isLoading ? '…' : totals.temporaryClients}
          icon={UserPlus}
          accent="amber"
        />
        <StatCard
          label={t('dashboard.oneTimeClients')}
          value={isLoading ? '…' : totals.oneTimeClients}
          icon={Briefcase}
          accent="sky"
        />
        <StatCard
          label={t('dashboard.activeTasks')}
          value={isLoading ? '…' : totals.activeTasks}
          icon={Clock}
          accent="violet"
        />
        <StatCard
          label={t('dashboard.completedTasks')}
          value={isLoading ? '…' : totals.completedTasks}
          icon={CheckCircle2}
          accent="emerald"
        />
        <StatCard
          label={t('dashboard.overdueTasks')}
          value={isLoading ? '…' : totals.overdueTasks}
          icon={AlertTriangle}
          accent="rose"
        />
        <StatCard
          label={t('dashboard.dueToday')}
          value={isLoading ? '…' : totals.todayDueTasks}
          icon={Clock}
          accent="amber"
        />
        <StatCard
          label={t('dashboard.pendingPayments')}
          value={isLoading ? '…' : fmtMoney(totals.pendingPayments, 'SAR', i18n.language)}
          icon={Wallet}
          accent="amber"
        />
        <StatCard
          label={t('dashboard.overduePayments')}
          value={isLoading ? '…' : fmtMoney(totals.overduePayments, 'SAR', i18n.language)}
          icon={AlertTriangle}
          accent="rose"
        />
        {canSeeFinancials && (
          <>
            <StatCard
              label={t('dashboard.monthlyRevenue')}
              value={fmtMoney(financials.monthlyRevenue, 'SAR', i18n.language)}
              icon={TrendingUp}
              accent="emerald"
            />
            <StatCard
              label={t('dashboard.monthlyExpenses')}
              value={fmtMoney(financials.monthlyExpenses, 'SAR', i18n.language)}
              icon={TrendingDown}
              accent="rose"
            />
            <StatCard
              label={t('dashboard.netProfit')}
              value={fmtMoney(financials.netProfit, 'SAR', i18n.language)}
              icon={PiggyBank}
              accent="brand"
            />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
        <div className="card p-4 sm:p-5 xl:col-span-2">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h3 className="text-sm font-semibold">{t('dashboard.revenueVsExpenses')}</h3>
          </div>
          <div className="h-60 sm:h-72">
            <ResponsiveContainer>
              <AreaChart data={monthlySeries}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#22c55e" stopOpacity={0.4} />
                    <stop offset="1" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="exp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#ef4444" stopOpacity={0.4} />
                    <stop offset="1" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(120,130,150,0.2)" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} width={40} />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: '1px solid rgba(0,0,0,0.1)' }}
                  formatter={(v) => fmtMoney(v, 'SAR', i18n.language)}
                />
                <Area type="monotone" dataKey="revenue" stroke="#22c55e" fill="url(#rev)" name={t('reports.revenue')} />
                <Area type="monotone" dataKey="expenses" stroke="#ef4444" fill="url(#exp)" name={t('reports.expenses')} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-4 sm:p-5">
          <h3 className="text-sm font-semibold mb-3 sm:mb-4">{t('dashboard.clientTypes')}</h3>
          <div className="h-60 sm:h-72">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={clientTypeData} dataKey="value" nameKey="name" innerRadius={45} outerRadius={80} paddingAngle={3}>
                  {clientTypeData.map((entry, i) => (
                    <Cell key={i} fill={PIE_COLORS[i]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
        <div className="card p-4 sm:p-5 xl:col-span-2">
          <h3 className="text-sm font-semibold mb-3 sm:mb-4">{t('dashboard.taskStatus')}</h3>
          <div className="h-64 sm:h-72">
            <ResponsiveContainer>
              <BarChart data={taskStatusData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(120,130,150,0.2)" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-25} textAnchor="end" height={60} />
                <YAxis tick={{ fontSize: 11 }} width={30} />
                <Tooltip />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {taskStatusData.map((entry, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-4 sm:p-5">
          <h3 className="text-sm font-semibold mb-3 sm:mb-4">{t('dashboard.teamWorkload')}</h3>
          <div className="h-64 sm:h-72">
            {teamWorkload.length ? (
              <ResponsiveContainer>
                <BarChart data={teamWorkload.map((w) => ({ name: w.user?.name || '—', count: w.count }))} layout="vertical" margin={{ left: 10, right: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(120,130,150,0.2)" />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={80} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3266ff" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState message={t('common.noData')} />
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-5 lg:gap-6">
        <div className="card p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold flex items-center gap-2"><ActivityIcon className="h-4 w-4" /> {t('dashboard.recentActivity')}</h3>
          </div>
          <div className="space-y-2">
            {activity?.length ? (
              activity.map((a) => (
                <div key={a._id} className="flex items-start gap-3 py-2 border-b border-ink-100 dark:border-ink-800 last:border-b-0">
                  <div className="h-8 w-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-xs font-semibold shrink-0">
                    {(a.user?.name || 'U').split(' ').map((p) => p[0]).slice(0, 2).join('')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm">{a.description}</div>
                    <div className="text-[11px] text-ink-500 mt-0.5">{fmtRelative(a.createdAt, i18n.language)}</div>
                  </div>
                </div>
              ))
            ) : (
              <EmptyState message={t('dashboard.noActivity')} />
            )}
          </div>
        </div>

        <div className="card p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold flex items-center gap-2"><Bell className="h-4 w-4" /> {t('dashboard.alerts')}</h3>
          </div>
          <div className="space-y-3">
            <AlertSection
              title={t('dashboard.overdueTasksList')}
              items={alerts?.overdueTasks}
              empty={t('dashboard.noAlerts')}
              renderItem={(task) => (
                <div className="flex items-center justify-between gap-2 text-sm py-1.5">
                  <Link to={`/tasks/${task._id}`} className="truncate hover:underline min-w-0">{task.title}</Link>
                  <StatusBadge status="overdue" label={t('tasks.status.overdue')} />
                </div>
              )}
            />
            <AlertSection
              title={t('dashboard.dueSoonList')}
              items={alerts?.dueSoonTasks}
              empty="—"
              renderItem={(task) => (
                <div className="flex items-center justify-between gap-2 text-sm py-1.5">
                  <Link to={`/tasks/${task._id}`} className="truncate hover:underline min-w-0">{task.title}</Link>
                  <span className="text-xs text-ink-500 shrink-0">{fmtDate(task.dueDate, i18n.language)}</span>
                </div>
              )}
            />
            <AlertSection
              title={t('dashboard.overduePaymentsList')}
              items={alerts?.overduePayments}
              empty="—"
              renderItem={(p) => (
                <div className="flex items-center justify-between gap-2 text-sm py-1.5">
                  <span className="truncate min-w-0">{p.client?.name || '—'}</span>
                  <span className="text-xs text-rose-600 font-medium shrink-0">{fmtMoney(p.amount, 'SAR', i18n.language)}</span>
                </div>
              )}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const AlertSection = ({ title, items, renderItem, empty }) => {
  const { t } = useTranslation();
  return (
    <div>
      <div className="text-xs uppercase tracking-wide text-ink-500 font-semibold mb-1.5">{title}</div>
      {items?.length ? items.slice(0, 5).map((it) => <div key={it._id}>{renderItem(it)}</div>) : (
        <div className="text-xs text-ink-400">{empty || t('common.noData')}</div>
      )}
    </div>
  );
};

export default Dashboard;
