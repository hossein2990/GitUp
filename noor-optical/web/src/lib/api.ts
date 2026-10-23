import type {
  AdminStats,
  AuthUser,
  Brand,
  Category,
  FacetsResponse,
  Order,
  Product,
  ProductListResponse,
  PublicSettings,
  Service,
} from './types';

export class ApiError extends Error {
  readonly status: number;
  readonly details: unknown;

  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

let authToken: string | null = null;

/** Set by the auth provider so requests can carry the session token. */
export const setAuthToken = (token: string | null) => {
  authToken = token;
};

export const getAuthToken = () => authToken;

type RequestOptions = {
  method?: string;
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined | null>;
  signal?: AbortSignal;
};

const buildQuery = (query?: RequestOptions['query']): string => {
  if (!query) return '';
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === '') continue;
    params.set(key, String(value));
  }
  const serialized = params.toString();
  return serialized ? `?${serialized}` : '';
};

const request = async <T>(path: string, options: RequestOptions = {}): Promise<T> => {
  const headers: Record<string, string> = {};
  if (options.body !== undefined) headers['Content-Type'] = 'application/json';
  if (authToken) headers.Authorization = `Bearer ${authToken}`;

  const response = await fetch(`/api${path}${buildQuery(options.query)}`, {
    method: options.method ?? 'GET',
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
    signal: options.signal,
    credentials: 'same-origin',
  });

  const text = await response.text();
  const payload = text ? (JSON.parse(text) as unknown) : null;

  if (!response.ok) {
    const errorPayload = payload as { error?: { message?: string; details?: unknown } } | null;
    throw new ApiError(
      response.status,
      errorPayload?.error?.message ?? 'Request failed',
      errorPayload?.error?.details,
    );
  }

  return payload as T;
};

