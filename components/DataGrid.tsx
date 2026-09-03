'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Filter, FilterItem, ALL } from './Filter';
import { SearchInput } from './Field';

/**
 * DataGrid.
 *
 * Canonical source: RiserEvents `components/ui/DataGrid/DataGrid.tsx`. Its prop
 * contract is kept exactly, including the `responsive` breakpoint algorithm,
 * which both codebases depend on and which is not a styling detail — it decides
 * which columns exist at a given width.
 *
 * Promo's copy (components/DataGrid/DataGrid.tsx) was identical except that it
 * fetched the current user's team membership inside the component and rendered a
 * "Operating as a {organizer} Team Member" banner above the grid. That is folded
 * in as the `notice` prop rather than a second component — and the fetching
 * stays in the screen, where it belongs, instead of inside a presentational
 * grid. Promo's credit screen rendered the same banner inline; it now uses the
 * same Notice component.
 *
 * Layout notes:
 *   - Rows are separated by hairlines. No zebra fill, no cell borders.
 *   - The header row is mono caps over a 2px ink rule.
 *   - Rows carry a leading gutter so that rule has somewhere to sit; without it the
 *     first column reads as flush against the orange and looks like a defect.
 *   - The active row is marked by a 2px orange rule on its leading edge. That is
 *     the view's one orange thing when a grid row is selected.
 *   - Below 500px the grid becomes stacked records, each cell labelled by its
 *     column via `data-label`.
 */

export interface ResponsiveBreakpoint {
  /** Screen width in pixels, read as a min-width. */
  breakpoint: number;
  /** Column width as a percentage. 0 hides the column at this width. */
  width: number;
}

export interface ColumnConfig {
  label: string;
  key: string;
  render?: (value: any, row: any) => React.ReactNode;
  sortable?: boolean;
  /** Set in mono with tabular figures. For counts, money, dates, IDs. */
  data?: boolean;
  /**
   * Breakpoints behave like CSS min-width: each applies from that width upward.
   * [{breakpoint: 1200, width: 15}, {breakpoint: 960, width: 20}, {breakpoint: 0, width: 0}]
   *   ≥1200px → 15%   960–1199px → 20%   <960px → hidden
   * A column with no `responsive` entry is hidden at every width.
   */
  responsive?: ResponsiveBreakpoint[];
}

export interface FilterOption extends FilterItem {}

export interface DataGridProps {
  title: string;
  columns: ColumnConfig[];
  data: any[];
  /** Items per page. Used only to compute page count; the parent slices the data. */
  pageSize?: number;
  showPagination?: boolean;
  /** Total items in the database, not in `data`. */
  totalCount?: number;
  /** 1-indexed. */
  activePageNumber?: number;
  onPageChange?: (pageIndex: number) => void;
  emptyMessage?: string;
  searchable?: boolean;
  searchPlaceholder?: string;
  filterOptions?: FilterOption[];
  /** Key on each row holding the filter id. */
  filterKey?: string;
  filterLabel?: string;
  /** Row id to mark as selected. */
  activeId?: string;
  /** Row click handler. Falls back to navigating to `row.baseUrl` when omitted. */
  onRowClick?: (row: any) => void;
  /**
   * Advisory bar above the grid. This is Promo's "Operating as a team member"
   * banner, passed in rather than fetched here.
   */
  notice?: React.ReactNode;
  className?: string;
}

const useWindowWidth = () => {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const update = () => setWidth(window.innerWidth);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);
  return width;
};

/** Unchanged from Events. Exported so screens can reason about visibility. */
export const getColumnWidth = (column: ColumnConfig, currentWidth: number): number | null => {
  if (!column.responsive || column.responsive.length === 0) return null;

  const sorted = [...column.responsive].sort((a, b) => b.breakpoint - a.breakpoint);
  const match = sorted.find((bp) => currentWidth >= bp.breakpoint);

  if (match) return match.width === 0 ? null : match.width;
  if (sorted.length === 1) return null;

  const smallest = sorted[sorted.length - 1];
  return smallest.width === 0 ? null : smallest.width;
};

