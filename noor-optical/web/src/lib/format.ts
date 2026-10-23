import type { Locale } from './types';

const CURRENCY_LABELS: Record<string, { fa: string; en: string }> = {
  IRT: { fa: 'تومان', en: 'Toman' },
  IRR: { fa: 'ریال', en: 'Rial' },
  USD: { fa: 'دلار', en: 'USD' },
  EUR: { fa: 'یورو', en: 'EUR' },
};

const numberOf = (value: number, locale: Locale, options?: Intl.NumberFormatOptions) =>
  new Intl.NumberFormat(locale === 'fa' ? 'fa-IR' : 'en-US', options).format(value);

/** Plain grouped number, Persian digits in the Persian interface. */
export const formatNumber = (value: number, locale: Locale) => numberOf(value, locale);

export const formatPrice = (value: number, locale: Locale, currency = 'IRT') => {
  const amount = numberOf(value, locale, { maximumFractionDigits: 0 });
  const label = CURRENCY_LABELS[currency]?.[locale] ?? currency;
  return `${amount} ${label}`;
};

/** Dates are shown on the Persian calendar for the Persian interface. */
export const formatDate = (value: string | Date, locale: Locale, withTime = false) => {
  const date = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat(locale === 'fa' ? 'fa-IR-u-ca-persian' : 'en-GB', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...(withTime ? { hour: '2-digit', minute: '2-digit' } : {}),
  }).format(date);
};

/** Digits only, converted for display (phone numbers, postal codes, SKUs). */
export const formatDigits = (value: string, locale: Locale) => {
  if (locale !== 'fa') return value;
  const persian = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return value.replace(/\d/g, (digit) => persian[Number(digit)]);
};

export const discountedPercent = (price: number, salePrice: number | null) => {
  if (!salePrice || salePrice >= price) return null;
  return Math.round(((price - salePrice) / price) * 100);
};

/** Stock is described by availability, never by a fabricated scarcity count. */
export const availabilityLabelKey = (inStock: boolean) =>
  inStock ? 'product.inStock' : 'product.outOfStock';

export const slugToTitle = (value: string) =>
  value.replace(/-/g, ' ').replace(/\b\w/g, (character) => character.toUpperCase());
