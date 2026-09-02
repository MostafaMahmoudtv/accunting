import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import StatusBadge from '../components/ui/StatusBadge';
import EmptyState from '../components/ui/EmptyState';
import Button from '../components/ui/Button';
import { FormTextarea } from '../components/ui/FormFields';
import { ArrowLeft, Calendar, User as UserIcon, Building2, Briefcase, Clock, Send, Flag } from 'lucide-react';
import { fmtDate, fmtRelative, fmtMoney } from '../utils/format';
import { TASK_STATUS, TASK_PRIORITY } from '../utils/constants';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const TaskDetail = () => {
  const { id } = useParams();
  const { t, i18n } = useTranslation();
  const { hasRole } = useAuth();
  const qc = useQueryClient();
  const [text, setText] = useState('');

  const { data: task, isLoading } = useQuery({
    queryKey: ['task', id],
    queryFn: async () => (await api.get(`/tasks/${id}`)).data.data,
  });

  const statusMut = useMutation({
    mutationFn: async (status) => (await api.patch(`/tasks/${id}/status`, { status })).data.data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['task', id] });
      toast.success(t('common.success'));
    },
  });

  const commentMut = useMutation({
    mutationFn: async (body) => (await api.post(`/tasks/${id}/comments`, body)).data.data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['task', id] });
      setText('');
    },
  });

  if (isLoading) return <div className="card p-6 animate-pulse h-96" />;
  if (!task) return <EmptyState title={t('errors.notFound')} />;

  return (
    <div className="space-y-4 sm:space-y-5">
      <div className="flex items-center gap-2 sm:gap-3">
        <Link to="/tasks" className="p-2 -ms-2 rounded-lg hover:bg-app-muted shrink-0">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg sm:text-2xl font-bold tracking-tight truncate">{task.title}</h1>
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-2">
            <StatusBadge status={task.status} label={t(`tasks.status.${task.status}`)} />
            <StatusBadge status={task.priority} label={t(`tasks.priority.${task.priority}`)} />
            {task.client && (
              <Link to={`/clients/${task.client._id}`} className="text-xs text-brand-600 hover:underline truncate max-w-[10rem]">
                {task.client.name}
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
        <div className="lg:col-span-2 space-y-4 sm:space-y-5">
          <div className="card p-4 sm:p-5">
            <h3 className="text-sm font-semibold mb-2">{t('common.description')}</h3>
            <p className="text-sm text-app-muted whitespace-pre-wrap break-words">{task.description || '—'}</p>
          </div>

          <div className="card p-4 sm:p-5">
            <h3 className="text-sm font-semibold mb-3">{t('common.notes')}</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (text.trim()) commentMut.mutate({ text });
              }}
              className="flex flex-col sm:flex-row gap-2"
            >
              <FormTextarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Write a comment…"
                rows={2}
                className="flex-1"
              />
              <Button type="submit" icon={Send} className="self-stretch sm:self-end">{t('common.submit')}</Button>
            </form>
            <div className="mt-4 space-y-2">
              {task.comments?.map((c) => (
                <div key={c._id} className="p-3 rounded-xl border border-app-border">
                  <div className="text-sm break-words">{c.text}</div>
                  <div className="text-[11px] text-ink-500 mt-1">{c.createdBy?.name || '—'} • {fmtRelative(c.createdAt, i18n.language)}</div>
                </div>
              ))}
              {!task.comments?.length && <EmptyState title={t('common.noData')} />}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="card p-4 sm:p-5 space-y-3">
            <Field icon={UserIcon} label={t('tasks.fields.assignedTo')} value={task.assignedTo?.name} />
            <Field icon={Building2} label={t('tasks.fields.client')} value={task.client?.name} />
            <Field icon={Briefcase} label={t('tasks.fields.service')} value={task.service} />
            <Field icon={Calendar} label={t('tasks.fields.startDate')} value={fmtDate(task.startDate, i18n.language)} />
            <Field icon={Calendar} label={t('tasks.fields.dueDate')} value={fmtDate(task.dueDate, i18n.language)} />
            <Field icon={Clock} label={t('tasks.fields.estimatedHours')} value={task.estimatedHours} />
            <Field icon={Clock} label={t('tasks.fields.actualHours')} value={task.actualHours} />
            {task.price > 0 && <Field icon={Flag} label={t('tasks.fields.price')} value={fmtMoney(task.price, 'SAR', i18n.language)} />}
          </div>

          <div className="card p-4 sm:p-5">
            <h3 className="text-sm font-semibold mb-3">{t('tasks.fields.status')}</h3>
            <div className="grid grid-cols-2 gap-2">
              {TASK_STATUS.map((s) => (
                <button
                  key={s}
                  onClick={() => statusMut.mutate(s)}
                  className={`text-xs px-2 py-1.5 rounded-lg border touch-manipulation ${
                    task.status === s ? 'bg-brand-500 text-white border-brand-500' : 'border-app-border hover:bg-app-muted'
                  }`}
                >
                  {t(`tasks.status.${s}`)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Field = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-2.5">
    <div className="h-8 w-8 rounded-lg bg-app-muted flex items-center justify-center shrink-0">
      <Icon className="h-3.5 w-3.5 text-ink-500" />
    </div>
    <div className="min-w-0">
      <div className="text-[10px] uppercase text-ink-500 tracking-wide">{label}</div>
      <div className="text-sm font-medium truncate">{value || '—'}</div>
    </div>
  </div>
);

export default TaskDetail;
