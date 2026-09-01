import clsx from 'clsx';

const StatCard = ({ label, value, icon: Icon, trend, accent = 'brand', sublabel, className }) => {
  const accents = {
    brand: 'bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-300',
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300',
    amber: 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-300',
    rose: 'bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-300',
    sky: 'bg-sky-50 text-sky-600 dark:bg-sky-900/30 dark:text-sky-300',
    violet: 'bg-violet-50 text-violet-600 dark:bg-violet-900/30 dark:text-violet-300',
  };
  return (
    <div className={clsx('card p-4 sm:p-5 flex flex-col gap-2 sm:gap-3', className)}>
      <div className="flex items-start justify-between gap-2">
        <span className="text-[10px] sm:text-xs font-medium uppercase tracking-wide text-ink-500 line-clamp-2 min-w-0">{label}</span>
        {Icon && (
          <div className={clsx('h-8 w-8 sm:h-9 sm:w-9 rounded-xl flex items-center justify-center shrink-0', accents[accent])}>
            <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </div>
        )}
      </div>
      <div className="flex items-end gap-2 min-w-0">
        <div className="text-xl sm:text-2xl font-bold tracking-tight truncate min-w-0">{value}</div>
        {sublabel && <div className="text-xs text-ink-500 mb-1 truncate">{sublabel}</div>}
      </div>
      {trend && <div className="text-xs text-ink-500 truncate">{trend}</div>}
    </div>
  );
};

export default StatCard;
