import { Route, Routes } from 'react-router-dom';
import { CATALOG_ROUTES } from './lib/catalog';
import { useI18n } from './lib/i18n';
import { StorefrontLayout } from './components/layout/Layout';
import { AdminLayout } from './components/admin/AdminLayout';
import { AboutPage } from './pages/About';
import { AccountPage } from './pages/Account';
import { AppointmentPage } from './pages/Appointment';
import { LoginPage, RegisterPage } from './pages/Auth';
import { BrandDetailPage, BrandsPage } from './pages/Brands';
import { CartPage } from './pages/Cart';
import { CatalogPage, SearchPage } from './pages/Catalog';
import { CheckoutPage } from './pages/Checkout';
import { ContactPage } from './pages/Contact';
import { FavoritesPage, NotFoundPage } from './pages/Favorites';
import { GuidePage } from './pages/Guide';
import { HomePage } from './pages/Home';
import { OrderConfirmationPage, TrackOrderPage } from './pages/OrderConfirmation';
import { ProductDetailPage } from './pages/ProductDetail';
import { ServiceDetailPage, ServicesPage } from './pages/Services';
import { AdminBrands } from './pages/admin/AdminBrands';
import { AdminCategories } from './pages/admin/AdminCategories';
import { AdminContent } from './pages/admin/AdminContent';
import { AdminCustomers } from './pages/admin/AdminCustomers';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminInbox } from './pages/admin/AdminInbox';
import { AdminOrders } from './pages/admin/AdminOrders';
import { AdminProducts } from './pages/admin/AdminProducts';
import { AdminSettings } from './pages/admin/AdminSettings';

/** A catalogue route: its title, filter and filter family come from one config. */
const CategoryRoute = ({ routeKey }: { routeKey: string }) => {
  const { t, locale } = useI18n();
  const route = CATALOG_ROUTES.find((entry) => entry.key === routeKey);
  if (!route) return <NotFoundPage />;

  return (
    <CatalogPage
      baseQuery={route.category ? { category: route.category } : { family: route.family ?? 'frames' }}
      title={t(route.titleKey)}
      eyebrow={t('search.categories')}
      description={locale === 'fa' ? route.descriptionFa : route.descriptionEn}
      family={route.family ?? 'frames'}
      breadcrumbs={[{ label: t('nav.home'), to: '/' }, { label: t(route.titleKey) }]}
    />
  );
};

const SaleRoute = () => {
  const { t } = useI18n();
  return (
    <CatalogPage
      baseQuery={{ sale: 'true' }}
      title={t('nav.sale')}
      eyebrow={t('search.categories')}
      description={t('cart.deliveryNote')}
      family="all"
      breadcrumbs={[{ label: t('nav.home'), to: '/' }, { label: t('nav.sale') }]}
    />
  );
};

export const App = () => (
  <Routes>
    <Route element={<StorefrontLayout />}>
      <Route index element={<HomePage />} />

      {CATALOG_ROUTES.map((route) => (
        <Route key={route.path} path={route.path} element={<CategoryRoute routeKey={route.key} />} />
      ))}

      <Route path="/sale" element={<SaleRoute />} />
      <Route path="/brands" element={<BrandsPage />} />
      <Route path="/brands/:slug" element={<BrandDetailPage />} />
      <Route path="/search" element={<SearchPage />} />
      <Route path="/product/:slug" element={<ProductDetailPage />} />
      <Route path="/services" element={<ServicesPage />} />
      <Route path="/services/:slug" element={<ServiceDetailPage />} />
      <Route path="/guide/lenses" element={<GuidePage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/appointment" element={<AppointmentPage />} />
      <Route path="/cart" element={<CartPage />} />
      <Route path="/checkout" element={<CheckoutPage />} />
      <Route path="/order/:orderNumber" element={<OrderConfirmationPage />} />
      <Route path="/track-order" element={<TrackOrderPage />} />
      <Route path="/favorites" element={<FavoritesPage />} />
      <Route path="/account" element={<AccountPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Route>

    <Route path="/admin" element={<AdminLayout />}>
      <Route index element={<AdminDashboard />} />
      <Route path="products" element={<AdminProducts />} />
      <Route path="categories" element={<AdminCategories />} />
      <Route path="brands" element={<AdminBrands />} />
      <Route path="orders" element={<AdminOrders />} />
      <Route path="inbox" element={<AdminInbox />} />
      <Route path="customers" element={<AdminCustomers />} />
      <Route path="content" element={<AdminContent />} />
      <Route path="settings" element={<AdminSettings />} />
    </Route>
  </Routes>
);
