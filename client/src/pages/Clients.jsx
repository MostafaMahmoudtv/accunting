import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import DataTable from '../components/ui/DataTable';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import StatusBadge from '../components/ui/StatusBadge';
import Pagination from '../components/ui/Pagination';
import { Plus, Filter as FilterIcon, Search as SearchIcon, MoreVertical } from 'lucide-react';
import ClientForm from '../components/forms/ClientForm';
import toast from 'react-hot-toast';
import { CLIENT_TYPES, PAYMENT_STATUS } from '../utils/constants';
import { fmtDate, fmtMoney } from '../utils/format';

const Clients = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [limit] = useState(15);
  const [filters, setFilters] = useState({ q: '', clientType: '', paymentStatus: '' });
  const [openCreate, setOpenCreate] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const params = new URLSearchParams({
    page,
    limit,
    ...Object.fromEntries(Object.entries(filters).filter(([, v]) => v)),
  });

  const { data, isLoading } = useQuery({
    queryKey: ['clients', page, filters],
    queryFn: async () => (await api.get(`/clients?${params.toString()}`)).data,
  });

  const createMut = useMutation({
    mutationFn: async (body) => (await api.post('/clients', body)).data.data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['clients'] });
      setOpenCreate(false);
      toast.success(t('common.success'));
    },
    onError: (err) => {
      const data = err.response?.data;
      const errors = data?.errors;
      let msg = data?.message || t('common.error');
      // Backend may send `errors` as an array of {field, message} or an object map.
      if (Array.isArray(errors) && errors.length) {
        msg = errors.map((e) => `${e.field}: ${e.message}`).join(' • ');
      } else if (errors && typeof errors === 'object') {
        msg = Object.values(errors).flat().join(' • ');
      }
      console.error('Create client failed:', data);
      toast.error(msg);
    },
  });

  const updateMut = useMutation({
    mutationFn: async ({ id, body }) => (await api.put(`/clients/${id}`, body)).data.data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['clients'] });
      setEditTarget(null);
      toast.success(t('common.success'));
    },
    onError: (err) => {
      const data = err.response?.data;
      const errors = data?.errors;
      let msg = data?.message || t('common.error');
      if (Array.isArray(errors) && errors.length) {
        msg = errors.map((e) => `${e.field}: ${e.message}`).join(' • ');
      } else if (errors && typeof errors === 'object') {
        msg = Object.values(errors).flat().join(' • ');
      }
      console.error('Update client failed:', data);
      toast.error(msg);
    },
  });

  const deleteMut = useMutation({
    mutationFn: async (id) => (await api.delete(`/clients/${id}`)).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['clients'] });
      toast.success(t('common.success'));
    },
  });

  const items = data?.data || [];
  const meta = data?.meta || {};

  const columns = [
    {
      key: 'name',
      header: t('common.name'),
      render: (r) => (
        <Link to={`/clients/${r._id}`} className="font-medium text-ink-900 dark:text-ink-50 hover:text-brand-600">
          {r.name}
        </Link>
      ),
    },
    { key: 'companyName', header: t('common.company'), render: (r) => r.companyName || '—' },
    {
      key: 'clientType',
      header: t('clients.clientType'),
      render: (r) => <StatusBadge status={r.clientType === 'one_time' ? 'pending' : 'in_progress'} label={t(`clients.${r.clientType === 'one_time' ? 'oneTime' : r.clientType}`)} />,
    },
    {
      key: 'paymentStatus',
      header: t('clients.paymentStatus'),
      render: (r) => <StatusBadge status={r.paymentStatus} label={t(`common.${r.paymentStatus === 'partially_paid' ? 'partial' : r.paymentStatus}`)} />,
    },
    {
      key: 'monthlyFee',
      header: t('clients.monthlyFee'),
      render: (r) => (r.monthlyFee ? fmtMoney(r.monthlyFee, 'SAR', i18n.language) : '—'),
    },
    {
      key: 'assignedAccountant',
      header: t('clients.assignedAccountant'),
      render: (r) => r.assignedAccountant?.name || '—',
    },
    { key: 'phone', header: t('common.phone'), render: (r) => r.phone || '—' },
    {
      key: 'actions',
      header: '',
      render: (r) => (
        <div className="flex items-center justify-end gap-1">
          <Button size="sm" variant="ghost" onClick={() => setEditTarget(r)}>
            {t('common.edit')}
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setDeleteId(r._id)} className="text-rose-600">
            {t('common.delete')}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">{t('clients.title')}</h1>
          <p className="text-xs sm:text-sm text-ink-500 mt-1">{t('clients.subtitle')}</p>
        </div>
        <Button icon={Plus} onClick={() => setOpenCreate(true)}>{t('clients.add')}</Button>
      </div>

      <div className="card p-2.5 sm:p-3 flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[180px] sm:min-w-[200px]">
          <SearchIcon className="absolute top-1/2 -translate-y-1/2 start-3 h-4 w-4 text-ink-400 pointer-events-none" />
          <input
            value={filters.q}
            onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))}
            placeholder={t('common.search')}
            className="input ps-10"
          />
        </div>
        <select
          className="input w-auto text-sm"
          value={filters.clientType}
          onChange={(e) => setFilters((f) => ({ ...f, clientType: e.target.value }))}
        >
          <option value="">{t('common.all')} — {t('clients.clientType')}</option>
          {CLIENT_TYPES.map((c) => (
            <option key={c} value={c}>{t(`clients.${c === 'one_time' ? 'oneTime' : c}`)}</option>
          ))}
        </select>
        <select
          className="input w-auto text-sm"
          value={filters.paymentStatus}
          onChange={(e) => setFilters((f) => ({ ...f, paymentStatus: e.target.value }))}
        >
          <option value="">{t('common.all')} — {t('clients.paymentStatus')}</option>
          {PAYMENT_STATUS.map((p) => (
            <option key={p} value={p}>{t(`common.${p === 'partially_paid' ? 'partial' : p}`)}</option>
          ))}
        </select>
        <Button variant="ghost" size="sm" onClick={() => setFilters({ q: '', clientType: '', paymentStatus: '' })}>
          {t('common.clear')}
        </Button>
      </div>

      <div className="card p-1">
        <DataTable
          columns={columns}
          rows={items}
          loading={isLoading}
          onRowClick={(r) => navigate(`/clients/${r._id}`)}
        />
        <div className="px-3 pb-3">
          <Pagination page={meta.page} totalPages={meta.totalPages} onPage={setPage} />
        </div>
      </div>

      <Modal open={openCreate} onClose={() => setOpenCreate(false)} title={t('clients.add')} size="xl">
        <ClientForm
          loading={createMut.isPending}
          onCancel={() => setOpenCreate(false)}
          onSubmit={(values) => createMut.mutate(values)}
        />
      </Modal>

      <Modal open={!!editTarget} onClose={() => setEditTarget(null)} title={t('clients.edit')} size="xl">
        {editTarget && (
          <ClientForm
            defaultValues={editTarget}
            loading={updateMut.isPending}
            onCancel={() => setEditTarget(null)}
            onSubmit={(values) => updateMut.mutate({ id: editTarget._id, body: values })}
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

export default Clients;
