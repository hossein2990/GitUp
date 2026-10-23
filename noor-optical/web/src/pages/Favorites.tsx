import { Link } from 'react-router-dom';
import { useFavorites } from '../lib/favorites';
import { formatPrice } from '../lib/format';
import { useI18n } from '../lib/i18n';
import { Breadcrumbs } from '../components/ui/nav';
import { EmptyState, LinkButton } from '../components/ui/primitives';
import { TrashIcon } from '../components/ui/Icons';

export const FavoritesPage = () => {
  const { t, pick, locale } = useI18n();
  const { entries, remove } = useFavorites();

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-12 md:px-8 md:py-16">
      <Breadcrumbs items={[{ label: t('nav.home'), to: '/' }, { label: t('action.favorites') }]} />
      <h1 className="mt-6 text-display text-navy">{t('favorites.title')}</h1>

      {entries.length === 0 ? (
        <EmptyState
          className="mt-10"
          title={t('favorites.empty')}
          body={t('favorites.emptyBody')}
          action={
            <LinkButton to="/eyeglasses" size="sm">
              {t('nav.eyeglasses')}
            </LinkButton>
          }
        />
      ) : (
        <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {entries.map((entry) => (
            <li key={entry.productId} className="flex flex-col border border-line bg-paper">
              <Link to={`/product/${entry.slug}`} className="block aspect-[4/5] overflow-hidden hover-focal">
                {entry.imageUrl ? (
                  <img
                    src={entry.imageUrl}
                    alt={pick(entry.nameFa, entry.nameEn)}
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="block h-full w-full bg-navy/[0.06]" />
                )}
              </Link>
              <div className="flex flex-1 flex-col p-4">
                <p className="label-eyebrow text-slate">{entry.brandName}</p>
                <Link to={`/product/${entry.slug}`} className="mt-2 text-[15px] text-navy transition-colors hover:text-champagne-dark">
                  {pick(entry.nameFa, entry.nameEn)}
                </Link>
                <div className="mt-auto flex items-center justify-between gap-3 pt-4">
                  <span className="text-[14px] text-navy">
                    {formatPrice(entry.salePrice ?? entry.price, locale, entry.currency)}
                  </span>
                  <button
                    type="button"
                    onClick={() => remove(entry.productId)}
                    aria-label={t('action.remove')}
                    className="text-slate transition-colors hover:text-navy"
                  >
                    <TrashIcon size={17} />
                  </button>
                </div>
                <span className={`mt-2 text-[11px] uppercase tracking-label ${entry.inStock ? 'text-slate' : 'text-[#8E3722]'}`}>
                  {entry.inStock ? t('common.inStock') : t('common.outOfStock')}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export const NotFoundPage = () => {
  const { t } = useI18n();
  return (
    <div className="mx-auto max-w-3xl px-4 py-24 md:px-8">
      <EmptyState
        title={t('common.pageNotFound')}
        body={t('common.pageNotFoundBody')}
        action={
          <div className="flex flex-wrap justify-center gap-3">
            <LinkButton to="/" size="sm">
              {t('action.backHome')}
            </LinkButton>
            <LinkButton to="/search" size="sm" variant="outline">
              {t('action.search')}
            </LinkButton>
          </div>
        }
      />
    </div>
  );
};
