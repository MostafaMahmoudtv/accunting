import clsx from 'clsx';
import { Inbox } from 'lucide-react';

const EmptyState = ({ title = '', message, icon: Icon = Inbox, action, className }) => {
  return (
    <div className={clsx('flex flex-col items-center justify-center text-center py-12 px-4', className)}>
      <div className="h-12 w-12 rounded-full bg-ink-100 dark:bg-ink-800 flex items-center justify-center mb-3">
        <Icon className="h-6 w-6 text-ink-400" />
      </div>
      {title && <h3 className="text-sm font-semibold mb-1">{title}</h3>}
      {message && <p className="text-sm text-ink-500 dark:text-ink-300 max-w-sm">{message}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
};

export default EmptyState;
