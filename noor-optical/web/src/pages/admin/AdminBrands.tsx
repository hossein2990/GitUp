import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { useI18n } from '../../lib/i18n';
import { Field, Input, Textarea } from '../../components/ui/form';
import { Button, EmptyState, Skeleton } from '../../components/ui/primitives';

type Brand = Awaited<ReturnType<typeof api.admin.brands>>['items'][number];

export const AdminBrands = () => {
  const { t } = useI18n();
  const [items, setItems] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Brand | null>(null);
  const [creating, setCreating] = useState(false);
  const [savedNote, setSavedNote] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.admin.brands();
      setItems(result.items);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : t('common.errorBody'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const flashSaved = () => { setSavedNote(true); window.setTimeout(() => setSavedNote(false), 1800); };

  const patchBrand = async (id: number, body: Record<string, unknown>) => {
    await api.admin.updateBrand(id, body);
    flashSaved();
    await load();
  };

  const deleteBrand = async (id: number) => {
    if (!window.confirm(t('admin.deleteConfirm'))) return;
    await api.admin.deleteBrand(id);
    await load();
  };

  if (loading) return <Skeleton className="h-72 w-full" />;
  if (error) return <EmptyState title={t('common.errorTitle')} body={error} action={<Button variant="outline" size="sm" onClick={() => void load()}>{t('action.retry')}</Button>} />;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-[15px] uppercase tracking-label text-navy">{t('admin.brands')}</h1>
        <div className="flex items-center gap-3">
          {savedNote ? <span className="text-[13px] text-champagne-dark">{t('admin.savedNote')}</span> : null}
          <Button size="sm" onClick={() => setCreating(true)}>{t('admin.createNew')}</Button>
        </div>
      </div>

      {creating ? (
        <CreateBrandForm onCancel={() => setCreating(false)} onCreated={async () => { setCreating(false); await load(); }} />
      ) : null}

      {editing ? (
        <EditBrandForm brand={editing} onCancel={() => setEditing(null)} onSaved={async () => { setEditing(null); await load(); }} />
      ) : null}

      <div className="overflow-x-auto border border-line bg-paper">
        <table className="w-full min-w-[700px] text-[13px]">
          <thead className="border-b border-line bg-ivory text-[11px] uppercase tracking-label text-slate">
            <tr>
              <th className="p-3 text-start">{t('admin.nameEn')}</th>
              <th className="p-3 text-start">{t('admin.slug')}</th>
              <th className="p-3 text-start">{t('admin.country')}</th>
              <th className="p-3 text-start">{t('admin.active')}</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {items.map((brand) => (
              <tr key={brand.id}>
                <td className="p-3 text-navy">{brand.name}</td>
                <td className="p-3 text-slate">{brand.slug}</td>
                <td className="p-3 text-slate">{brand.country ?? '—'}</td>
                <td className="p-3">
                  <label className="flex items-center gap-2 text-slate">
                    <input type="checkbox" checked={brand.isActive} onChange={(e) => void patchBrand(brand.id, { isActive: e.target.checked })} />
                    {brand.isActive ? t('admin.active') : t('admin.inactive')}
                  </label>
                </td>
                <td className="p-3">
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => setEditing(brand)}>{t('action.learnMore')}</Button>
                    <Button size="sm" variant="ghost" onClick={() => void deleteBrand(brand.id)}>{t('action.remove')}</Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {items.length === 0 ? <EmptyState title={t('common.noResults')} /> : null}
    </div>
  );
};

const CreateBrandForm = ({ onCancel, onCreated }: { onCancel: () => void; onCreated: () => void }) => {
  const { t } = useI18n();
  const [form, setForm] = useState({ slug: '', name: '', nameFa: '', country: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setSaving(true); setError(null);
    try { await api.admin.createBrand(form); onCreated(); }
    catch (cause) { setError(cause instanceof Error ? cause.message : t('common.errorBody')); }
    finally { setSaving(false); }
  };

  return (
    <div className="border border-navy bg-paper p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-[15px] text-navy">{t('admin.createNew')}</h2>
        <Button size="sm" variant="ghost" onClick={onCancel}>{t('action.cancel')}</Button>
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Field label={t('admin.slug')}><Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} /></Field>
        <Field label={t('admin.nameEn')}><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
        <Field label={t('admin.nameFa')}><Input value={form.nameFa} onChange={(e) => setForm({ ...form, nameFa: e.target.value })} /></Field>
        <Field label={t('admin.country')}><Input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} /></Field>
      </div>
      {error ? <p className="mt-3 text-[13px] text-[#8E3722]">{error}</p> : null}
      <Button className="mt-4" onClick={submit} loading={saving}>{t('action.save')}</Button>
    </div>
  );
};

const EditBrandForm = ({ brand, onCancel, onSaved }: { brand: Brand; onCancel: () => void; onSaved: () => void }) => {
  const { t } = useI18n();
  const [form, setForm] = useState({
    name: brand.name,
    slug: brand.slug,
    nameFa: brand.nameFa ?? '',
    country: brand.country ?? '',
    descriptionEn: brand.descriptionEn ?? '',
    descriptionFa: brand.descriptionFa ?? '',
    imageUrl: brand.imageUrl ?? '',
    sortOrder: brand.sortOrder,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setSaving(true); setError(null);
    try { await api.admin.updateBrand(brand.id, form); onSaved(); }
    catch (cause) { setError(cause instanceof Error ? cause.message : t('common.errorBody')); }
    finally { setSaving(false); }
  };

  return (
    <div className="border border-navy bg-paper p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-[15px] text-navy">{brand.name}</h2>
        <Button size="sm" variant="ghost" onClick={onCancel}>{t('action.close')}</Button>
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Field label={t('admin.nameEn')}><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
        <Field label={t('admin.nameFa')}><Input value={form.nameFa} onChange={(e) => setForm({ ...form, nameFa: e.target.value })} /></Field>
        <Field label={t('admin.slug')}><Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} /></Field>
        <Field label={t('admin.country')}><Input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} /></Field>
        <Field label={`${t('admin.description')} (EN)`}><Textarea value={form.descriptionEn} onChange={(e) => setForm({ ...form, descriptionEn: e.target.value })} /></Field>
        <Field label={`${t('admin.description')} (FA)`}><Textarea value={form.descriptionFa} onChange={(e) => setForm({ ...form, descriptionFa: e.target.value })} /></Field>
        <Field label={t('admin.imageUrl')} className="sm:col-span-2"><Input value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} /></Field>
        <Field label={t('admin.sortOrder')}><Input type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })} /></Field>
      </div>
      {error ? <p className="mt-3 text-[13px] text-[#8E3722]">{error}</p> : null}
      <Button className="mt-4" onClick={submit} loading={saving}>{t('action.save')}</Button>
    </div>
  );
};