export const DataGrid: React.FC<DataGridProps> = ({
  title,
  columns,
  data,
  pageSize = 10,
  showPagination = false,
  totalCount = 0,
  activePageNumber = 1,
  onPageChange,
  emptyMessage = 'No data available',
  searchable = true,
  searchPlaceholder = 'Search',
  filterOptions = [],
  filterKey = 'filterId',
  filterLabel = 'Filter',
  activeId,
  onRowClick,
  notice,
  className = '',
}) => {
  const [query, setQuery] = useState('');
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [selectedFilterId, setSelectedFilterId] = useState<string>(ALL);
  const windowWidth = useWindowWidth();

  const hasFilter = filterOptions.length > 0;

  const visibleColumns = useMemo(() => {
    if (windowWidth === 0) return columns;
    return columns.filter((column) => {
      const width = getColumnWidth(column, windowWidth);
      return width !== null && width > 0;
    });
  }, [columns, windowWidth]);

  const filtered = useMemo(() => {
    let result = data;

    if (hasFilter && selectedFilterId !== ALL) {
      result = result.filter((row) => row[filterKey] === selectedFilterId);
    }

    if (query.trim()) {
      const needle = query.toLowerCase().trim();
      result = result.filter((row) => {
        if (row.keywords) {
          const keywords = Array.isArray(row.keywords)
            ? row.keywords.join(' ').toLowerCase()
            : String(row.keywords).toLowerCase();
          if (keywords.includes(needle)) return true;
        }
        return visibleColumns.some((column) => {
          const value = row[column.key];
          if (value === null || value === undefined) return false;
          return String(value).toLowerCase().includes(needle);
        });
      });
    }

    return result;
  }, [data, query, visibleColumns, hasFilter, selectedFilterId, filterKey]);

  const sorted = useMemo(() => {
    if (!sortColumn) return filtered;
    if (!visibleColumns.some((column) => column.key === sortColumn)) return filtered;

    return [...filtered].sort((a, b) => {
      const left = a[sortColumn];
      const right = b[sortColumn];
      if (left === null || left === undefined) return 1;
      if (right === null || right === undefined) return -1;

      const l = String(left).toLowerCase();
      const r = String(right).toLowerCase();
      const comparison = l < r ? -1 : l > r ? 1 : 0;
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [filtered, sortColumn, sortDirection, visibleColumns]);

  const totalPages = showPagination && pageSize > 0 ? Math.ceil(totalCount / pageSize) : 0;
  const currentPage = showPagination ? activePageNumber : 1;
  const noResults = query.trim().length > 0 && sorted.length === 0;

  const columnStyle = (column: ColumnConfig) => {
    const width = getColumnWidth(column, windowWidth);
    if (width === null || width === 0) return { display: 'none' as const };
    return { width: `${width}%` };
  };

  const toggleSort = (key: string, direction: 'asc' | 'desc') => {
    if (sortColumn === key && sortDirection === direction) {
      setSortColumn(null);
      return;
    }
    setSortColumn(key);
    setSortDirection(direction);
  };

  const handleRowClick = (row: any, event: React.MouseEvent) => {
    const target = event.target as HTMLElement;
    if (target.closest('button, a, [role="button"]')) return;
    if (onRowClick) { onRowClick(row); return; }
    if (row.baseUrl && typeof window !== 'undefined') window.location.assign(row.baseUrl);
  };

  const pageNumbers = useMemo(() => {
    const pages: (number | '…')[] = [];
    const maxVisible = 5;
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i += 1) pages.push(i);
      return pages;
    }
    pages.push(1);
    if (currentPage <= 3) {
      for (let i = 2; i <= 4; i += 1) pages.push(i);
      pages.push('…', totalPages);
    } else if (currentPage >= totalPages - 2) {
      pages.push('…');
      for (let i = totalPages - 3; i <= totalPages; i += 1) pages.push(i);
    } else {
      pages.push('…');
      for (let i = currentPage - 1; i <= currentPage + 1; i += 1) pages.push(i);
      pages.push('…', totalPages);
    }
    return pages;
  }, [totalPages, currentPage]);

  const goTo = (page: number) => {
    if (onPageChange && page >= 1 && page <= totalPages && page !== currentPage) onPageChange(page);
  };

  return (
    <div className={`riser-grid ${className}`.trim()}>
      <div className="riser-grid__header">
        <div className="riser-grid__heading">
          <h2 className="riser-grid__title">{title}</h2>
          {showPagination && totalCount > 0 ? (
            <span className="riser-grid__count">{totalCount}</span>
          ) : null}
        </div>

        <div className="riser-grid__controls">
          {hasFilter ? (
            <Filter
              items={filterOptions}
              selectedId={selectedFilterId}
              onChange={setSelectedFilterId}
              label={filterLabel}
            />
          ) : null}
          {searchable ? (
            <SearchInput
              value={query}
              placeholder={searchPlaceholder}
              onChange={(event) => setQuery(event.target.value)}
              aria-label={`Search ${title}`}
            />
          ) : null}
        </div>
      </div>

      {notice}

      {data.length === 0 ? (
        <div className="riser-grid__empty">
          <p className="riser-label">{emptyMessage}</p>
        </div>
      ) : noResults ? (
        <div className="riser-grid__empty">
          <p className="riser-label">No results for “{query}”</p>
        </div>
      ) : (
        <>
          <div className="riser-grid__table" role="table">
            <div className="riser-grid__head-row" role="row">
              {visibleColumns.map((column) => (
                <div
                  key={column.key}
                  role="columnheader"
                  className={[
                    'riser-grid__head-cell',
                    column.sortable && 'riser-grid__head-cell--sortable',
                  ].filter(Boolean).join(' ')}
                  style={columnStyle(column)}
                  aria-sort={
                    sortColumn === column.key
                      ? sortDirection === 'asc' ? 'ascending' : 'descending'
                      : undefined
                  }
                >
                  <span>{column.label}</span>
                  {column.sortable ? (
                    <span className="riser-grid__sort">
                      <button
                        type="button"
                        className={[
                          'riser-grid__sort-btn',
                          sortColumn === column.key && sortDirection === 'asc' && 'riser-grid__sort-btn--active',
                        ].filter(Boolean).join(' ')}
                        onClick={() => toggleSort(column.key, 'asc')}
                        aria-label={`Sort ${column.label} ascending`}
                      >
                        <svg width="9" height="5" viewBox="0 0 9 5" aria-hidden><path d="M0 5 4.5 0 9 5Z" fill="currentColor" /></svg>
                      </button>
                      <button
                        type="button"
                        className={[
                          'riser-grid__sort-btn',
                          sortColumn === column.key && sortDirection === 'desc' && 'riser-grid__sort-btn--active',
                        ].filter(Boolean).join(' ')}
                        onClick={() => toggleSort(column.key, 'desc')}
                        aria-label={`Sort ${column.label} descending`}
                      >
                        <svg width="9" height="5" viewBox="0 0 9 5" aria-hidden><path d="M0 0 4.5 5 9 0Z" fill="currentColor" /></svg>
                      </button>
                    </span>
                  ) : null}
                </div>
              ))}
            </div>

            <div className="riser-grid__body">
              {sorted.map((row, rowIndex) => {
                const isActive = Boolean(activeId) && row.id === activeId;
                const clickable = Boolean(onRowClick || row.baseUrl);
                return (
                  <div
                    key={row.id ?? rowIndex}
                    role="row"
                    className={[
                      'riser-grid__row',
                      clickable && 'riser-grid__row--clickable',
                      isActive && 'riser-grid__row--active',
                    ].filter(Boolean).join(' ')}
                    onClick={(event) => handleRowClick(row, event)}
                  >
                    {visibleColumns.map((column) => (
                      <div
                        key={column.key}
                        role="cell"
                        className={['riser-grid__cell', column.data && 'riser-grid__cell--data']
                          .filter(Boolean).join(' ')}
                        style={columnStyle(column)}
                        data-label={column.label}
                      >
                        {column.render ? column.render(row[column.key], row) : row[column.key] ?? ''}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>

          {showPagination && totalPages > 1 ? (
            <nav className="riser-pagination" aria-label={`${title} pagination`}>
              <button
                type="button"
                className="riser-pagination__page riser-pagination__step"
                onClick={() => goTo(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Prev
              </button>

              <div className="riser-pagination__pages">
                {pageNumbers.map((page, index) =>
                  page === '…' ? (
                    <span key={`gap-${index}`} className="riser-pagination__ellipsis">…</span>
                  ) : (
                    <button
                      key={page}
                      type="button"
                      className={[
                        'riser-pagination__page',
                        page === currentPage && 'riser-pagination__page--active',
                      ].filter(Boolean).join(' ')}
                      onClick={() => goTo(page)}
                      aria-current={page === currentPage ? 'page' : undefined}
                    >
                      {page}
                    </button>
                  )
                )}
              </div>

              <button
                type="button"
                className="riser-pagination__page riser-pagination__step"
                onClick={() => goTo(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </nav>
          ) : null}
        </>
      )}
    </div>
  );
};
