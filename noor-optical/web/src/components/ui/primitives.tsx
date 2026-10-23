import type { ButtonHTMLAttributes, MouseEventHandler, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { SpinnerIcon } from './Icons';

type Variant = 'primary' | 'outline' | 'ghost' | 'accent' | 'inverse';
type Size = 'sm' | 'md' | 'lg';

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-navy text-ivory hover:bg-navy-deep border border-navy',
  outline: 'bg-transparent text-navy border border-line-strong hover:border-navy hover:bg-navy/5',
  ghost: 'bg-transparent text-navy border border-transparent hover:bg-navy/5',
  accent: 'bg-champagne text-navy-deep border border-champagne hover:bg-champagne-dark',
  inverse: 'bg-ivory text-navy border border-ivory hover:bg-white',
};

const SIZES: Record<Size, string> = {
  sm: 'h-9 px-4 text-[13px]',
  md: 'h-11 px-6 text-sm',
  lg: 'h-12 px-8 text-sm',
};

type CommonProps = {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  block?: boolean;
  className?: string;
  children: ReactNode;
};

export const Button = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  block = false,
  className = '',
  children,
  ...rest
}: CommonProps & ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button
    {...rest}
    disabled={rest.disabled || loading}
    className={`inline-flex items-center justify-center gap-2 uppercase tracking-wide2 transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-45 ${VARIANTS[variant]} ${SIZES[size]} ${block ? 'w-full' : ''} ${className}`}
  >
    {loading ? <SpinnerIcon size={16} /> : null}
    {children}
  </button>
);

export const LinkButton = ({
  to,
  variant = 'primary',
  size = 'md',
  block = false,
  className = '',
  children,
  onClick,
}: CommonProps & { to: string; onClick?: MouseEventHandler<HTMLAnchorElement> }) => (
  <Link
    to={to}
    onClick={onClick}
    className={`inline-flex items-center justify-center gap-2 uppercase tracking-wide2 transition-colors duration-200 ${VARIANTS[variant]} ${SIZES[size]} ${block ? 'w-full' : ''} ${className}`}
  >
    {children}
  </Link>
);

export const IconButton = ({
  label,
  className = '',
  children,
  ...rest
}: { label: string; className?: string; children: ReactNode } & ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button
    {...rest}
    aria-label={label}
    title={label}
    className={`inline-flex h-10 w-10 items-center justify-center border border-transparent text-navy transition-colors duration-200 hover:border-line-strong hover:bg-navy/5 disabled:opacity-40 ${className}`}
  >
    {children}
  </button>
);

export const Badge = ({
  children,
  tone = 'neutral',
  className = '',
}: {
  children: ReactNode;
  tone?: 'neutral' | 'navy' | 'champagne' | 'muted';
  className?: string;
}) => {
  const tones = {
    navy: 'bg-navy text-ivory',
    champagne: 'bg-champagne/25 text-navy border border-champagne/60',
    neutral: 'bg-paper text-ink border border-line',
    muted: 'bg-navy/5 text-slate',
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-[3px] text-[10px] uppercase tracking-label ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  );
};

export const Spinner = ({ className = '' }: { className?: string }) => (
  <div className={`flex items-center justify-center py-16 text-slate ${className}`}>
    <SpinnerIcon size={26} />
    <span className="sr-only">loading</span>
  </div>
);

export const Skeleton = ({ className = '' }: { className?: string }) => (
  <div className={`animate-pulse bg-navy/[0.06] ${className}`} />
);

export const SectionHeading = ({
  eyebrow,
  title,
  body,
  action,
  align = 'start',
  className = '',
}: {
  eyebrow?: string;
  title: string;
  body?: string;
  action?: ReactNode;
  align?: 'start' | 'center';
  className?: string;
}) => (
  <div
    className={`flex flex-col gap-4 ${
      align === 'center' ? 'items-center text-center' : 'md:flex-row md:items-end md:justify-between'
    } ${className}`}
  >
    <div className={`max-w-2xl ${align === 'center' ? 'mx-auto' : ''}`}>
      {eyebrow ? <p className="label-eyebrow mb-3 text-champagne-dark">{eyebrow}</p> : null}
      <h2 className="text-section text-navy">{title}</h2>
      {body ? <p className="mt-3 text-[15px] leading-relaxed text-slate">{body}</p> : null}
    </div>
    {action ? <div className="shrink-0">{action}</div> : null}
  </div>
);

export const EmptyState = ({
  title,
  body,
  action,
  className = '',
}: {
  title: string;
  body?: string;
  action?: ReactNode;
  className?: string;
}) => (
  <div className={`border border-dashed border-line-strong bg-paper/60 px-6 py-16 text-center ${className}`}>
    <h3 className="text-lg text-navy">{title}</h3>
    {body ? <p className="mx-auto mt-2 max-w-md text-[15px] text-slate">{body}</p> : null}
    {action ? <div className="mt-6 flex justify-center">{action}</div> : null}
  </div>
);

export const PriceBlock = ({
  price,
  salePrice,
  currency,
  locale,
  formatPrice,
  size = 'md',
  className = '',
}: {
  price: number;
  salePrice: number | null;
  currency: string;
  locale: 'fa' | 'en';
  formatPrice: (value: number, locale: 'fa' | 'en', currency?: string) => string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) => {
  const sizes = {
    sm: 'text-[13px]',
    md: 'text-[15px]',
    lg: 'text-xl',
  };
  const hasSale = salePrice !== null && salePrice < price;
  return (
    <div className={`flex flex-wrap items-baseline gap-x-3 gap-y-1 ${className}`}>
      <span className={`${sizes[size]} font-medium text-navy`}>
        {formatPrice(hasSale ? (salePrice as number) : price, locale, currency)}
      </span>
      {hasSale ? (
        <span className={`${sizes.sm} text-slate line-through`}>
          {formatPrice(price, locale, currency)}
        </span>
      ) : null}
    </div>
  );
};
