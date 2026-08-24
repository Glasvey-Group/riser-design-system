import React from 'react';
import { Card, CardHeader, CardFooter } from './Card';

/**
 * DetailView.
 *
 * Both codebases already had this component with an identical prop contract
 * (title, data, fields, actions, bottomActions, status) — Events in CSS modules,
 * Promo in Tailwind. This is that contract, once.
 *
 * `status` reproduces Promo's rule: when no `bottomActions` are given and
 * `status === 1` (Draft), the header actions repeat in the footer. It is kept
 * for compatibility, but pass `bottomActions` explicitly in new screens —
 * a numeric status leaking into a presentational component is the kind of thing
 * that made the two copies drift.
 */

export interface DetailField {
  label: string;
  key: string;
  render?: (value: any, data: any) => React.ReactNode;
  /** Set the value in mono with tabular figures. For counts, money, dates, IDs. */
  data?: boolean;
}

export interface DetailViewProps {
  title: React.ReactNode;
  data: any;
  fields: DetailField[];
  actions?: React.ReactNode;
  bottomActions?: React.ReactNode;
  /** @deprecated Pass `bottomActions` instead. See note above. */
  status?: number;
  className?: string;
}

export const DetailView: React.FC<DetailViewProps> = ({
  title,
  data,
  fields,
  actions,
  bottomActions,
  status,
  className = '',
}) => {
  const renderValue = (field: DetailField) => {
    const value = data?.[field.key];
    if (field.render) return field.render(value, data);
    if (value === null || value === undefined || value === '') {
      return <span className="riser-detail__value--empty">—</span>;
    }
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  };

  const footer = bottomActions ?? (status === 1 && actions ? actions : undefined);

  return (
    <Card className={className}>
      <CardHeader title={title} actions={actions} />

      <div className="riser-detail__grid">
        {fields.map((field) => (
          <div key={field.key} className="riser-detail__field">
            <span className="riser-detail__label">{field.label}</span>
            <div className={['riser-detail__value', field.data && 'riser-detail__value--data']
              .filter(Boolean).join(' ')}>
              {renderValue(field)}
            </div>
          </div>
        ))}
      </div>

      {footer ? <CardFooter>{footer}</CardFooter> : null}
    </Card>
  );
};
