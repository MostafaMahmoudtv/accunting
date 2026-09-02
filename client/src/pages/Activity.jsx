import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import EmptyState from '../components/ui/EmptyState';
import Pagination from '../components/ui/Pagination';
import { fmtRelative, initials } from '../utils/format';
import { Activity as ActivityIcon, Search } from 'lucide-react';

const Activity = () => {
  const { t, i18n } = useTranslation();
  const [page, setPage] = useState(1);
  const [q, setQ] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['activity', page, q],
    queryFn: async () => (await api.get(`/activity?page=${page}&limit=20&q=${encodeURIComponent(q)}`)).data,
  });

  const items = data?.data || [];
  const meta = data?.meta || {};

  return (
    <div className="space-y-4 sm:space-y-5">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight">{t('activity.title')}</h1>
        <p className="text-xs sm:text-sm text-ink-500 mt-1">{t('activity.subtitle')}</p>
      </div>

      <div className="card p-2.5 sm:p-3">
        <div className="relative max-w-md">
          <Search className="absolute top-1/2 -translate-y-1/2 start-3 h-4 w-4 text-ink-400 pointer-events-none" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t('common.search')}
            className="input ps-10"
          />
        </div>
      </div>

      <div className="card p-4 sm:p-5">
        {isLoading ? (
          <div className="space-y-3">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton h-12" />)}</div>
        ) : items.length ? (
          <ul className="space-y-3">
            {items.map((a) => (
              <li key={a._id} className="flex items-start gap-3 p-2 rounded-xl hover:bg-app-muted">
                <div className="h-9 w-9 rounded-full bg-brand-100 text-brand-700 text-xs font-semibold flex items-center justify-center shrink-0">
                  {initials(a.user?.name || 'U')}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm break-words">{a.description}</div>
                  <div className="text-[11px] text-ink-500 mt-0.5">
                    {a.user?.name || '—'} • {a.entityType} • {fmtRelative(a.createdAt, i18n.language)}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState title={t('common.noData')} icon={ActivityIcon} />
        )}
        <Pagination page={meta.page} totalPages={meta.totalPages} onPage={setPage} />
      </div>
    </div>
  );
};

export default Activity;
