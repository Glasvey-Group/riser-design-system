'use client';

import React, { useRef, useState } from 'react';

/**
 * Dropzone.
 *
 * Canonical source: the CSV upload on Promo's upload-audience screen. Recreated
 * from that code, not invented: drag-and-drop or click to browse, a dragging
 * state, a processing state, a named-file state with a reset control, and a hint
 * line listing the expected columns.
 *
 * A dropzone is a specification of what belongs there, so the border is a dashed
 * hairline — one of the few places dashed is correct. The dragging state takes
 * it to orange; that is the one orange thing while a file is over the target.
 * The original scaled the whole zone up 5% on drag; nothing scales here.
 */

export interface DropzoneProps {
  onFile: (file: File) => void;
  accept?: string;
  /** e.g. "CSV should include: FirstName, LastName, Email, Mobile (required)…" */
  hint?: string;
  headline?: string;
  /** Name of the loaded file. Switches to the loaded state. */
  fileName?: string | null;
  onReset?: () => void;
  processing?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  className?: string;
}

export const Dropzone: React.FC<DropzoneProps> = ({
  onFile,
  accept = '.csv',
  hint,
  headline = 'Drag and drop a CSV file',
  fileName,
  onReset,
  processing = false,
  disabled = false,
  icon,
  className = '',
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const take = (file?: File | null) => { if (file) onFile(file); };

  return (
    <div
      className={[
        'riser-dropzone',
        dragging && 'riser-dropzone--dragging',
        (processing || disabled) && 'riser-dropzone--disabled',
        className,
      ].filter(Boolean).join(' ')}
      onClick={() => inputRef.current?.click()}
      onDragOver={(event) => { event.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={(event) => {
        event.preventDefault();
        setDragging(false);
        take(event.dataTransfer.files?.[0]);
      }}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') inputRef.current?.click();
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        hidden
        onChange={(event) => take(event.target.files?.[0])}
      />

      {icon}

      {fileName ? (
        <>
          <div className="riser-dropzone__file">
            <span className="riser-data">{fileName}</span>
          </div>
          {processing ? (
            <span className="riser-dropzone__hint">Processing</span>
          ) : onReset ? (
            <button
              type="button"
              className="riser-button riser-button--ghost riser-button--sm"
              onClick={(event) => { event.stopPropagation(); onReset(); }}
            >
              Remove
            </button>
          ) : null}
        </>
      ) : (
        <>
          <span className="riser-dropzone__headline">
            {dragging ? 'Drop the file' : headline}
          </span>
          <span className="riser-dropzone__hint">or click to browse</span>
          {hint ? <span className="riser-dropzone__spec">{hint}</span> : null}
        </>
      )}
    </div>
  );
};
