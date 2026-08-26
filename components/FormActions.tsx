import React from 'react';

/**
 * FormActions — where a form's buttons go.
 *
 * Two rules this exists to make unloseable, both of which were left to call sites and both
 * of which were got wrong:
 *
 *   The primary action is last, so it lands on the right where the eye finishes reading.
 *   Cancel then Save. A form that renders Save then Cancel puts the escape hatch under the
 *   pointer at the moment of committing.
 *
 *   The row is right-aligned. A standalone action under a section — Add Ticket, Add Social —
 *   ends where the fields end, rather than trailing off the left margin on its own.
 *
 * Pass the buttons, not their order:
 *
 *   <FormActions
 *     secondary={<Button variant="secondary" onClick={onCancel}>Cancel</Button>}
 *     primary={<Button variant="ink" onClick={onSave}>Save</Button>}
 *   />
 *
 * A single action that adds a row rather than closing a form takes `bare`, which drops the
 * hairline and the air above it:
 *
 *   <FormActions bare primary={<Button variant="ink" icon={<Icon as={Plus} />}>Add Ticket</Button>} />
 */

export interface FormActionsProps {
  /** The action that completes the form. Rendered last, on the right, always. */
  primary: React.ReactNode;
  /** Cancel, Back, Discard — or nothing. Rendered before the primary. */
  secondary?: React.ReactNode;
  /**
   * Drop the hairline and most of the space above. For an actions row that adds to a
   * section rather than closing a form.
   */
  bare?: boolean;
  className?: string;
}

export const FormActions: React.FC<FormActionsProps> = ({
  primary,
  secondary,
  bare = false,
  className = '',
}) => {
  const classes = [
    'riser-form-actions',
    bare && 'riser-form-actions--bare',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={classes}>
      {secondary}
      {primary}
    </div>
  );
};
