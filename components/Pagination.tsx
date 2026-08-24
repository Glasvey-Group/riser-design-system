'use client';

import React from 'react';

/**
 * Pagination — standalone.
 *
 * Canonical source: RiserEvents `components/ui/Pagination.tsx` (currentPage,
 * totalPages, onPageChange, first/prev/next/last, a 3-page window). DataGrid
 * carries its own pagination for grids; this is for paginated card lists — the
 * organiser event lists and the category pages.
 *
 * The active page is marked by a 2px ink rule under the number, not a filled
 * pill. Numbers are mono with tabular figures so the row does not reflow as the
 * page count changes.
 */

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  /** Show first/last jumps. Events showed them; Promo's grid did not. */
  showEdges?: boolean;
  /** Page numbers in the window. Events used 3. */
  windowSize?: number;
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  showEdges = true,
  windowSize = 3,
  className = '',
}) => {
  if (totalPages <= 1) return null;

  const change = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) onPageChange(page);
  };

  const half = Math.floor(windowSize / 2);
  let start = Math.max(1, currentPage - half);
  let end = Math.min(totalPages, currentPage + half);
  if (currentPage - half < 1) end = Math.min(totalPages, start + windowSize - 1);
  if (currentPage + half > totalPages) start = Math.max(1, end - windowSize + 1);

  const pages: number[] = [];
  for (let i = start; i <= end; i += 1) pages.push(i);

  return (
    <nav className={`riser-pagination ${className}`.trim()} aria-label="Pagination">
      <div className="riser-pagination__pages">
        {showEdges ? (
          <button
            type="button"
            className="riser-pagination__page"
            onClick={() => change(1)}
            disabled={currentPage === 1}
            aria-label="First page"
          >
            «
          </button>
        ) : null}
        <button
          type="button"
          className="riser-pagination__page"
          onClick={() => change(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="Previous page"
        >
          ‹
        </button>

        {pages.map((page) => (
          <button
            key={page}
            type="button"
            className={[
              'riser-pagination__page',
              page === currentPage && 'riser-pagination__page--active',
            ].filter(Boolean).join(' ')}
            onClick={() => change(page)}
            aria-current={page === currentPage ? 'page' : undefined}
          >
            {page}
          </button>
        ))}

        <button
          type="button"
          className="riser-pagination__page"
          onClick={() => change(currentPage + 1)}
          disabled={currentPage === totalPages}
          aria-label="Next page"
        >
          ›
        </button>
        {showEdges ? (
          <button
            type="button"
            className="riser-pagination__page"
            onClick={() => change(totalPages)}
            disabled={currentPage === totalPages}
            aria-label="Last page"
          >
            »
          </button>
        ) : null}
      </div>
    </nav>
  );
};
