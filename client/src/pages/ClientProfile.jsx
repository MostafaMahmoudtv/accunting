import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import StatusBadge from '../components/ui/StatusBadge';
import EmptyState from '../components/ui/EmptyState';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { FormTextarea } from '../components/ui/FormFields';
import { ArrowLeft, Phone, Mail, MapPin, FileText, Briefcase, Calendar, User as UserIcon, Plus, Building2, Upload, File as FileIcon, Download, Trash2 } from 'lucide-react';
import { fmtDate, fmtMoney, fmtRelative } from '../utils/format';
import toast from 'react-hot-toast';

const TABS = ['overview', 'tasks', 'payments', 'documents', 'notes', 'activity'];

const ClientProfile = () => {
  const { id } = useParams();
  const { t, i18n } = useTranslation();
  const qc = useQueryClient();
  const [tab, setTab] = useState('overview');
  const [noteText, setNoteText] = useState('');
  const [noteOpen, setNoteOpen] = useState(false);

  const { data: client, isLoading } = useQuery({
    queryKey: ['client', id],
    queryFn: async () => (await api.get(`/clients/${id}`)).data.data,
  });

  const { data: summary } = useQuery({
    queryKey: ['client-summary', id],
    queryFn: async () => (await api.get(`/clients/${id}/summary`)).data.data,
  });

  const { data: activity } = useQuery({
    queryKey: ['client-activity', id],
    queryFn: async () => (await api.get(`/activity?entityType=Client&entityId=${id}&limit=30`)).data.data,
  });

  const { data: documents, refetch: refetchDocs } = useQuery({
    queryKey: ['client-documents', id],
    queryFn: async () => (await api.get(`/documents?client=${id}`)).data.data,
  });

  const uploadDocMut = useMutation({
    mutationFn: async (file) => {
      const form = new FormData();
      form.append('file', file);
      form.append('client', id);
      return (await api.post('/documents', form, { headers: { 'Content-Type': 'multipart/form-data' } })).data.data;
    },
    onSuccess: () => {
      refetchDocs();
      toast.success(t('common.success'));
    },
    onError: (err) => toast.error(err.response?.data?.message || t('common.error')),
  });

  const deleteDocMut = useMutation({
    mutationFn: async (docId) => (await api.delete(`/documents/${docId}`)).data,
    onSuccess: () => {
      refetchDocs();
      toast.success(t('common.success'));
    },
  });

  const handleUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) uploadDocMut.mutate(file);
    e.target.value = '';
  };

  const fmtSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const addNoteMut = useMutation({
    mutationFn: async (body) => (await api.post(`/clients/${id}/notes`, body)).data.data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['client', id] });
      qc.invalidateQueries({ queryKey: ['client-activity', id] });
      setNoteOpen(false);
      setNoteText('');
      toast.success(t('common.success'));
    },
  });

  if (isLoading) {
    return <div className="card p-6 animate-pulse h-96" />;
  }
  if (!client) {
    return <EmptyState title={t('errors.notFound')} />;
  }

  return (
    <div className="space-y-4 sm:space-y-5">
      <div className="flex items-center gap-2 sm:gap-3">
        <Link to="/clients" className="p-2 -ms-2 rounded-lg hover:bg-ink-100 dark:hover:bg-ink-800 shrink-0">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg sm:text-2xl font-bold tracking-tight flex flex-wrap items-center gap-1.5 sm:gap-2">
            <span className="truncate">{client.name}</span>
            <StatusBadge status={client.clientType === 'one_time' ? 'pending' : 'in_progress'} label={t(`clients.${client.clientType === 'one_time' ? 'oneTime' : client.clientType}`)} />
            <StatusBadge status={client.status} label={t(`clients.${client.status}`)} />
            <StatusBadge status={client.paymentStatus} label={t(`common.${client.paymentStatus === 'partially_paid' ? 'partial' : client.paymentStatus}`)} />
          </h1>
          <p className="text-xs sm:text-sm text-ink-500 mt-1 truncate">{client.companyName || '—'}</p>
        </div>
      </div>

      <div className="card p-3 sm:p-5 grid grid-cols-1 xs:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <Field icon={Phone} label={t('common.phone')} value={client.phone} />
        <Field icon={Mail} label={t('common.email')} value={client.email} />
        <Field icon={MapPin} label={t('common.address')} value={client.address} />
        <Field icon={FileText} label={t('clients.taxNumber')} value={client.taxNumber} />
        <Field icon={Calendar} label={t('clients.startDate')} value={fmtDate(client.startDate, i18n.language)} />
        {client.endDate && <Field icon={Calendar} label={t('clients.endDate')} value={fmtDate(client.endDate, i18n.language)} />}
        {client.monthlyFee > 0 && (
          <Field icon={Briefcase} label={t('clients.monthlyFee')} value={fmtMoney(client.monthlyFee, 'SAR', i18n.language)} />
        )}
        <Field icon={UserIcon} label={t('clients.assignedAccountant')} value={client.assignedAccountant?.name} />
        <Field icon={UserIcon} label={t('clients.assignedCustomerService')} value={client.assignedCustomerService?.name} />
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
            {t(`clients.tabs.${key}`)}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <div className="card p-4">
            <div className="text-xs text-ink-500 mb-1">{t('common.total')} {t('nav.tasks')}</div>
            <div className="text-2xl font-bold">{summary?.tasks?.length || 0}</div>
          </div>
          <div className="card p-4">
            <div className="text-xs text-ink-500 mb-1">{t('common.total')} {t('nav.payments')}</div>
            <div className="text-2xl font-bold">{summary?.payments?.length || 0}</div>
          </div>
          <div className="card p-4">
            <div className="text-xs text-ink-500 mb-1">{t('clients.tabs.notes')}</div>
            <div className="text-2xl font-bold">{client.timeline?.length || 0}</div>
          </div>
        </div>
      )}

      {tab === 'tasks' && (
        <div className="card p-1">
          {summary?.tasks?.length ? (
            <div className="divide-y divide-ink-100 dark:divide-ink-800">
              {summary.tasks.map((task) => (
                <Link key={task._id} to={`/tasks/${task._id}`} className="flex items-center justify-between gap-2 p-3 hover:bg-ink-50 dark:hover:bg-ink-800">
                  <div className="min-w-0 flex-1">
                    <div className="font-medium truncate text-sm">{task.title}</div>
                    <div className="text-xs text-ink-500 truncate">{fmtDate(task.dueDate, i18n.language)} • {task.assignedTo?.name || '—'}</div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <StatusBadge status={task.status} label={t(`tasks.status.${task.status}`)} />
                    <StatusBadge status={task.priority} label={t(`tasks.priority.${task.priority}`)} />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState title={t('clients.noTasks')} icon={Briefcase} />
          )}
        </div>
      )}

      {tab === 'payments' && (
        <div className="card p-1">
          {summary?.payments?.length ? (
            <>
              {/* Mobile: card list */}
              <div className="md:hidden divide-y divide-ink-100 dark:divide-ink-800">
                {summary.payments.map((p) => (
                  <div key={p._id} className="p-3 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium truncate">{p.invoice || '—'}</span>
                      <StatusBadge status={p.status} label={t(`common.${p.status === 'partially_paid' ? 'partial' : p.status}`)} />
                    </div>
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span className="text-ink-500">{fmtDate(p.paymentDate, i18n.language)}</span>
                      <span className="font-semibold">{fmtMoney(p.amount, 'SAR', i18n.language)}</span>
                    </div>
                  </div>
                ))}
              </div>
              {/* Desktop: table */}
              <div className="hidden md:block table-wrap">
                <table className="data-table">
                  <thead><tr><th>{t('payments.invoice')}</th><th>{t('common.amount')}</th><th>{t('common.status')}</th><th>{t('payments.paymentDate')}</th><th>{t('payments.dueDate')}</th></tr></thead>
                  <tbody>
                    {summary.payments.map((p) => (
                      <tr key={p._id}>
                        <td>{p.invoice || '—'}</td>
                        <td className="font-medium">{fmtMoney(p.amount, 'SAR', i18n.language)}</td>
                        <td><StatusBadge status={p.status} label={t(`common.${p.status === 'partially_paid' ? 'partial' : p.status}`)} /></td>
                        <td>{fmtDate(p.paymentDate, i18n.language)}</td>
                        <td>{fmtDate(p.dueDate, i18n.language)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <EmptyState title={t('clients.noPayments')} icon={FileText} />
          )}
        </div>
      )}

      {tab === 'documents' && (
        <div className="card p-4 sm:p-5 space-y-4">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <h3 className="text-sm font-semibold">{t('clients.tabs.documents')}</h3>
            <label className="btn-primary cursor-pointer text-xs sm:text-sm">
              <Upload className="h-4 w-4" />
              {uploadDocMut.isPending ? t('common.loading') : t('common.upload')}
              <input type="file" className="hidden" onChange={handleUpload} />
            </label>
          </div>
          {documents?.length ? (
            <ul className="divide-y divide-ink-100 dark:divide-ink-800">
              {documents.map((doc) => (
                <li key={doc._id} className="flex items-center gap-3 py-2.5">
                  <div className="h-9 w-9 rounded-lg bg-brand-100 text-brand-600 flex items-center justify-center shrink-0">
                    <FileIcon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{doc.name}</div>
                    <div className="text-[11px] text-ink-500">
                      {doc.uploadedBy?.name || '—'} • {fmtSize(doc.size)} • {fmtRelative(doc.createdAt, i18n.language)}
                    </div>
                  </div>
                  <a
                    href={doc.url.startsWith('http') ? doc.url : `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${doc.url}`}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-ghost p-2"
                    title={t('common.view')}
                  >
                    <Download className="h-4 w-4" />
                  </a>
                  <button
                    onClick={() => deleteDocMut.mutate(doc._id)}
                    className="btn-ghost p-2 text-rose-600"
                    title={t('common.delete')}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState title={t('common.noData')} message="Documents uploaded for this client will appear here" icon={FileText} />
          )}
        </div>
      )}

      {tab === 'notes' && (
        <div className="card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">{t('clients.tabs.notes')}</h3>
            <Button size="sm" icon={Plus} onClick={() => setNoteOpen(true)}>{t('clients.addNote')}</Button>
          </div>
          {client.timeline?.length ? (
            <div className="space-y-2">
              {client.timeline.map((n) => (
                <div key={n._id} className="p-3 rounded-xl border border-ink-100 dark:border-ink-800">
                  <p className="text-sm whitespace-pre-wrap">{n.content}</p>
                  <div className="text-[11px] text-ink-500 mt-1.5">
                    {n.createdBy?.name || '—'} • {fmtRelative(n.createdAt, i18n.language)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title={t('clients.noNotes')} />
          )}
        </div>
      )}

      {tab === 'activity' && (
        <div className="card p-5">
          {activity?.length ? (
            <ul className="space-y-3">
              {activity.map((a) => (
                <li key={a._id} className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-xs font-semibold">
                    {(a.user?.name || 'U').split(' ').map((p) => p[0]).slice(0, 2).join('')}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm">{a.description}</div>
                    <div className="text-[11px] text-ink-500 mt-0.5">{fmtRelative(a.createdAt, i18n.language)}</div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState title={t('common.noData')} icon={Building2} />
          )}
        </div>
      )}

      <Modal open={noteOpen} onClose={() => setNoteOpen(false)} title={t('clients.addNote')} size="md">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            addNoteMut.mutate({ content: noteText });
          }}
        >
          <FormTextarea
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder={t('clients.notePlaceholder')}
            rows={5}
          />
          <div className="flex items-center justify-end gap-2 mt-3">
            <button type="button" className="btn-ghost" onClick={() => setNoteOpen(false)}>{t('common.cancel')}</button>
            <button type="submit" className="btn-primary" disabled={!noteText || addNoteMut.isPending}>
              {t('common.save')}
            </button>
          </div>
        </form>
      </Modal>
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
      <div className="text-xs sm:text-sm font-medium truncate">{value || '—'}</div>
    </div>
  </div>
);

export default ClientProfile;
