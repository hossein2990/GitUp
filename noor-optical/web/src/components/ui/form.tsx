import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';
import { MinusIcon, PlusIcon } from './Icons';

export const Field = ({
  label,
  htmlFor,
  hint,
  error,
  required = false,
  optionalLabel,
  children,
  className = '',
}: {
  label: string;
  htmlFor?: string;
  hint?: string;
  error?: string | null;
  required?: boolean;
  optionalLabel?: string;
  children: ReactNode;
  className?: string;
}) => (
  <div className={`flex flex-col gap-2 ${className}`}>
    <label htmlFor={htmlFor} className="flex items-baseline justify-between gap-2 text-[12px] uppercase tracking-label text-slate">
      <span>
        {label}
        {required ? <span className="text-champagne-dark"> *</span> : null}
      </span>
      {!required && optionalLabel ? <span className="normal-case tracking-normal text-slate-light">{optionalLabel}</span> : null}
    </label>
    {children}
    {hint && !error ? <p className="text-[12px] text-slate-light">{hint}</p> : null}
    {error ? <p className="text-[12px] text-[#B4462F]">{error}</p> : null}
  </div>
);

const controlClass =
  'w-full border border-line bg-paper px-4 py-3 text-[15px] text-ink transition-colors duration-200 placeholder:text-slate-light hover:border-line-strong focus:border-navy focus:outline-none disabled:bg-navy/5';

export const Input = ({ className = '', ...rest }: InputHTMLAttributes<HTMLInputElement>) => (
  <input {...rest} className={`${controlClass} ${className}`} />
);

export const Textarea = ({ className = '', ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea {...rest} className={`${controlClass} min-h-[120px] resize-y ${className}`} />
);

export const Select = ({ className = '', children, ...rest }: SelectHTMLAttributes<HTMLSelectElement>) => (
  <select {...rest} className={`${controlClass} appearance-none ${className}`}>
    {children}
  </select>
);

export const Checkbox = ({
  label,
  checked,
  onChange,
  count,
  name,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  count?: number;
  name?: string;
}) => (
  <label className="group flex cursor-pointer items-center gap-3 py-[6px] text-[14px] text-ink">
    <input
      type="checkbox"
      name={name}
      checked={checked}
      onChange={(event) => onChange(event.target.checked)}
      className="peer sr-only"
    />
    <span
      aria-hidden
      className={`relative flex h-[17px] w-[17px] shrink-0 items-center justify-center border transition-colors duration-200 ${
        checked ? 'border-navy bg-navy' : 'border-line-strong bg-paper group-hover:border-navy'
      }`}
    >
      {checked ? (
        <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden>
          <path d="m1.5 6.2 3 3L10.5 3" stroke="rgb(var(--ivory))" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      ) : null}
    </span>
    <span className="flex-1">{label}</span>
    {count !== undefined ? <span className="text-[12px] text-slate-light">{count}</span> : null}
  </label>
);

export const RadioOption = ({
  label,
  checked,
  onSelect,
  description,
}: {
  label: string;
  checked: boolean;
  onSelect: () => void;
  description?: string;
}) => (
  <label
    className={`flex cursor-pointer items-start gap-3 border px-4 py-3 transition-colors duration-200 ${
      checked ? 'border-navy bg-navy/[0.04]' : 'border-line hover:border-line-strong'
    }`}
  >
    <span
      aria-hidden
      className={`mt-[3px] flex h-[16px] w-[16px] shrink-0 items-center justify-center rounded-full border ${
        checked ? 'border-navy' : 'border-line-strong'
      }`}
    >
      {checked ? <span className="h-[8px] w-[8px] rounded-full bg-navy" /> : null}
    </span>
    <span>
      <span className="block text-[14px] text-ink">{label}</span>
      {description ? <span className="mt-1 block text-[12px] text-slate">{description}</span> : null}
    </span>
    <input type="radio" className="sr-only" checked={checked} onChange={onSelect} />
  </label>
);

export const QuantityStepper = ({
  value,
  onChange,
  max = 10,
  min = 1,
  label,
}: {
  value: number;
  onChange: (next: number) => void;
  max?: number;
  min?: number;
  label: string;
}) => (
  <div className="inline-flex items-center border border-line" role="group" aria-label={label}>
    <button
      type="button"
      onClick={() => onChange(Math.max(min, value - 1))}
      disabled={value <= min}
      aria-label="-"
      className="flex h-11 w-11 items-center justify-center text-navy transition-colors hover:bg-navy/5 disabled:opacity-35"
    >
      <MinusIcon size={16} />
    </button>
    <span className="w-10 text-center text-[15px] tabular-nums text-navy">{value}</span>
    <button
      type="button"
      onClick={() => onChange(Math.min(max, value + 1))}
      disabled={value >= max}
      aria-label="+"
      className="flex h-11 w-11 items-center justify-center text-navy transition-colors hover:bg-navy/5 disabled:opacity-35"
    >
      <PlusIcon size={16} />
    </button>
  </div>
);

export const FormNotice = ({
  tone = 'info',
  children,
}: {
  tone?: 'info' | 'success' | 'error';
  children: ReactNode;
}) => {
  const tones = {
    info: 'border-line bg-paper text-slate',
    success: 'border-champagne/70 bg-champagne/15 text-navy',
    error: 'border-[#B4462F]/40 bg-[#B4462F]/8 text-[#8E3722]',
  };
  return <div className={`border px-4 py-3 text-[14px] ${tones[tone]}`}>{children}</div>;
};
