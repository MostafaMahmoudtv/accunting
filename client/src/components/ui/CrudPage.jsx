import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import DataTable from '../ui/DataTable';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import ConfirmDialog from '../ui/ConfirmDialog';
import Pagination from '../ui/Pagination';
import { Plus, Search } from 'lucide-react';
import toast from 'react-hot-toast';

/**
 * Generic CRUD list page used by Workflows, Payments, Revenue, Expenses, Salaries, Users, Employees.
 * Props:
 *   - title, subtitle, addLabel
 *   - endpoint
 *   - queryKey
 *   - columns
 *   - FormComponent
 *   - formProps (extra props passed to form, e.g. options lists)
 *   - transformBeforeSubmit
 *   - canDelete (default true)
 *   - filters: [{ key, label, type, options }]
 */
const CrudPage = ({
  title,
  subtitle,
  addLabel,
  endpoint,
  queryKey,
  columns,
  FormComponent,
  formProps = {},
  canDelete = true,
  filters = [],
  showSearch = true,
  showAdd = true,
  extraHeader,
  defaultValues,
  canEdit = () => true,
}) => {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [filterValues, setFilterValues] = useState({});
  const [q, setQ] = useState('');
  const [openCreate, setOpenCreate] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const params = new URLSearchParams({ page, limit: 15 });
  if (q) params.set('q', q);
  for (const [k, v] of Object.entries(filterValues)) {
    if (v) params.set(k, v);
  }

  const { data, isLoading } = useQuery({
    queryKey: [queryKey, page, q, filterValues],
    queryFn: async () => (await api.get(`/${endpoint}?${params.toString()}`)).data,
  });

  const createMut = useMutation({
    mutationFn: async (body) => (await api.post(`/${endpoint}`, body)).data.data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [queryKey] });
      setOpenCreate(false);
      toast.success(t('common.success'));
    },
    onError: (err) => toast.error(err.response?.data?.message || t('common.error')),
  });

  const updateMut = useMutation({
    mutationFn: async ({ id, body }) => (await api.put(`/${endpoint}/${id}`, body)).data.data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [queryKey] });
      setEditTarget(null);
      toast.success(t('common.success'));
    },
    onError: (err) => toast.error(err.response?.data?.message || t('common.error')),
  });

  const deleteMut = useMutation({
    mutationFn: async (id) => (await api.delete(`/${endpoint}/${id}`)).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [queryKey] });
      toast.success(t('common.success'));
    },
  });

  const items = data?.data || [];
  const meta = data?.meta || {};

  const finalColumns = canDelete
    ? [
        ...columns,
        {
          key: 'actions',
          header: '',
          render: (r) => (
            <div className="flex items-center justify-end gap-1">
              {canEdit(r) && (
                <Button size="sm" variant="ghost" onClick={() => setEditTarget(r)}>{t('common.edit')}</Button>
              )}
              <Button size="sm" variant="ghost" onClick={() => setDeleteId(r._id)} className="text-rose-600">{t('common.delete')}</Button>
            </div>
          ),
        },
      ]
    : columns;

  return (
    <div className="space-y-4 sm:space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">{title}</h1>
          {subtitle && <p className="text-xs sm:text-sm text-ink-500 mt-1">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {extraHeader}
          {showAdd && <Button icon={Plus} onClick={() => setOpenCreate(true)}>{addLabel}</Button>}
        </div>
      </div>

      {(showSearch || filters.length > 0) && (
        <div className="card p-2.5 sm:p-3 flex flex-wrap items-center gap-2">
          {showSearch && (
            <div className="relative flex-1 min-w-[180px] sm:min-w-[200px]">
              <Search className="absolute top-1/2 -translate-y-1/2 start-3 h-4 w-4 text-ink-400 pointer-events-none" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={t('common.search')}
                className="input ps-10"
              />
            </div>
          )}
          {filters.map((f) => (
            <select
              key={f.key}
              className="input w-auto text-sm"
              value={filterValues[f.key] || ''}
              onChange={(e) => setFilterValues((v) => ({ ...v, [f.key]: e.target.value }))}
            >
              <option value="">{t('common.all')} — {f.label}</option>
              {f.options.map((o) => (
                <option key={typeof o === 'string' ? o : o.value} value={typeof o === 'string' ? o : o.value}>
                  {typeof o === 'string' ? o : o.label}
                </option>
              ))}
            </select>
          ))}
          <Button variant="ghost" size="sm" onClick={() => { setQ(''); setFilterValues({}); }}>{t('common.clear')}</Button>
        </div>
      )}

      <div className="card p-1">
        <DataTable columns={finalColumns} rows={items} loading={isLoading} />
        <div className="px-3 pb-3">
          <Pagination page={meta.page} totalPages={meta.totalPages} onPage={setPage} />
        </div>
      </div>

      <Modal open={openCreate} onClose={() => setOpenCreate(false)} title={addLabel} size="xl">
        <FormComponent
          {...formProps}
          defaultValues={defaultValues}
          loading={createMut.isPending}
          onCancel={() => setOpenCreate(false)}
          onSubmit={(v) => createMut.mutate(v)}
        />
      </Modal>

      <Modal open={!!editTarget} onClose={() => setEditTarget(null)} title={t('common.edit')} size="xl">
        {editTarget && (
          <FormComponent
            {...formProps}
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

export default CrudPage;
