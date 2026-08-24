'use client';

import React, { useEffect, useRef, useState } from 'react';

/**
 * Filter — a labelled dropdown.
 *
 * Canonical source: RiserEvents `components/Filter.tsx` (items, onFilterChange,
 * placeholder, filterText, align, showLabel). Promo had the same control built
 * inline inside DataGrid with `filterOptions` / `filterLabel`. This is the one
 * control; DataGrid now renders it rather than reimplementing it.
 */

export interface FilterItem {
  id: string;
  value: string;
}

export interface FilterProps {
  items: FilterItem[];
  selectedId: string;
  onChange: (id: string) => void;
  /** Mono caps label before the value, e.g. "Brand". */
  label?: string;
  /** Option shown first, selecting everything. Pass null to omit. */
  allLabel?: string | null;
  align?: 'left' | 'right';
  className?: string;
}

export const ALL = 'All';

export const Filter: React.FC<FilterProps> = ({
  items,
  selectedId,
  onChange,
  label,
  allLabel = ALL,
  align = 'right',
  className = '',
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const selected = items.find((item) => item.id === selectedId);
  const display = selected ? selected.value : allLabel ?? '';

  return (
    <div className={`riser-filter ${className}`.trim()} ref={ref}>
      <button
        type="button"
        className="riser-filter__trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        {label ? <span className="riser-filter__label">{label}</span> : null}
        <span className="riser-filter__value">{display}</span>
      </button>

      {open ? (
        <div
          className={['riser-filter__menu', align === 'left' && 'riser-filter__menu--left']
            .filter(Boolean).join(' ')}
          role="listbox"
        >
          {allLabel ? (
            <button
              type="button"
              role="option"
              aria-selected={selectedId === ALL}
              className={['riser-filter__item', selectedId === ALL && 'riser-filter__item--active']
                .filter(Boolean).join(' ')}
              onClick={() => { onChange(ALL); setOpen(false); }}
            >
              {allLabel}
            </button>
          ) : null}
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              role="option"
              aria-selected={selectedId === item.id}
              className={['riser-filter__item', selectedId === item.id && 'riser-filter__item--active']
                .filter(Boolean).join(' ')}
              onClick={() => { onChange(item.id); setOpen(false); }}
            >
              {item.value}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
};
