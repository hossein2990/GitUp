import { useEffect, useRef, type ReactNode } from 'react';
import { useBodyScrollLock, useEscapeKey } from '../../lib/hooks';
import { CloseIcon } from './Icons';
import { IconButton } from './primitives';

/** Centered modal: Escape and backdrop click close it, focus moves inside. */
export const Modal = ({
  open,
  onClose,
  title,
  children,
  size = 'md',
  closeLabel,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: 'md' | 'lg' | 'full';
  closeLabel: string;
}) => {
  const panelRef = useRef<HTMLDivElement | null>(null);
  useBodyScrollLock(open);
  useEscapeKey(open, onClose);

  useEffect(() => {
    if (!open) return;
    const focusable = panelRef.current?.querySelector<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    focusable?.focus();
  }, [open]);

  if (!open) return null;

  const sizes = {
    md: 'max-w-xl',
    lg: 'max-w-4xl',
    full: 'max-w-[92vw]',
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-0 md:p-6" role="dialog" aria-modal="true" aria-label={title}>
      <button
        type="button"
        aria-label={closeLabel}
        onClick={onClose}
        className="absolute inset-0 h-full w-full cursor-default bg-navy/45 animate-fade"
      />
      <div
        ref={panelRef}
        className={`relative z-10 flex max-h-[92vh] w-full flex-col overflow-hidden border border-line bg-ivory shadow-panel animate-rise ${sizes[size]}`}
      >
        <div className="flex items-center justify-between gap-4 border-b border-line px-5 py-4">
          <h2 className="text-[15px] uppercase tracking-label text-navy">{title}</h2>
          <IconButton label={closeLabel} onClick={onClose}>
            <CloseIcon size={18} />
          </IconButton>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};

/**
 * Slide-out panel anchored to the inline-end edge, so it enters from the left in
 * Persian (RTL) and from the right in English without a separate layout.
 */
export const Drawer = ({
  open,
  onClose,
  title,
  children,
  footer,
  side = 'end',
  width = 'md',
  closeLabel,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  side?: 'end' | 'start';
  width?: 'sm' | 'md' | 'lg';
  closeLabel: string;
}) => {
  const panelRef = useRef<HTMLDivElement | null>(null);
  useBodyScrollLock(open);
  useEscapeKey(open, onClose);

  useEffect(() => {
    if (!open) return;
    const focusable = panelRef.current?.querySelector<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    focusable?.focus();
  }, [open]);

  if (!open) return null;

  const widths = { sm: 'md:w-[380px]', md: 'md:w-[460px]', lg: 'md:w-[620px]' };

  return (
    <div className="fixed inset-0 z-[65]" role="dialog" aria-modal="true" aria-label={title}>
      <button
        type="button"
        aria-label={closeLabel}
        onClick={onClose}
        className="absolute inset-0 h-full w-full cursor-default bg-navy/45 animate-fade"
      />
      <div
        ref={panelRef}
        style={{ [side === 'end' ? 'insetInlineEnd' : 'insetInlineStart']: 0 } as never}
        className={`absolute top-0 flex h-full w-full flex-col border border-line bg-ivory shadow-panel animate-slideIn ${widths[width]}`}
      >
        <div className="flex items-center justify-between gap-4 border-b border-line px-5 py-4">
          <h2 className="text-[15px] uppercase tracking-label text-navy">{title}</h2>
          <IconButton label={closeLabel} onClick={onClose}>
            <CloseIcon size={18} />
          </IconButton>
        </div>
        <div ref={panelRef} className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
          {children}
        </div>
        {footer ? <div className="border-t border-line bg-paper px-5 py-5">{footer}</div> : null}
      </div>
    </div>
  );
};

export const Accordion = ({
  title,
  children,
  open,
  onToggle,
}: {
  title: string;
  children: ReactNode;
  open: boolean;
  onToggle: () => void;
}) => (
  <div className="border-b border-line">
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={open}
      className="flex w-full items-center justify-between gap-4 py-4 text-start text-[15px] text-navy transition-colors hover:text-champagne-dark"
    >
      <span>{title}</span>
      <span aria-hidden className="relative h-[12px] w-[12px]">
        <span className="absolute inset-x-0 top-1/2 h-[1.5px] -translate-y-1/2 bg-current" />
        <span
          className={`absolute inset-y-0 start-1/2 w-[1.5px] -translate-x-1/2 bg-current transition-transform duration-300 ${
            open ? 'scale-y-0' : 'scale-y-100'
          }`}
        />
      </span>
    </button>
    {open ? <div className="pb-5 text-[15px] leading-relaxed text-slate animate-fade">{children}</div> : null}
  </div>
);
