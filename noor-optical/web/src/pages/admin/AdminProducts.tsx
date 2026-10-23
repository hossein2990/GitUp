import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { formatDate, formatNumber, formatPrice } from '../../lib/format';
import { useDebounced } from '../../lib/hooks';
import { useI18n } from '../../lib/i18n';
import { Field, Input } from '../../components/ui/form';
import { Button, EmptyState, Skeleton } from '../../components/ui/primitives';

type AdminProduct = Awaited<ReturnType<typeof api.admin.products>>['items'][number];
type Variant = Awaited<ReturnType<typeof api.admin.product>>['variants'][number];

/**
 * Catalogue management: search, inline price editing, availability flags, and
 * per-variant stock — the fields a shop actually changes day to day.
 */
export const AdminProducts = () => {
  const { t, pick, locale } = useI18n();
  const [term, setTerm] = useState('');
  const debounced = useDebounced(term, 350);
  const [page, setPage] = useState(1);
  const [data, setData] = useState<{ items: AdminProduct[]; total: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<{ product: AdminProduct; variants: Variant[] } | null>(null);
  const [creating, setCreating] = useState(false);
  const [savedNote, setSavedNote] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.admin.products({ q: debounced, page, per_page: 20 });
      setData({ items: result.items, total: result.total });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : t('common.errorBody'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced, page]);

  const openEditor = async (product: AdminProduct) => {
    try {
      const result = await api.admin.product(product.id);
      setEditing({ product, variants: result.variants });
    } catch {
      setError(t('common.errorBody'));
    }
  };

  const patchProduct = async (product: AdminProduct, body: Record<string, unknown>) => {
    await api.admin.updateProduct(product.id, body);
    setSavedNote(true);
    window.setTimeout(() => setSavedNote(false), 1800);
    await load();
  };

  const patchVariant = async (variant: Variant, body: Record<string, unknown>) => {
    await api.admin.updateVariant(variant.id, body);
    setSavedNote(true);
    window.setTimeout(() => setSavedNote(false), 1800);
    if (editing) {
      const refreshed = await api.admin.product(editing.product.id);
      setEditing({ product: editing.product, variants: refreshed.variants });
    }
    await load();
  };

  const deleteProduct = async (product: AdminProduct) => {
    if (!window.confirm(t('admin.deleteConfirm'))) return;
    await api.admin.deleteProduct(product.id);
    await load();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <Field label={t('admin.searchProducts')} htmlFor="admin-product-search" className="w-full max-w-sm">
          <Input
            id="admin-product-search"
            value={term}
            onChange={(event) => {
              setTerm(event.target.value);
              setPage(1);
            }}
          />
        </Field>
        <div className="flex items-center gap-3 text-[13px] text-slate">
          {savedNote ? <span className="text-champagne-dark">{t('admin.savedNote')}</span> : null}
          <span>{t('common.results', { count: formatNumber(data?.total ?? 0, locale) })}</span>
          <Button size="sm" onClick={() => setCreating(true)}>{t('admin.createNew')}</Button>
        </div>
      </div>

      {creating ? (
        <CreateProductForm
          onCancel={() => setCreating(false)}
          onCreated={async () => { setCreating(false); await load(); }}
        />
      ) : null}

      {loading ? <Skeleton className="h-72 w-full" /> : null}
      {error ? <p className="text-[14px] text-[#8E3722]">{error}</p> : null}

      {!loading && data ? (
        <div className="overflow-x-auto border border-line bg-paper">
          <table className="w-full min-w-[900px] text-start text-[13px]">
            <thead className="border-b border-line bg-ivory text-[11px] uppercase tracking-label text-slate">
              <tr>
                <th className="p-3 text-start">{t('admin.products')}</th>
                <th className="p-3 text-start">{t('filter.brand')}</th>
                <th className="p-3 text-start">{t('admin.price')}</th>
                <th className="p-3 text-start">{t('admin.stock')}</th>
                <th className="p-3 text-start">{t('admin.active')}</th>
                <th className="p-3 text-start">{t('admin.variants')}</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {data.items.map((product) => (
                <tr key={product.id} className="align-middle">
                  <td className="p-3">
                    <p className="text-navy">{pick(product.nameFa, product.nameEn)}</p>
                    <p className="mt-1 text-[11px] text-slate">
                      {product.sku} · {product.categoryNameFa}
                    </p>
                  </td>
                  <td className="p-3 text-slate">{product.brandName}</td>
                  <td className="p-3">
                    <input
                      type="number"
                      defaultValue={product.price}
                      onBlur={(event) => {
                        const value = Number(event.target.value);
                        if (value && value !== product.price) void patchProduct(product, { price: value });
                      }}
                      className="w-28 border border-line bg-ivory px-2 py-1 text-[13px] text-navy focus:border-navy focus:outline-none"
                    />
                    <p className="mt-1 text-[11px] text-slate">
                      {formatPrice(product.price, locale, product.currency)}
                    </p>
                  </td>
                  <td className="p-3 text-slate">{formatNumber(product.stock, locale)}</td>
                  <td className="p-3">
                    <label className="flex items-center gap-2 text-slate">
                      <input
                        type="checkbox"
                        checked={product.isActive}
                        onChange={(event) => void patchProduct(product, { isActive: event.target.checked })}
                      />
                      {product.isActive ? t('admin.active') : t('admin.inactive')}
                    </label>
                    <label className="mt-2 flex items-center gap-2 text-slate">
                      <input
                        type="checkbox"
                        checked={product.isFeatured}
                        onChange={(event) => void patchProduct(product, { isFeatured: event.target.checked })}
                      />
                      {t('admin.featuredFlag')}
                    </label>
                  </td>
                  <td className="p-3">
                    <Button size="sm" variant="outline" onClick={() => void openEditor(product)}>
                      {t('admin.variants')} ({product.variantCount})
                    </Button>
                  </td>
                  <td className="p-3">
                    <Button size="sm" variant="ghost" onClick={() => void deleteProduct(product)}>{t('action.remove')}</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {!loading && data && data.items.length === 0 ? (
        <EmptyState title={t('common.noResults')} />
      ) : null}

      {data && data.total > 20 ? (
        <div className="flex items-center justify-center gap-3">
          <Button size="sm" variant="outline" disabled={page === 1} onClick={() => setPage((value) => value - 1)}>
            {t('action.previous')}
          </Button>
          <span className="text-[13px] text-slate">
            {t('common.pageOf', { page, total: Math.ceil(data.total / 20) })}
          </span>
          <Button
            size="sm"
            variant="outline"
            disabled={page >= Math.ceil(data.total / 20)}
            onClick={() => setPage((value) => value + 1)}
          >
            {t('action.next')}
          </Button>
        </div>
      ) : null}

      {editing ? (
        <div className="border border-navy bg-paper p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-[15px] text-navy">
              {pick(editing.product.nameFa, editing.product.nameEn)} — {t('admin.variants')}
            </h2>
            <Button size="sm" variant="ghost" onClick={() => setEditing(null)}>
              {t('action.close')}
            </Button>
          </div>
          <ul className="mt-5 divide-y divide-line">
            {editing.variants.map((variant) => (
              <li key={variant.id} className="flex flex-wrap items-end gap-5 py-4">
                <span className="flex items-center gap-3">
                  <span
                    className="h-6 w-6 rounded-full border border-line-strong"
                    style={{ backgroundColor: variant.colorHex ?? 'transparent' }}
                  />
                  <span className="text-[13px] text-navy">
                    {pick(variant.colorNameFa, variant.colorNameEn)}
                    <span className="block text-[11px] text-slate">{variant.sku}</span>
                  </span>
                </span>
                <Field label={t('admin.price')} className="w-32">
                  <Input
                    type="number"
                    defaultValue={variant.price ?? ''}
                    onBlur={(event) => {
                      const value = event.target.value === '' ? null : Number(event.target.value);
                      void patchVariant(variant, { price: value });
                    }}
                  />
                </Field>
                <Field label={t('admin.stock')} className="w-28">
                  <Input
                    type="number"
                    defaultValue={variant.stock}
                    onBlur={(event) => void patchVariant(variant, { stock: Number(event.target.value) })}
                  />
                </Field>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <p className="text-[12px] text-slate">
        {t('footer.demoNote')} · {formatDate(new Date(), locale)}
      </p>
    </div>
  );
};

const CreateProductForm = ({ onCancel, onCreated }: { onCancel: () => void; onCreated: () => void }) => {
  const { t } = useI18n();
  const [form, setForm] = useState({ slug: '', sku: '', nameEn: '', nameFa: '', price: 0 });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setSaving(true);
    setError(null);
    try {
      await api.admin.createProduct(form);
      onCreated();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : t('common.errorBody'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="border border-navy bg-paper p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-[15px] text-navy">{t('admin.createNew')}</h2>
        <Button size="sm" variant="ghost" onClick={onCancel}>{t('action.cancel')}</Button>
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Field label={t('admin.slug')}><Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} /></Field>
        <Field label="SKU"><Input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} /></Field>
        <Field label={t('admin.nameEn')}><Input value={form.nameEn} onChange={(e) => setForm({ ...form, nameEn: e.target.value })} /></Field>
        <Field label={t('admin.nameFa')}><Input value={form.nameFa} onChange={(e) => setForm({ ...form, nameFa: e.target.value })} /></Field>
        <Field label={t('admin.price')}><Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} /></Field>
      </div>
      {error ? <p className="mt-3 text-[13px] text-[#8E3722]">{error}</p> : null}
      <Button className="mt-4" onClick={submit} loading={saving}>{t('action.save')}</Button>
    </div>
  );
};
