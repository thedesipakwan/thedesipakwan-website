"use client";

import { forwardRef, type InputHTMLAttributes, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";

const fieldClass =
  "w-full rounded-[12px] border-2 border-pista-200 bg-white/70 px-4 py-3 text-[16px] text-paan-900 placeholder:text-paan-700/40 focus:border-kesariya-500 focus:outline-none transition-colors";

export interface FieldProps {
  label: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, FieldProps & InputHTMLAttributes<HTMLInputElement>>(
  function Input({ label, error, hint, className = "", id, ...props }, ref) {
    const inputId = id ?? `field-${props.name}`;
    return (
      <div className={className}>
        <label htmlFor={inputId} className="mb-1.5 block text-[14px] font-bold text-paan-900">
          {label}
        </label>
        <input
          ref={ref}
          id={inputId}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : undefined}
          className={fieldClass}
          {...props}
        />
        {error ? (
          <p id={`${inputId}-error`} className="mt-1 text-[14px] font-medium text-sindoor-600">
            {error}
          </p>
        ) : hint ? (
          <p className="mt-1 text-[14px] text-paan-700/60">{hint}</p>
        ) : null}
      </div>
    );
  }
);

export const Select = forwardRef<HTMLSelectElement, FieldProps & SelectHTMLAttributes<HTMLSelectElement>>(
  function Select({ label, error, className = "", id, children, ...props }, ref) {
    const inputId = id ?? `field-${props.name}`;
    return (
      <div className={className}>
        <label htmlFor={inputId} className="mb-1.5 block text-[14px] font-bold text-paan-900">
          {label}
        </label>
        <select ref={ref} id={inputId} aria-invalid={!!error} className={fieldClass} {...props}>
          {children}
        </select>
        {error ? (
          <p className="mt-1 text-[14px] font-medium text-sindoor-600">{error}</p>
        ) : null}
      </div>
    );
  }
);

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  FieldProps & TextareaHTMLAttributes<HTMLTextAreaElement>
>(function Textarea({ label, error, className = "", id, ...props }, ref) {
  const inputId = id ?? `field-${props.name}`;
  return (
    <div className={className}>
      <label htmlFor={inputId} className="mb-1.5 block text-[14px] font-bold text-paan-900">
        {label}
      </label>
      <textarea ref={ref} id={inputId} aria-invalid={!!error} className={fieldClass} rows={3} {...props} />
      {error ? <p className="mt-1 text-[14px] font-medium text-sindoor-600">{error}</p> : null}
    </div>
  );
});
