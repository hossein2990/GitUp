import type { MessageKey } from './i18n';
import type { Locale, Product, Variant } from './types';

/** A named catalogue route: path, the filters it applies, and its copy keys. */
export type CatalogRoute = {
  path: string;
  key: string;
  category?: string;
  family?: string;
  titleKey: MessageKey;
  descriptionFa: string;
  descriptionEn: string;
};

/**
 * The eight product categories from the brief, each with its own listing route.
 * Routes carry the filter they apply, so a category link always lands on a
 * pre-filtered, shareable URL.
 */
export const CATALOG_ROUTES: CatalogRoute[] = [
  {
    path: '/eyeglasses',
    key: 'eyeglasses',
    category: 'eyeglasses',
    titleKey: 'nav.eyeglasses',
    descriptionFa: 'فریم‌های آماده نسخه در متریال و فرم‌های مختلف.',
    descriptionEn: 'Prescription-ready frames across materials and shapes.',
  },
  {
    path: '/sunglasses',
    key: 'sunglasses',
    category: 'sunglasses',
    titleKey: 'nav.sunglasses',
    descriptionFa: 'عینک آفتابی با عدسی UV400 و گزینه‌های پولاریزه.',
    descriptionEn: 'Sun frames with UV400 lenses and polarised options.',
  },
  {
    path: '/optical-lenses',
    key: 'lenses',
    family: 'lenses',
    titleKey: 'nav.lenses',
    descriptionFa: 'عدسی تک‌بین، کامپیوتر و چندفوکوس با انتخاب پوشش.',
    descriptionEn: 'Single vision, computer and multifocal lenses with coating choices.',
  },
  {
    path: '/contact-lenses',
    key: 'contacts',
    family: 'contacts',
    titleKey: 'nav.contacts',
    descriptionFa: 'لنزهای تماسی روزانه و ماهانه بر اساس دوره تعویض.',
    descriptionEn: 'Daily and monthly contact lenses by replacement schedule.',
  },
  {
    path: '/computer-glasses',
    key: 'computer',
    category: 'computer-glasses',
    titleKey: 'nav.computer',
    descriptionFa: 'فریم‌های سبک همراه با گزینه عدسی فیلتر نور آبی.',
    descriptionEn: 'Lightweight frames with blue-light filtering lens options.',
  },
  {
    path: '/kids-eyewear',
    key: 'kids',
    category: 'kids-eyewear',
    titleKey: 'nav.kids',
    descriptionFa: 'فریم‌های سبک و انعطاف‌پذیر در سایز کودکان.',
    descriptionEn: 'Light, flexible frames sized for children.',
  },
  {
    path: '/premium-frames',
    key: 'premium',
    category: 'premium-frames',
    titleKey: 'nav.premium',
    descriptionFa: 'استات درجه‌یک، تیتانیوم و پرداخت دستی.',
    descriptionEn: 'High-grade acetate, titanium and hand-finished details.',
  },
  {
    path: '/accessories',
    key: 'accessories',
    category: 'accessories',
    titleKey: 'nav.accessories',
    descriptionFa: 'کاور، دستمال و کیت‌های نگهداری عینک.',
    descriptionEn: 'Cases, cloths and care kits for everyday wear.',
  },
];

export const catalogRouteByCategory = (slug: string | null | undefined) =>
  CATALOG_ROUTES.find((route) => route.category === slug) ?? null;

export const catalogPathForCategory = (slug: string | null | undefined) =>
  catalogRouteByCategory(slug)?.path ?? '/search';

/** Filter groups shown per catalogue family, in display order. */
export const FILTER_GROUP_ORDER: Record<string, string[]> = {
  frames: [
    'brand',
    'shape',
    'material',
    'color',
    'gender',
    'frame_size',
    'lens_color',
    'uv_protection',
    'polarized',
    'prescription',
    'availability',
    'price',
  ],
  lenses: [
    'brand',
    'lens_type',
    'vision_type',
    'lens_material',
    'refractive_index',
    'coating',
    'photochromic',
    'availability',
    'price',
  ],
  contacts: [
    'brand',
    'lens_type',
    'replacement_schedule',
    'pack_size',
    'availability',
    'price',
  ],
  accessories: ['brand', 'availability', 'price'],
  all: ['brand', 'shape', 'material', 'color', 'lens_type', 'availability', 'price'],
};

export const orderFilterGroups = <T extends { key: string }>(groups: T[], family?: string): T[] => {
  const order = FILTER_GROUP_ORDER[family ?? 'all'] ?? FILTER_GROUP_ORDER.all;
  return [...groups].sort((a, b) => {
    const indexA = order.indexOf(a.key);
    const indexB = order.indexOf(b.key);
    return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
  });
};

/** Colour variants own their own imagery when the catalogue provides it. */
export const imagesForVariant = (product: Product, variant: Variant | null) => {
  if (variant && variant.images.length) return variant.images;
  return product.images;
};

/**
 * Alt text always names brand, model and colour so screen-reader users get the
 * same information as the product card.
 */
export const imageAlt = (
  product: Pick<Product, 'nameEn' | 'nameFa'>,
  variant: Variant | null,
  locale: Locale,
  brandName?: string | null,
) => {
  const model = locale === 'fa' ? product.nameFa : product.nameEn;
  const brand = brandName ?? 'NOOR OPTICAL';
  const colour = variant ? (locale === 'fa' ? variant.colorNameFa : variant.colorNameEn) : '';
  return colour ? `${brand} — ${model} (${colour})` : `${brand} — ${model}`;
};

export const priceForVariant = (product: Product, variant: Variant | null) => {
  if (!variant) return { price: product.price, salePrice: product.salePrice };
  const price = variant.price || product.price;
  const salePrice = variant.salePrice ?? null;
  return { price, salePrice };
};

export const VIEW_LABEL_KEYS: Record<string, MessageKey> = {
  front: 'product.viewFront',
  side: 'product.viewSide',
  detail: 'product.viewDetail',
  worn: 'product.viewWorn',
  scene: 'product.viewFront',
};

export const ORDER_STATUS_KEYS: Record<string, MessageKey> = {
  pending: 'order.status.pending',
  confirmed: 'order.status.confirmed',
  preparing: 'order.status.preparing',
  shipped: 'order.status.shipped',
  delivered: 'order.status.delivered',
  cancelled: 'order.status.cancelled',
};

export const PRESCRIPTION_STATUS_KEYS: Record<string, MessageKey> = {
  uploaded: 'order.prescription.uploaded',
  later: 'order.prescription.later',
  not_required: 'order.prescription.not_required',
};

export const timeSlots = ['10-12', '12-14', '14-16', '16-18', '18-20'];
