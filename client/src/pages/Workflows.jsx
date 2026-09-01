import CrudPage from '../components/ui/CrudPage';
import WorkflowForm from '../components/forms/WorkflowForm';
import { useTranslation } from 'react-i18next';
import StatusBadge from '../components/ui/StatusBadge';

const Workflows = () => {
  const { t } = useTranslation();
  const columns = [
    { key: 'name', header: t('common.name'), render: (r) => <span className="font-medium">{r.name}</span> },
    { key: 'description', header: t('common.description'), render: (r) => r.description || '—' },
    {
      key: 'steps',
      header: t('workflows.steps'),
      render: (r) => (
        <div className="flex flex-wrap gap-1 max-w-md">
          {r.steps?.slice(0, 4).map((s) => (
            <StatusBadge key={s._id} status="in_progress" label={s.name} />
          ))}
          {r.steps?.length > 4 && <span className="text-xs text-ink-500">+{r.steps.length - 4}</span>}
        </div>
      ),
    },
  ];
  return (
    <CrudPage
      title={t('workflows.title')}
      subtitle={t('workflows.subtitle')}
      addLabel={t('workflows.add')}
      endpoint="workflows"
      queryKey="workflows"
      columns={columns}
      FormComponent={WorkflowForm}
    />
  );
};

export default Workflows;
