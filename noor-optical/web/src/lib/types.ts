/**
 * Shape of the data returned by the NOOR OPTICAL API. Kept hand-written and
 * small rather than generated, so the contract stays readable.
 */

export type Locale = 'fa' | 'en';

export type ImageRef = { url: string; view?: 'front' | 'side' | 'detail' | 'worn' | 'scene' };

export type Variant = {
  id: number;
  colorNameEn: string;
  colorNameFa: string;
  colorHex: string | null;
  sku: string;
  price: number;
  salePrice: number | null;
  stock: number;
  inStock: boolean;
  images: ImageRef[];
};

export type Brand = {
  slug: string;
  name: string;
  nameFa: string | null;
  country: string | null;
  descriptionEn: string | null;
  descriptionFa: string | null;
  imageUrl: string | null;
  productCount?: number;
};

export type Category = {
  slug: string;
  family: 'frames' | 'lenses' | 'contacts' | 'accessories' | string;
  nameEn: string;
  nameFa: string;
  taglineEn: string | null;
  taglineFa: string | null;
  descriptionEn: string | null;
  descriptionFa: string | null;
  imageUrl: string | null;
};

export type Product = {
  id: number;
  slug: string;
  sku: string;
  nameEn: string;
  nameFa: string;
  summaryEn: string | null;
  summaryFa: string | null;
  descriptionEn: string | null;
  descriptionFa: string | null;
  brand: Brand | null;
  category: { slug: string; family: string; nameEn: string; nameFa: string } | null;
  price: number;
  salePrice: number | null;
  effectivePrice: number;
  currency: string;
  gender: string | null;
  shape: string | null;
  material: string | null;
  frameSize: string | null;
  lensColor: string | null;
  uvProtection: string | null;
  polarized: boolean;
  prescriptionCompatible: boolean;
  specs: Record<string, string>;
  images: ImageRef[];
  includedAccessories: string[];
  warrantyEn: string | null;
  warrantyFa: string | null;
  isFeatured: boolean;
  isNew: boolean;
  stock: number;
  inStock: boolean;
  createdAt: string;
  variants: Variant[];
};

export type ProductListResponse = {
  items: Product[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
  query?: string;
};

export type FacetOption = { value: string; label: string; labelFa?: string | null; count: number };

export type FacetGroup =
  | { key: string; type: 'list'; options: FacetOption[] }
  | { key: 'price'; type: 'range'; min: number; max: number };

export type FacetsResponse = { groups: FacetGroup[] };

export type OrderItem = {
  id: number;
  productId: number | null;
  variantId: number | null;
  slug: string | null;
  nameEn: string;
  nameFa: string;
  brandName: string | null;
  colorNameEn: string | null;
  colorNameFa: string | null;
  imageUrl: string | null;
  sku: string | null;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
};

export type Order = {
  id?: number;
  orderNumber: string;
  status: string;
  prescriptionStatus: string;
  deliveryMethod: string;
  subtotal: number;
  shipping: number;
  total: number;
  currency: string;
  note: string | null;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  address: string | null;
  city: string | null;
  postalCode: string | null;
  createdAt: string;
  items: OrderItem[];
};

export type Service = {
  slug: string;
  nameEn: string;
  nameFa: string;
  summaryEn: string | null;
  summaryFa: string | null;
  descriptionEn: string | null;
  descriptionFa: string | null;
  durationEn: string | null;
  durationFa: string | null;
  priceFrom: number | null;
  imageUrl: string | null;
};

export type PublicSettings = {
  brand: { nameEn: string; nameFa: string; tagline_en: string; tagline_fa: string };
  announcement: { enabled: boolean; textEn: string; textFa: string; href: string | null };
  contact: {
    phone: string;
    whatsapp: string | null;
    email: string;
    addressEn: string;
    addressFa: string;
    hoursEn: string;
    hoursFa: string;
    instagram: string | null;
    mapUrl: string | null;
  };
  commerce: {
    currency: string;
    shippingFlat: number;
    freeShippingThreshold: number | null;
    codEnabled: boolean;
    deliveryDaysEn: string;
    deliveryDaysFa: string;
    returnsEn: string;
    returnsFa: string;
  };
  hero: { headlineEn: string; headlineFa: string; bodyEn: string; bodyFa: string; imageUrl: string };
  trust: Array<{ titleEn: string; titleFa: string; bodyEn: string; bodyFa: string }>;
};

export type AuthUser = {
  id: number;
  email: string;
  fullName: string | null;
  role: 'customer' | 'admin';
};

export type CartLine = {
  productId: number;
  slug: string;
  nameEn: string;
  nameFa: string;
  brandName: string | null;
  variantId: number | null;
  colorNameEn: string | null;
  colorNameFa: string | null;
  colorHex: string | null;
  sku: string | null;
  unitPrice: number;
  imageUrl: string | null;
  currency: string;
  quantity: number;
};

export type AdminStats = {
  totals: {
    activeProducts: number;
    totalProducts: number;
    outOfStockVariants: number;
    totalOrders: number;
    pendingOrders: number;
    revenue: number;
    newAppointments: number;
    newMessages: number;
    customers: number;
  };
  recentOrders: Order[];
};
