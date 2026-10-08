import { forwardRef, useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface FieldProps {
  label: string;
  hint?: string;
  error?: string;
  children: (a: { id: string; 'aria-describedby'?: string; 'aria-invalid'?: true }) => ReactNode;
}

export function FormField({ label, hint, error, children }: FieldProps) {
  const id = useId();
  const hintId = `${id}-hint`;
  const errId = `${id}-err`;
  const describedBy = [hint && hintId, error && errId].filter(Boolean).join(' ') || undefined;
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="font-semibold">{label}</label>
      {children({ id, 'aria-describedby': describedBy, ...(error ? { 'aria-invalid': true as const } : {}) })}
      {hint && <p id={hintId} className="text-sm text-muted">{hint}</p>}
      {error && <p id={errId} role="alert" className="text-sm text-danger-text">{error}</p>}
    </div>
  );
}

const control =
  'min-h-tap w-full rounded-control border border-subtle bg-surface px-3 text-text placeholder:text-muted aria-[invalid=true]:border-danger';

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function Input({ className, ...rest }, ref) {
  return <input ref={ref} className={cn(control, className)} {...rest} />;
});

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(function Select({ className, ...rest }, ref) {
  return <select ref={ref} className={cn(control, className)} {...rest} />;
});
