'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardFooter } from './Card';
import { Field, Input, Select, Textarea, SelectOption } from './Field';
import { Button } from './Button';

/**
 * DetailForm.
 *
 * Canonical source: Promo `components/DetailForm/DetailForm.tsx`, which is the
 * richer of the two — it has the field-type switch, the dynamic `disabled`
 * predicate, and the `addOptionRedirect` escape hatch that lets a select offer
 * "+ Add Audience". Events' DetailForm is the same shape with fewer types.
 *
 * Two things are lifted out of the component:
 *
 *   1. Promo hard-coded which sentinel value belonged to which key
 *      (`audienceId → __ADD_AUDIENCE__`) and did its own router.push. That is
 *      now `onAddOption` on the field, so the screen owns navigation.
 *   2. Promo reset `parentAudienceId` whenever `audienceType` changed away from
 *      DERIVED — audience-model logic living inside a form renderer. Use
 *      `onChangeField` to do that in the screen.
 *
 * The date field renders a plain `datetime-local` input. Both codebases used
 * Syncfusion's DateTimePicker, which ships its own Material stylesheet and
 * cannot be squared or recoloured without overriding it in globals.css — which
 * is exactly what Promo ended up doing. See docs/MIGRATION.md.
 */

export type FormFieldType =
  | 'text' | 'textarea' | 'number' | 'select' | 'date' | 'datetime-local' | 'email' | 'tel';

export interface FormField {
  label: string;
  key: string;
  type?: FormFieldType;
  placeholder?: string;
  required?: boolean;
  /** Boolean, or a predicate over the current form data. */
  disabled?: boolean | ((data: any) => boolean);
  options?: SelectOption[];
  hint?: string;
  /** Span both columns. */
  full?: boolean;
  /** Label for an extra first option, e.g. "+ Add Audience". */
  addOptionLabel?: string;
  /** Fired when that option is picked. The screen navigates. */
  onAddOption?: () => void;
  render?: (
    field: FormField,
    value: any,
    onChange: (value: any) => void,
    data: any
  ) => React.ReactNode;
}

export interface DetailFormProps {
  title: React.ReactNode;
  data: any;
  fields: FormField[];
  onSubmit: (data: any) => void;
  onCancel: () => void;
  /** Called on every field change, with the whole next form state. */
  onChangeField?: (key: string, value: any, next: any) => void;
  submitLabel?: string;
  cancelLabel?: string;
  errors?: Record<string, string>;
  className?: string;
}

export const DetailForm: React.FC<DetailFormProps> = ({
  title,
  data,
  fields,
  onSubmit,
  onCancel,
  onChangeField,
  submitLabel = 'Save',
  cancelLabel = 'Cancel',
  errors = {},
  className = '',
}) => {
  const [formData, setFormData] = useState<any>(data ?? {});

  useEffect(() => { setFormData(data ?? {}); }, [data]);

  const change = (key: string, value: any) => {
    setFormData((previous: any) => {
      const next = { ...previous, [key]: value };
      onChangeField?.(key, value, next);
      return next;
    });
  };

  const renderControl = (field: FormField) => {
    const value = formData[field.key] ?? '';
    const disabled = typeof field.disabled === 'function' ? field.disabled(formData) : Boolean(field.disabled);
    const shared = { id: field.key, name: field.key, disabled, required: field.required };

    if (field.render) return field.render(field, value, (next) => change(field.key, next), formData);

    switch (field.type) {
      case 'textarea':
        return (
          <Textarea
            {...shared}
            value={value}
            placeholder={field.placeholder}
            onChange={(event) => change(field.key, event.target.value)}
          />
        );
      case 'select':
        return (
          <Select
            {...shared}
            value={value}
            options={field.options ?? []}
            placeholder={`Select ${field.label.toLowerCase()}`}
            addOptionLabel={field.addOptionLabel}
            onAddOption={field.onAddOption}
            onChange={(event) => change(field.key, event.target.value)}
          />
        );
      case 'number':
        return (
          <Input
            {...shared}
            data
            type="number"
            value={value}
            placeholder={field.placeholder}
            onChange={(event) => change(field.key, event.target.value === '' ? '' : Number(event.target.value))}
          />
        );
      case 'date':
      case 'datetime-local':
        return (
          <Input
            {...shared}
            data
            type={field.type}
            value={value}
            onChange={(event) => change(field.key, event.target.value)}
          />
        );
      default:
        return (
          <Input
            {...shared}
            type={field.type ?? 'text'}
            value={value}
            placeholder={field.placeholder}
            onChange={(event) => change(field.key, event.target.value)}
          />
        );
    }
  };

  return (
    <Card className={className}>
      <h2 className="riser-card__title" style={{ marginBottom: 'var(--space-5)' }}>{title}</h2>

      <form
        onSubmit={(event) => { event.preventDefault(); onSubmit(formData); }}
        noValidate
      >
        <div className="riser-detail__grid">
          {fields.map((field) => (
            <Field
              key={field.key}
              label={field.label}
              htmlFor={field.key}
              required={field.required}
              error={errors[field.key]}
              hint={field.hint}
              full={field.full}
            >
              {renderControl(field)}
            </Field>
          ))}
        </div>

        <CardFooter>
          <Button variant="secondary" onClick={onCancel}>{cancelLabel}</Button>
          <Button variant="primary" type="submit">{submitLabel}</Button>
        </CardFooter>
      </form>
    </Card>
  );
};