export const api = {
  settings: () => request<PublicSettings>('/settings'),

  categories: () => request<{ items: Category[] }>('/categories'),
  category: (slug: string) => request<Category>(`/categories/${slug}`),

  brands: () => request<{ items: Brand[] }>('/brands'),
  brand: (slug: string) => request<Brand>(`/brands/${slug}`),

  products: (query: Record<string, string | number | undefined> = {}) =>
    request<ProductListResponse>('/products', { query }),
  facets: (query: Record<string, string | number | undefined> = {}) =>
    request<FacetsResponse>('/products/facets', { query }),
  product: (slug: string) =>
    request<{ product: Product; related: Product[] }>(`/products/${slug}`),

  search: (query: Record<string, string | number | undefined>) =>
    request<ProductListResponse>('/search', { query }),
  suggest: (term: string) =>
    request<{
      products: Array<{
        slug: string;
        nameEn: string;
        nameFa: string;
        price: number;
        salePrice: number | null;
        currency: string;
        imageUrl: string | null;
        brandName: string | null;
        categoryFa: string | null;
      }>;
      brands: Array<{ slug: string; name: string; nameFa: string | null }>;
      categories: Array<{ slug: string; nameEn: string; nameFa: string }>;
    }>('/search/suggest', { query: { q: term } }),

  services: () => request<{ items: Service[] }>('/services'),
  service: (slug: string) => request<Service>(`/services/${slug}`),

  createOrder: (body: unknown) => request<Order>('/orders', { method: 'POST', body }),
  order: (orderNumber: string, email?: string) =>
    request<Order>(`/orders/${orderNumber}`, { query: { email } }),
  myOrders: () => request<{ items: Order[] }>('/account/orders'),

  register: (body: { email: string; password: string; fullName: string; phone?: string | null }) =>
    request<{ token: string; user: AuthUser }>('/auth/register', { method: 'POST', body }),
  login: (body: { email: string; password: string }) =>
    request<{ token: string; user: AuthUser }>('/auth/login', { method: 'POST', body }),
  me: () => request<{ user: AuthUser }>('/auth/me'),
  updateMe: (body: { fullName?: string | null; phone?: string | null }) =>
    request<{ user: AuthUser }>('/auth/me', { method: 'PATCH', body }),

  createAppointment: (body: unknown) =>
    request<{ reference: string; message: string }>('/appointments', { method: 'POST', body }),
  createContact: (body: unknown) =>
    request<{ reference: string; message: string }>('/contact', { method: 'POST', body }),

  admin: {
    stats: () => request<AdminStats>('/admin/stats'),
    products: (query: { q?: string; page?: number; per_page?: number } = {}) =>
      request<{
        items: Array<{
          id: number;
          slug: string;
          sku: string;
          nameEn: string;
          nameFa: string;
          categoryNameFa: string | null;
          brandName: string | null;
          price: number;
          salePrice: number | null;
          currency: string;
          isActive: boolean;
          isFeatured: boolean;
          isNew: boolean;
          stock: number;
          variantCount: number;
        }>;
        total: number;
        page: number;
        perPage: number;
      }>('/admin/products', { query }),
    product: (id: number) =>
      request<{
        product: {
          id: number;
          slug: string;
          sku: string;
          nameEn: string;
          nameFa: string;
          price: number;
          salePrice: number | null;
          currency: string;
          isActive: boolean;
          isFeatured: boolean;
          isNew: boolean;
        };
        detail: Record<string, unknown>;
        variants: Array<{
          id: number;
          sku: string;
          colorNameEn: string;
          colorNameFa: string;
          colorHex: string | null;
          price: number | null;
          salePrice: number | null;
          stock: number;
        }>;
      }>(`/admin/products/${id}`),
    updateProduct: (id: number, body: Record<string, unknown>) =>
      request<{ ok: boolean }>(`/admin/products/${id}`, { method: 'PATCH', body }),
    updateVariant: (id: number, body: Record<string, unknown>) =>
      request<{ ok: boolean }>(`/admin/variants/${id}`, { method: 'PATCH', body }),
    createProduct: (body: Record<string, unknown>) =>
      request<{ id: number; ok: boolean }>('/admin/products', { method: 'POST', body }),
    deleteProduct: (id: number) =>
      request<{ ok: boolean }>(`/admin/products/${id}`, { method: 'DELETE' }),
    orders: (query: { status?: string; page?: number } = {}) =>
      request<{ items: Order[]; total: number; statuses: string[] }>('/admin/orders', { query }),
    updateOrder: (id: number, status: string) =>
      request<{ ok: boolean }>(`/admin/orders/${id}`, { method: 'PATCH', body: { status } }),
    appointments: () =>
      request<{
        items: Array<{
          id: number;
          fullName: string;
          phone: string;
          email: string | null;
          serviceName: string | null;
          serviceSlug: string | null;
          preferredDate: string | null;
          preferredTime: string | null;
          notes: string | null;
          status: string;
          createdAt: string;
        }>;
      }>('/admin/appointments'),
    updateAppointment: (id: number, status: string) =>
      request<{ ok: boolean }>(`/admin/appointments/${id}`, { method: 'PATCH', body: { status } }),
    messages: () =>
      request<{
        items: Array<{
          id: number;
          fullName: string;
          email: string;
          phone: string | null;
          subject: string | null;
          message: string;
          status: string;
          createdAt: string;
        }>;
      }>('/admin/messages'),
    updateMessage: (id: number, status: string) =>
      request<{ ok: boolean }>(`/admin/messages/${id}`, { method: 'PATCH', body: { status } }),
    settings: () => request<PublicSettings>('/admin/settings'),
    updateSettings: (body: Record<string, unknown>) =>
      request<PublicSettings>('/admin/settings', { method: 'PUT', body }),
    services: () =>
      request<{
        items: Array<{
          id: number;
          slug: string;
          nameEn: string;
          nameFa: string;
          summaryEn: string | null;
          summaryFa: string | null;
          priceFrom: number | null;
          durationFa: string | null;
          isActive: boolean;
        }>;
      }>('/admin/services'),
    updateService: (id: number, body: Record<string, unknown>) =>
      request<{ ok: boolean }>(`/admin/services/${id}`, { method: 'PATCH', body }),
    createService: (body: Record<string, unknown>) =>
      request<{ id: number; ok: boolean }>('/admin/services', { method: 'POST', body }),
    deleteService: (id: number) =>
      request<{ ok: boolean }>(`/admin/services/${id}`, { method: 'DELETE' }),
    categories: () =>
      request<{
        items: Array<{
          id: number;
          slug: string;
          family: string;
          nameEn: string;
          nameFa: string;
          taglineEn: string | null;
          taglineFa: string | null;
          descriptionEn: string | null;
          descriptionFa: string | null;
          imageUrl: string | null;
          sortOrder: number;
          isActive: boolean;
        }>;
      }>('/admin/categories'),
    createCategory: (body: Record<string, unknown>) =>
      request<{ id: number; ok: boolean }>('/admin/categories', { method: 'POST', body }),
    updateCategory: (id: number, body: Record<string, unknown>) =>
      request<{ ok: boolean }>(`/admin/categories/${id}`, { method: 'PATCH', body }),
    deleteCategory: (id: number) =>
      request<{ ok: boolean }>(`/admin/categories/${id}`, { method: 'DELETE' }),
    brands: () =>
      request<{
        items: Array<{
          id: number;
          slug: string;
          name: string;
          nameFa: string | null;
          country: string | null;
          descriptionEn: string | null;
          descriptionFa: string | null;
          imageUrl: string | null;
          sortOrder: number;
          isActive: boolean;
        }>;
      }>('/admin/brands'),
    createBrand: (body: Record<string, unknown>) =>
      request<{ id: number; ok: boolean }>('/admin/brands', { method: 'POST', body }),
    updateBrand: (id: number, body: Record<string, unknown>) =>
      request<{ ok: boolean }>(`/admin/brands/${id}`, { method: 'PATCH', body }),
    deleteBrand: (id: number) =>
      request<{ ok: boolean }>(`/admin/brands/${id}`, { method: 'DELETE' }),
    customers: () =>
      request<{
        items: Array<{
          id: number;
          email: string;
          fullName: string | null;
          phone: string | null;
          orderCount: number;
          lifetimeValue: number;
          createdAt: string;
        }>;
      }>('/admin/customers'),
  },
};
