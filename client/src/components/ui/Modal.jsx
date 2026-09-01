import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import clsx from 'clsx';

/**
 * Responsive modal.
 * - On mobile (below sm): full-screen sheet.
 * - On sm+: centered dialog with `size` controlling max-width.
 */
const Modal = ({ open, onClose, title, children, size = 'md', footer }) => {
  useEffect(() => {
    if (!open) return undefined;
    const handler = (e) => e.key === 'Escape' && onClose?.();
    window.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;
  const sizes = { sm: 'sm:max-w-sm', md: 'sm:max-w-lg', lg: 'sm:max-w-2xl', xl: 'sm:max-w-4xl' };
  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-stretch sm:items-center justify-center sm:p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={clsx(
          'w-full bg-white dark:bg-ink-900 border border-ink-100 dark:border-ink-800 sm:rounded-2xl shadow-xl flex flex-col',
          'h-full sm:h-auto sm:max-h-[90vh]',
          'rounded-none sm:rounded-2xl',
          sizes[size]
        )}
      >
        <div className="flex items-center justify-between px-4 sm:px-5 py-3.5 sm:py-4 border-b border-ink-100 dark:border-ink-800 shrink-0 gap-2">
          <h2 className="text-base font-semibold truncate pe-2 min-w-0">{title}</h2>
          <button
            onClick={onClose}
            className="p-1.5 -me-1 rounded-lg hover:bg-ink-100 dark:hover:bg-ink-800 shrink-0 touch-manipulation"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="overflow-y-auto p-4 sm:p-5 flex-1 overscroll-contain">{children}</div>
        {footer && (
          <div className="px-4 sm:px-5 py-3 border-t border-ink-100 dark:border-ink-800 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2 shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

export default Modal;
