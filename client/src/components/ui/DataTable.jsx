import { useState } from 'react';
import clsx from 'clsx';
import EmptyState from './EmptyState';
import { useTranslation } from 'react-i18next';
import { ChevronDown } from 'lucide-react';

/**
 * Responsive data table.
 * Props:
 *  - columns: [{ key, header, render, className, cellClassName, primary, hiddenOnMobile }]
 *  - rows
 *  - loading
 *  - empty
 *  - onRowClick
 *  - rowKey
 *  - rowClassName: (row) => string — extra classes per row (e.g. priority-based coloring)
 *  - mobileBreakpoint: 'sm' | 'md' (default 'md') — below this, rows render as cards
 */
const DataTable = ({
  columns,
  rows,
  loading,
  empty,
  className,
  rowKey = '_id',
  onRowClick,
  rowClassName,
  mobileBreakpoint = 'md',
}) => {
  const { t } = useTranslation();
  const mobileHidden = mobileBreakpoint === 'sm' ? 'sm' : 'md';
  const mobileOnly = mobileBreakpoint === 'sm' ? 'hidden sm:block' : 'hidden md:block';
  const desktopOnly = mobileBreakpoint === 'sm' ? 'sm:hidden' : 'md:hidden';

  // Find which columns should be visible in the mobile card. Prefer the column marked
  // `primary`, otherwise the first column.
  const primaryCol = columns.find((c) => c.primary) || columns[0];
  const headerCols = columns.filter((c) => c.key !== 'actions' && !c.hiddenOnMobile);
  const actionCol = columns.find((c) => c.key === 'actions');
  const secondaryCols = columns.filter(
    (c) => c.key !== primaryCol.key && c.key !== 'actions' && !c.hiddenOnMobile
  );

  return (
    <>
      {/* Desktop / tablet table */}
      <div className={clsx('table-wrap hidden md:block', className)}>
        <table className="data-table">
          <thead>
            <tr>
              {columns.map((c) => (
                <th
                  key={c.key}
                  style={c.width ? { width: c.width } : undefined}
                  className={c.className}
                >
                  {c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <tr key={`s-${i}`}>
                    {columns.map((c) => (
                      <td key={c.key}><div className="skeleton h-4 w-full" /></td>
                    ))}
                  </tr>
                ))
              : rows?.length
              ? rows.map((r) => (
                  <tr
                    key={r[rowKey]}
                    onClick={onRowClick ? () => onRowClick(r) : undefined}
                    className={clsx(
                      onRowClick ? 'cursor-pointer' : '',
                      rowClassName ? rowClassName(r) : ''
                    )}
                  >
                    {columns.map((c) => (
                      <td
                        key={c.key}
                        className={c.cellClassName}
                        onClick={c.key === 'actions' ? (e) => e.stopPropagation() : undefined}
                      >
                        {c.render ? c.render(r) : r[c.key]}
                      </td>
                    ))}
                  </tr>
                ))
              : (
                  <tr>
                    <td colSpan={columns.length} className="!p-0">
                      <EmptyState
                        title={t('common.noData')}
                        message={empty?.message || t('common.noResults')}
                        icon={empty?.icon}
                      />
                    </td>
                  </tr>
                )}
          </tbody>
        </table>
      </div>

      {/* Mobile card list */}
      <div className={clsx('md:hidden space-y-2', className)}>
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={`s-m-${i}`} className="card p-3">
                <div className="skeleton h-4 w-2/3 mb-2" />
                <div className="skeleton h-3 w-1/2 mb-1.5" />
                <div className="skeleton h-3 w-1/3" />
              </div>
            ))
          : rows?.length
          ? rows.map((r) => (
              <MobileCard
                key={r[rowKey]}
                row={r}
                primaryCol={primaryCol}
                secondaryCols={secondaryCols}
                actionCol={actionCol}
                onRowClick={onRowClick}
                rowClassName={rowClassName}
              />
            ))
          : (
              <div className="card p-4">
                <EmptyState
                  title={t('common.noData')}
                  message={empty?.message || t('common.noResults')}
                  icon={empty?.icon}
                />
              </div>
            )}
      </div>
    </>
  );
};

const MobileCard = ({ row, primaryCol, secondaryCols, actionCol, onRowClick, rowClassName }) => {
  const [expanded, setExpanded] = useState(false);
  const hasMore = secondaryCols.length > 0;

  return (
    <div
      className={clsx(
        'card p-3',
        onRowClick && 'cursor-pointer active:scale-[0.99] transition',
        rowClassName ? rowClassName(row) : ''
      )}
      onClick={onRowClick ? () => onRowClick(row) : undefined}
    >
      <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <div className="font-medium text-sm truncate">
            {primaryCol.render ? primaryCol.render(row) : row[primaryCol.key]}
          </div>
          {!expanded && secondaryCols.length > 0 && (
            <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5">
              {secondaryCols.slice(0, 2).map((c) => (
                <div key={c.key} className="text-[11px] text-ink-500 flex items-center gap-1 min-w-0">
                  {c.header && <span className="text-ink-400">{c.header}:</span>}
                  <span className="truncate max-w-[120px]">
                    {c.render ? c.render(row) : row[c.key]}
                  </span>
                </div>
              ))}
            </div>
          )}
          {expanded && (
            <div className="mt-2 space-y-1.5 border-t border-app-border pt-2">
              {secondaryCols.map((c) => (
                <div key={c.key} className="flex items-center justify-between gap-2 text-xs">
                  <span className="text-ink-500 shrink-0">{c.header}</span>
                  <span className="font-medium text-end truncate min-w-0">
                    {c.render ? c.render(row) : row[c.key] || '—'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
          {actionCol && (
            <div className="flex items-center gap-0.5">
              {actionCol.render ? actionCol.render(row) : null}
            </div>
          )}
          {hasMore && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setExpanded((v) => !v);
              }}
              className="p-1.5 rounded-lg hover:bg-app-muted text-app-muted"
              aria-label="Toggle details"
            >
              <ChevronDown
                className={clsx('h-4 w-4 transition-transform', expanded && 'rotate-180')}
              />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DataTable;
