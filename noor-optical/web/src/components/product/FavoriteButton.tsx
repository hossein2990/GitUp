import { useFavorites } from '../../lib/favorites';
import { useI18n } from '../../lib/i18n';
import { HeartIcon } from '../ui/Icons';
import type { Product, Variant } from '../../lib/types';

export const FavoriteButton = ({
  product,
  variant = null,
  className = '',
  tone = 'light',
}: {
  product: Product;
  variant?: Variant | null;
  className?: string;
  tone?: 'light' | 'dark';
}) => {
  const { t } = useI18n();
  const { has, toggle } = useFavorites();
  const active = has(product.id);
  const label = active ? t('product.removeFromFavorites') : t('product.addToFavorites');

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      aria-pressed={active}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        toggle(product, variant);
      }}
      className={`inline-flex h-9 w-9 items-center justify-center border transition-colors duration-200 ${
        tone === 'dark'
          ? 'border-ivory/35 bg-navy/35 text-ivory hover:border-champagne'
          : 'border-line bg-paper/90 text-navy hover:border-navy'
      } ${active ? 'text-champagne-dark' : ''} ${className}`}
    >
      <HeartIcon size={17} filled={active} />
    </button>
  );
};
