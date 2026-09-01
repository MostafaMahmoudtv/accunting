import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import StatCard from '../components/ui/StatCard';
import { fmtMoney } from '../utils/format';
import { TrendingUp, TrendingDown, Wallet, AlertTriangle, Users, Briefcase, BarChart2, ListTodo } from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import EmptyState from '../components/ui/EmptyState';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/ui/StatusBadge';

const TABS = ['financial', 'clients', 'team', 'expenseBreakdown'];

const Reports = () => {
  const { t, i18n } = useTranslation();
  const { canSeeFinancials } = useAuth();
  const [tab, setTab] = useState('financial');

  const { data: financial } = useQuery({
    queryKey: ['report-financial'],
    queryFn: async () => (await api.get('/reports/financial')).data.data,
    enabled: canSeeFinancials,
  });
  const { data: clients } = useQuery({
    queryKey: ['report-clients'],
    queryFn: async () => (await api.get('/reports/clients')).data.data,
  });
  const { data: team } = useQuery({
    queryKey: ['report-team'],
    queryFn: async () => (await api.get('/reports/team')).data.data,
  });
  const { data: expenses } = useQuery({
    queryKey: ['report-expense'],
    queryFn: async () => (await api.get('/reports/expense-breakdown')).data.data,
  });

  return (
    <div className="space-y-4 sm:space-y-5">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight">{t('reports.title')}</h1>
        <p className="text-xs sm:text-sm text-ink-500 mt-1">{t('reports.subtitle')}</p>
      </div>

      <div className="border-b border-ink-100 dark:border-ink-800 flex items-center gap-1 overflow-x-auto -mx-3 px-3 sm:mx-0 sm:px-0">
        {TABS.map((key) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-3 sm:px-4 py-2.5 text-sm font-medium border-b-2 transition whitespace-nowrap touch-manipulation ${
              tab === key ? 'border-brand-500 text-brand-600' : 'border-transparent text-ink-500 hover:text-ink-900'
            }`}
          >
            {t(`reports.${key}`)}
          </button>
        ))}
      </div>

      {tab === 'financial' && (
        <>
          {!canSeeFinancials ? (
            <EmptyState title={t('reports.hidden')} />
          ) : !financial ? (
            <div className="card p-6 h-64 animate-pulse" />
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                <StatCard label={t('reports.revenue')} value={fmtMoney(financial.monthRevenue, 'SAR', i18n.language)} icon={TrendingUp} accent="emerald" />
                <StatCard label={t('reports.expenses')} value={fmtMoney(financial.monthExpenses, 'SAR', i18n.language)} icon={TrendingDown} accent="rose" />
                <StatCard label={t('reports.profit')} value={fmtMoney(financial.monthProfit, 'SAR', i18n.language)} icon={Wallet} accent="brand" />
                <StatCard label={t('reports.outstandingPayments')} value={fmtMoney(financial.outstanding, 'SAR', i18n.language)} icon={AlertTriangle} accent="amber" />
              </div>
              <div className="card p-4 sm:p-5">
                <h3 className="text-sm font-semibold mb-3">{t('dashboard.revenueVsExpenses')}</h3>
                <div className="h-64 sm:h-80">
                  <ResponsiveContainer>
                    <AreaChart data={financial.series}>
                      <defs>
                        <linearGradient id="rev2" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0" stopColor="#22c55e" stopOpacity={0.4} />
                          <stop offset="1" stopColor="#22c55e" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="exp2" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0" stopColor="#ef4444" stopOpacity={0.4} />
                          <stop offset="1" stopColor="#ef4444" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(120,130,150,0.2)" />
                      <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} width={40} />
                      <Tooltip formatter={(v) => fmtMoney(v, 'SAR', i18n.language)} />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                      <Area type="monotone" dataKey="revenue" stroke="#22c55e" fill="url(#rev2)" name={t('reports.revenue')} />
                      <Area type="monotone" dataKey="expenses" stroke="#ef4444" fill="url(#exp2)" name={t('reports.expenses')} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </>
          )}
        </>
      )}

      {tab === 'clients' && clients && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            <StatCard label={t('common.total')} value={clients.total} icon={Users} accent="brand" />
            <StatCard label={t('clients.monthly')} value={clients.byType.monthly} icon={Briefcase} accent="emerald" />
            <StatCard label={t('clients.temporary')} value={clients.byType.temporary} icon={Briefcase} accent="amber" />
            <StatCard label={t('clients.oneTime')} value={clients.byType.one_time} icon={Briefcase} accent="sky" />
          </div>
          <div className="card p-4 sm:p-5">
            <h3 className="text-sm font-semibold mb-3">{t('reports.topClientsByRevenue')}</h3>
            {clients.top?.length ? (
              <div className="space-y-2">
                {clients.top.map((row, idx) => (
                  <div key={row.client?._id || idx} className="flex items-center justify-between gap-2 p-2 rounded-lg hover:bg-ink-50 dark:hover:bg-ink-800">
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                      <div className="h-8 w-8 rounded-full bg-brand-100 text-brand-700 text-xs font-semibold flex items-center justify-center shrink-0">{idx + 1}</div>
                      <div className="min-w-0">
                        <div className="font-medium truncate text-sm">{row.client?.name || '—'}</div>
                        <div className="text-xs text-ink-500 truncate">{row.client?.companyName}</div>
                      </div>
                    </div>
                    <div className="font-semibold text-sm shrink-0">{fmtMoney(row.total, 'SAR', i18n.language)}</div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState />
            )}
          </div>
        </>
      )}

      {tab === 'team' && team && (
        <div className="card p-1">
          {/* Mobile: card list */}
          <div className="md:hidden divide-y divide-ink-100 dark:divide-ink-800">
            {team.map((row) => (
              <div key={row.user._id} className="p-3 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="font-medium truncate text-sm">{row.user.name}</div>
                    <div className="text-xs text-ink-500 truncate">{row.user.email}</div>
                  </div>
                  <StatusBadge status="in_progress" label={t(`employees.roles.${row.user.role}`)} />
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <div className="text-ink-500">{t('employees.assigned')}</div>
                    <div className="font-semibold">{row.assigned}</div>
                  </div>
                  <div>
                    <div className="text-ink-500">{t('tasks.status.completed')}</div>
                    <div className="font-semibold text-emerald-600">{row.completed}</div>
                  </div>
                  <div>
                    <div className="text-ink-500">{t('employees.overdue')}</div>
                    <div className="font-semibold text-rose-600">{row.overdue}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 flex-1 rounded-full bg-ink-100 dark:bg-ink-800 overflow-hidden">
                    <div className="h-full bg-brand-500" style={{ width: `${row.completionRate}%` }} />
                  </div>
                  <span className="text-xs font-semibold shrink-0">{row.completionRate}%</span>
                </div>
              </div>
            ))}
          </div>
          {/* Desktop: table */}
          <div className="hidden md:block table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>{t('common.name')}</th>
                  <th>{t('employees.role')}</th>
                  <th>{t('employees.assigned')}</th>
                  <th>{t('tasks.status.completed')}</th>
                  <th>{t('employees.overdue')}</th>
                  <th>{t('employees.completionRate')}</th>
                </tr>
              </thead>
              <tbody>
                {team.map((row) => (
                  <tr key={row.user._id}>
                    <td>
                      <div className="font-medium">{row.user.name}</div>
                      <div className="text-xs text-ink-500">{row.user.email}</div>
                    </td>
                    <td><StatusBadge status="in_progress" label={t(`employees.roles.${row.user.role}`)} /></td>
                    <td>{row.assigned}</td>
                    <td className="text-emerald-600">{row.completed}</td>
                    <td className="text-rose-600">{row.overdue}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-24 rounded-full bg-ink-100 dark:bg-ink-800 overflow-hidden">
                          <div className="h-full bg-brand-500" style={{ width: `${row.completionRate}%` }} />
                        </div>
                        <span className="text-xs font-semibold">{row.completionRate}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'expenseBreakdown' && (
        <div className="card p-4 sm:p-5">
          <h3 className="text-sm font-semibold mb-3">{t('reports.expenseBreakdown')}</h3>
          {expenses?.length ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="h-64 sm:h-72">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={expenses} dataKey="total" nameKey="category" innerRadius={45} outerRadius={85}>
                      {expenses.map((_, i) => (
                        <Cell key={i} fill={['#3266ff', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#10b981', '#6366f1'][i % 9]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => fmtMoney(v, 'SAR', i18n.language)} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2">
                {expenses.map((row) => (
                  <div key={row.category} className="flex items-center justify-between gap-2 p-2 rounded-lg hover:bg-ink-50 dark:hover:bg-ink-800">
                    <span className="truncate text-sm">{t(`expenses.categories.${row.category}`)}</span>
                    <span className="font-semibold text-sm shrink-0">{fmtMoney(row.total, 'SAR', i18n.language)}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <EmptyState />
          )}
        </div>
      )}
    </div>
  );
};

export default Reports;
