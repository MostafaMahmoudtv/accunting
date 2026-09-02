import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import api from '../services/api';
import DataTable from '../components/ui/DataTable';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import StatusBadge from '../components/ui/StatusBadge';
import Pagination from '../components/ui/Pagination';
import { Plus, Search, LayoutGrid, List as ListIcon } from 'lucide-react';
import TaskForm from '../components/forms/TaskForm';
import toast from 'react-hot-toast';
import { TASK_STATUS, TASK_PRIORITY } from '../utils/constants';
import { fmtDate } from '../utils/format';
import clsx from 'clsx';

// Map task priority → border/accent color tokens used to tint each row/card.
// Designed to stay readable in both light and dark themes.
const PRIORITY_ROW_STYLE = {
  low: {
    border: 'border-l-emerald-500',
    bg: 'bg-emerald-50/60 dark:bg-emerald-500/10',
    accent: 'bg-emerald-500',
  },
  medium: {
    border: 'border-l-sky-500',
    bg: 'bg-sky-50/60 dark:bg-sky-500/10',
    accent: 'bg-sky-500',
  },
  high: {
    border: 'border-l-amber-500',
    bg: 'bg-amber-50/60 dark:bg-amber-500/10',
    accent: 'bg-amber-500',
  },
  urgent: {
    border: 'border-l-rose-500',
    bg: 'bg-rose-50/60 dark:bg-rose-500/10',
    accent: 'bg-rose-500',
  },
};

const priorityRowClass = (row) => {
  const style = PRIORITY_ROW_STYLE[row?.priority];
  if (!style) return '';
  return clsx('border-l-4', style.border, style.bg);
};

