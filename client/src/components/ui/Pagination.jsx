import { ChevronLeft, ChevronRight } from 'lucide-react';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';

const Pagination = ({ page, totalPages, onPage }) => {
  const { t } = useTranslation();
  if (!totalPages || totalPages <= 1) return null;
  const pages = [];
  for (let i = 1; i <= totalPages; i += 1) {
    if (
      i === 1 ||
      i === totalPages ||
      (i >= page - 1 && i <= page + 1)
    ) {
      pages.push(i);
    } else if (i === page - 2 || i === page + 2) {
      pages.push('…');
    }
  }
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mt-4 text-sm">
      <span className="text-ink-500 text-xs sm:text-sm">
        {t('common.page')} {page} {t('common.of')} {totalPages}
      </span>
      <div className="flex items-center gap-1 overflow-x-auto">
        <button
          className="btn-ghost px-2 py-1.5 rounded-lg disabled:opacity-40 touch-manipulation"
          onClick={() => onPage(Math.max(1, page - 1))}
          disabled={page === 1}
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        {pages.map((p, idx) =>
          p === '…' ? (
            <span key={`e-${idx}`} className="px-1.5 sm:px-2 text-ink-400">…</span>
          ) : (
            <button
              key={p}
              onClick={() => onPage(p)}
              className={clsx(
                'h-8 min-w-[2rem] px-2 rounded-lg text-xs font-medium touch-manipulation',
                p === page
                  ? 'bg-brand-600 text-white'
                  : 'hover:bg-app-muted text-app-heading'
              )}
            >
              {p}
            </button>
          )
        )}
        <button
          className="btn-ghost px-2 py-1.5 rounded-lg disabled:opacity-40 touch-manipulation"
          onClick={() => onPage(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
