import { NavLink, Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../lib/auth';
import { useI18n, type MessageKey } from '../../lib/i18n';
import { Button, EmptyState } from '../ui/primitives';

const LINKS: Array<{ to: string; key: MessageKey; end?: boolean }> = [
  { to: '/admin', key: 'admin.dashboard', end: true },
  { to: '/admin/products', key: 'admin.products' },
  { to: '/admin/orders', key: 'admin.orders' },
  { to: '/admin/inbox', key: 'admin.appointments' },
  { to: '/admin/customers', key: 'admin.customers' },
  { to: '/admin/settings', key: 'admin.settings' },
];

/** Staff-only shell. Customers, and visitors without a session, are kept out. */
export const AdminLayout = () => {
  const { t } = useI18n();
  const { user, ready, isStaff, signOut } = useAuth();
  const location = useLocation();

  if (!ready) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-24 text-center md:px-8">
        <p className="text-[15px] text-slate">{t('common.loading')}</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (!isStaff) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 md:px-8">
        <EmptyState
          title={t('admin.noAccess')}
          body={t('account.guestBody')}
          action={
            <Button variant="outline" size="sm" onClick={signOut}>
              {t('action.logout')}
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ivory">
      <div className="border-b border-line bg-navy text-ivory">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-4 px-4 py-4 md:px-8">
          <div>
            <p className="label-eyebrow text-champagne">{t('admin.title')}</p>
            <p className="mt-1 text-[15px]">{user.email}</p>
          </div>
          <div className="flex items-center gap-3">
            <NavLink to="/" className="text-[12px] uppercase tracking-label text-ivory/75 transition-colors hover:text-champagne">
              {t('nav.home')}
            </NavLink>
            <button
              type="button"
              onClick={signOut}
              className="border border-ivory/30 px-3 py-2 text-[12px] uppercase tracking-label transition-colors hover:border-champagne hover:text-champagne"
            >
              {t('action.logout')}
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-[1600px] gap-8 px-4 py-8 md:px-8 lg:grid-cols-[220px_1fr]">
        <nav aria-label={t('admin.title')} className="flex gap-2 overflow-x-auto lg:flex-col">
          {LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `whitespace-nowrap border px-4 py-3 text-[13px] transition-colors ${
                  isActive
                    ? 'border-navy bg-navy text-ivory'
                    : 'border-line bg-paper text-navy hover:border-navy'
                }`
              }
            >
              {t(link.key)}
            </NavLink>
          ))}
        </nav>
        <main className="min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
