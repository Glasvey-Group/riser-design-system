import React from 'react';

/**
 * Field, Input, Textarea, Select, SearchInput, Checkbox.
 *
 * Canonical source: RiserEvents `CreateUpdateFormComponents` (CUFInputGroup,
 * CUFNumberInputGroup, CUFTextEditor, CUFDateInputGroup …), whose contract is
 * label + name + value + onChange + onBlur + required + error. Promo's inline
 * Tailwind inputs in DetailForm had the same contract expressed as classNames.
 * Both are folded in here.
 *
 * Two changes from what shipped:
 *   1. Labels are mono caps in slate, not 14px Inter in grey.
 *   2. Errors read as a mono caps line under the control, and the control's rule
 *      goes to 2px orange. Events rendered the literal string "Required" for
 *      every error, whatever went wrong; `error` now carries real text.
 *
 * Events' CUFPhoneNumberInputGroup had a `theme` prop ('1' = underline fields,
 * '2' = bordered + radius). Both are gone: there is one control treatment, and
 * it is the bordered square one. See docs/MIGRATION.md.
 */

export interface FieldProps {
  label: string;
  /** Matches the control's id and name. */
  htmlFor?: string;
  required?: boolean;
  /** Real error text, shown as a mono caps line. */
  error?: string;
  hint?: string;
  /** Span both columns of a two-column form grid. */
  full?: boolean;
  children: React.ReactNode;
  className?: string;
}

export const Field: React.FC<FieldProps> = ({
  label,
  htmlFor,
  required = false,
  error,
  hint,
  full = false,
  children,
  className = '',
}) => {
  const classes = [
    'riser-field',
    full && 'riser-field--full',
    error && 'riser-field--invalid',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={classes}>
      <label className="riser-field__label" htmlFor={htmlFor}>
        {label}
        {required ? <span className="riser-field__required" aria-hidden>*</span> : null}
        {required ? <span className="riser-visually-hidden"> (required)</span> : null}
      </label>
      {children}
      {hint && !error ? <span className="riser-field__hint">{hint}</span> : null}
      {error ? <span className="riser-field__error" role="alert">{error}</span> : null}
    </div>
  );
};

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Set in mono with tabular figures. Use for any numeric, technical or ID value. */
  data?: boolean;
}

export const Input: React.FC<InputProps> = ({ data = false, className = '', ...rest }) => (
  <input
    className={['riser-input', data && 'riser-input--data', className].filter(Boolean).join(' ')}
    {...rest}
  />
);

export const Textarea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = ({
  className = '',
  rows = 4,
  ...rest
}) => <textarea className={`riser-textarea ${className}`.trim()} rows={rows} {...rest} />;

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: SelectOption[];
  placeholder?: string;
  /** Promo's "+ Add Audience" / "+ Add Template" escape hatch. Rendered as the
   *  first option; selecting it fires `onAddOption` instead of onChange. */
  addOptionLabel?: string;
  onAddOption?: () => void;
}

const ADD_SENTINEL = '__riser_add__';

export const Select: React.FC<SelectProps> = ({
  options,
  placeholder,
  addOptionLabel,
  onAddOption,
  className = '',
  onChange,
  ...rest
}) => (
  <select
    className={`riser-select ${className}`.trim()}
    onChange={(event) => {
      if (event.target.value === ADD_SENTINEL) {
        onAddOption?.();
        return;
      }
      onChange?.(event);
    }}
    {...rest}
  >
    {placeholder ? <option value="">{placeholder}</option> : null}
    {addOptionLabel ? <option value={ADD_SENTINEL}>{addOptionLabel}</option> : null}
    {options.map((option) => (
      <option key={option.value} value={option.value}>
        {option.label}
      </option>
    ))}
  </select>
);

export interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  icon,
  className = '',
  placeholder = 'Search',
  ...rest
}) => (
  <div className={`riser-search ${className}`.trim()}>
    {icon ? <span className="riser-search__icon">{icon}</span> : null}
    <input type="search" className="riser-input" placeholder={placeholder} {...rest} />
  </div>
);

export const Checkbox: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = ({
  className = '',
  ...rest
}) => <input type="checkbox" className={`riser-check ${className}`.trim()} {...rest} />;