const Tasks = () => {
  const { t, i18n } = useTranslation();
  const qc = useQueryClient();
  const [view, setView] = useState('table');
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ q: '', status: '', priority: '' });
  const [openCreate, setOpenCreate] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const params = new URLSearchParams({
    page,
    limit: 15,
    ...Object.fromEntries(Object.entries(filters).filter(([, v]) => v)),
  });

  const { data, isLoading } = useQuery({
    queryKey: ['tasks', page, filters],
    queryFn: async () => (await api.get(`/tasks?${params.toString()}`)).data,
  });

  const { data: kanban } = useQuery({
    queryKey: ['tasks-kanban'],
    queryFn: async () => (await api.get('/tasks/kanban')).data.data,
    enabled: view === 'kanban',
  });

  const createMut = useMutation({
    mutationFn: async (body) => (await api.post('/tasks', body)).data.data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks'] });
      qc.invalidateQueries({ queryKey: ['tasks-kanban'] });
      setOpenCreate(false);
      toast.success(t('common.success'));
    },
    onError: (err) => toast.error(err.response?.data?.message || t('common.error')),
  });

  const updateMut = useMutation({
    mutationFn: async ({ id, body }) => (await api.put(`/tasks/${id}`, body)).data.data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks'] });
      qc.invalidateQueries({ queryKey: ['tasks-kanban'] });
      setEditTarget(null);
      toast.success(t('common.success'));
    },
  });

  const deleteMut = useMutation({
    mutationFn: async (id) => (await api.delete(`/tasks/${id}`)).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks'] });
      qc.invalidateQueries({ queryKey: ['tasks-kanban'] });
      toast.success(t('common.success'));
    },
  });

  const statusMut = useMutation({
    mutationFn: async ({ id, status }) => (await api.patch(`/tasks/${id}/status`, { status })).data.data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks-kanban'] });
      qc.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const items = data?.data || [];
  const meta = data?.meta || {};

  const columns = [
    {
      key: 'title',
      header: t('tasks.fields.title'),
      render: (r) => <Link to={`/tasks/${r._id}`} className="font-medium hover:text-brand-600">{r.title}</Link>,
    },
    { key: 'client', header: t('tasks.fields.client'), render: (r) => r.client?.name || '—' },
    { key: 'assignedTo', header: t('tasks.fields.assignedTo'), render: (r) => r.assignedTo?.name || '—' },
    {
      key: 'priority',
      header: t('tasks.fields.priority'),
      render: (r) => <StatusBadge status={r.priority} label={t(`tasks.priority.${r.priority}`)} />,
    },
    {
      key: 'status',
      header: t('tasks.fields.status'),
      render: (r) => <StatusBadge status={r.status} label={t(`tasks.status.${r.status}`)} />,
    },
    { key: 'dueDate', header: t('tasks.fields.dueDate'), render: (r) => fmtDate(r.dueDate, i18n.language) },
    {
      key: 'actions',
      header: '',
      render: (r) => (
        <div className="flex items-center justify-end gap-1">
          <Button size="sm" variant="ghost" onClick={() => setEditTarget(r)}>{t('common.edit')}</Button>
          <Button size="sm" variant="ghost" onClick={() => setDeleteId(r._id)} className="text-rose-600">{t('common.delete')}</Button>
        </div>
      ),
    },
  ];

  const columnsKanban = ['new', 'pending', 'in_progress', 'waiting_client', 'under_review', 'completed'];

  return (
    <div className="space-y-4 sm:space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">{t('tasks.title')}</h1>
          <p className="text-xs sm:text-sm text-app-muted mt-1">{t('tasks.subtitle')}</p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="card p-1 flex items-center gap-1">
            <button
              onClick={() => setView('table')}
              className={clsx('px-2.5 sm:px-3 py-1.5 text-xs rounded-lg flex items-center gap-1.5 touch-manipulation', view === 'table' ? 'bg-brand-500 text-white' : 'text-app-heading')}
            >
              <ListIcon className="h-3.5 w-3.5" /> <span className="hidden xs:inline sm:inline">{t('tasks.table')}</span>
            </button>
            <button
              onClick={() => setView('kanban')}
              className={clsx('px-2.5 sm:px-3 py-1.5 text-xs rounded-lg flex items-center gap-1.5 touch-manipulation', view === 'kanban' ? 'bg-brand-500 text-white' : 'text-app-heading')}
            >
              <LayoutGrid className="h-3.5 w-3.5" /> <span className="hidden xs:inline sm:inline">{t('tasks.kanban')}</span>
            </button>
          </div>
          <Button icon={Plus} onClick={() => setOpenCreate(true)}>{t('tasks.add')}</Button>
        </div>
      </div>

      {view === 'table' && (
        <>
          <div className="card p-2.5 sm:p-3 flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[180px] sm:min-w-[200px]">
              <Search className="absolute top-1/2 -translate-y-1/2 start-3 h-4 w-4 text-app-muted pointer-events-none" />
              <input
                value={filters.q}
                onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))}
                placeholder={t('common.search')}
                className="input ps-10"
              />
            </div>
            <select
              className="input w-auto text-sm"
              value={filters.status}
              onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
            >
              <option value="">{t('common.all')} — {t('tasks.fields.status')}</option>
              {TASK_STATUS.map((s) => (
                <option key={s} value={s}>{t(`tasks.status.${s}`)}</option>
              ))}
            </select>
            <select
              className="input w-auto text-sm"
              value={filters.priority}
              onChange={(e) => setFilters((f) => ({ ...f, priority: e.target.value }))}
            >
              <option value="">{t('common.all')} — {t('tasks.fields.priority')}</option>
              {TASK_PRIORITY.map((p) => (
                <option key={p} value={p}>{t(`tasks.priority.${p}`)}</option>
              ))}
            </select>
            <Button variant="ghost" size="sm" onClick={() => setFilters({ q: '', status: '', priority: '' })}>
              {t('common.clear')}
            </Button>
          </div>
          <div className="card p-1">
            <DataTable columns={columns} rows={items} loading={isLoading} rowClassName={priorityRowClass} />
            <div className="px-3 pb-3">
              <Pagination page={meta.page} totalPages={meta.totalPages} onPage={setPage} />
            </div>
          </div>
        </>
      )}

      {view === 'kanban' && (
        <div className="overflow-x-auto -mx-3 sm:mx-0 px-3 sm:px-0 pb-2 snap-x snap-mandatory">
          <div className="flex gap-3 min-w-max">
            {columnsKanban.map((status) => (
              <div key={status} className="w-72 sm:w-72 card p-3 flex flex-col shrink-0 snap-start">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-app-heading">{t(`tasks.status.${status}`)}</h3>
                  <span className="text-xs text-app-muted bg-app-muted rounded-full px-2 py-0.5">
                    {kanban?.filter((k) => k.status === status).length || 0}
                  </span>
                </div>
                <div className="space-y-2 flex-1">
                  {kanban?.filter((k) => k.status === status).map((task) => {
                    const accent = PRIORITY_ROW_STYLE[task.priority]?.accent || 'bg-ink-300';
                    return (
                    <div
                      key={task._id}
                      className="relative p-2.5 ps-3 rounded-xl bg-app-card border border-app-border shadow-sm hover:shadow-soft transition overflow-hidden"
                    >
                      <span className={clsx('absolute top-0 bottom-0 start-0 w-1', accent)} aria-hidden="true" />
                      <Link to={`/tasks/${task._id}`} className="text-sm font-medium block truncate text-app-heading">{task.title}</Link>
                      <div className="text-[11px] text-app-muted mt-1 flex items-center gap-1.5">
                        {task.client?.name && <span className="truncate">{task.client.name}</span>}
                      </div>
                      <div className="mt-2 flex items-center justify-between gap-1">
                        <StatusBadge status={task.priority} label={t(`tasks.priority.${task.priority}`)} />
                        <select
                          value={task.status}
                          onChange={(e) => statusMut.mutate({ id: task._id, status: e.target.value })}
                          className="text-[10px] bg-app-card text-app-heading border border-app-border rounded px-1.5 py-0.5 focus:outline-none focus:ring-2 focus:ring-brand-500/30 max-w-[6.5rem] truncate"
                        >
                          {TASK_STATUS.map((s) => (
                            <option key={s} value={s} className="bg-app-card text-app-heading">{t(`tasks.status.${s}`)}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    );
                  })}
                  {!kanban?.filter((k) => k.status === status).length && (
                    <div className="text-xs text-app-muted text-center py-4 border border-dashed border-app-border rounded-xl">
                      —
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <Modal open={openCreate} onClose={() => setOpenCreate(false)} title={t('tasks.add')} size="xl">
        <TaskForm
          loading={createMut.isPending}
          onCancel={() => setOpenCreate(false)}
          onSubmit={(v) => createMut.mutate(v)}
        />
      </Modal>
      <Modal open={!!editTarget} onClose={() => setEditTarget(null)} title={t('tasks.edit')} size="xl">
        {editTarget && (
          <TaskForm
            defaultValues={editTarget}
            loading={updateMut.isPending}
            onCancel={() => setEditTarget(null)}
            onSubmit={(v) => updateMut.mutate({ id: editTarget._id, body: v })}
          />
        )}
      </Modal>
      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteMut.mutate(deleteId)}
        message={t('confirm.delete')}
      />
    </div>
  );
};

export default Tasks;
