import clsx from 'clsx';

const StatCard = ({ label, value, icon: Icon, trend, accent = 'brand', sublabel, className }) => {
  // Theme-aware accent classes — use solid, vivid colors for clarity in light mode.
  const accents = {
    brand: 'bg-brand-100 text-brand-700',
    emerald: 'bg-emerald-100 text-emerald-700',
    amber: 'bg-amber-100 text-amber-700',
    rose: 'bg-rose-100 text-rose-700',
    sky: 'bg-sky-100 text-sky-700',
    violet: 'bg-violet-100 text-violet-700',
  };
  return (
    <div className={clsx('card p-4 sm:p-5 flex flex-col gap-2 sm:gap-3', className)}>
      <div className="flex items-start justify-between gap-2">
        <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wide text-app-muted line-clamp-2 min-w-0">{label}</span>
        {Icon && (
          <div className={clsx('h-9 w-9 sm:h-10 sm:w-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm', accents[accent])}>
            <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
        )}
      </div>
      <div className="flex items-end gap-2 min-w-0">
        <div className="text-xl sm:text-2xl font-bold tracking-tight truncate min-w-0 text-app-heading">{value}</div>
        {sublabel && <div className="text-xs text-app-muted mb-1 truncate">{sublabel}</div>}
      </div>
      {trend && <div className="text-xs text-app-muted truncate">{trend}</div>}
    </div>
  );
};

export default StatCard;
