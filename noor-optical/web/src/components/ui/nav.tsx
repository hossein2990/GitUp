import { Link } from 'react-router-dom';
import { ChevronIcon } from './Icons';

export type Crumb = { label: string; to?: string };

export const Breadcrumbs = ({ items }: { items: Crumb[] }) => (
  <nav aria-label="breadcrumb" className="flex flex-wrap items-center gap-2 text-[12px] text-slate">
    {items.map((item, index) => (
      <span key={`${item.label}-${index}`} className="flex items-center gap-2">
        {index > 0 ? <span className="text-line-strong">/</span> : null}
        {item.to ? (
          <Link to={item.to} className="transition-colors hover:text-navy">
            {item.label}
          </Link>
        ) : (
          <span className="text-navy">{item.label}</span>
        )}
      </span>
    ))}
  </nav>
);

export const Pagination = ({
  page,
  totalPages,
  onChange,
  previousLabel,
  nextLabel,
  pageOfLabel,
}: {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
  previousLabel: string;
  nextLabel: string;
  pageOfLabel: string;
}) => {
  if (totalPages <= 1) return null;
  const windowSize = 5;
  const start = Math.max(1, Math.min(page - Math.floor(windowSize / 2), totalPages - windowSize + 1));
  const pages = Array.from({ length: Math.min(windowSize, totalPages) }, (_, index) => start + index);

  return (
    <nav className="mt-12 flex flex-wrap items-center justify-center gap-2" aria-label="pagination">
      <button
        type="button"
        onClick={() => onChange(Math.max(1, page - 1))}
        disabled={page === 1}
        className="flex h-10 items-center gap-1 border border-line px-4 text-[13px] text-navy transition-colors hover:border-navy disabled:opacity-40"
      >
        <ChevronIcon direction="start" size={16} className="flip-rtl" />
        {previousLabel}
      </button>
      {pages.map((entry) => (
        <button
          key={entry}
          type="button"
          onClick={() => onChange(entry)}
          aria-current={entry === page ? 'page' : undefined}
          className={`h-10 w-10 border text-[13px] tabular-nums transition-colors ${
            entry === page
              ? 'border-navy bg-navy text-ivory'
              : 'border-line text-navy hover:border-navy'
          }`}
        >
          {entry}
        </button>
      ))}
      <button
        type="button"
        onClick={() => onChange(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
        className="flex h-10 items-center gap-1 border border-line px-4 text-[13px] text-navy transition-colors hover:border-navy disabled:opacity-40"
      >
        {nextLabel}
        <ChevronIcon direction="end" size={16} className="flip-rtl" />
      </button>
      <span className="sr-only">{pageOfLabel}</span>
    </nav>
  );
};

export const Chip = ({
  label,
  onRemove,
  removeLabel,
}: {
  label: string;
  onRemove: () => void;
  removeLabel: string;
}) => (
  <span className="inline-flex items-center gap-2 border border-line bg-paper px-3 py-1 text-[12px] text-navy">
    {label}
    <button
      type="button"
      onClick={onRemove}
      aria-label={`${removeLabel}: ${label}`}
      className="text-slate transition-colors hover:text-navy"
    >
      ×
    </button>
  </span>
);
