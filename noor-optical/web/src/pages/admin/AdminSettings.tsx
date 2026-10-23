import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { useI18n } from '../../lib/i18n';
import type { PublicSettings } from '../../lib/types';
import { Field, Input, Textarea } from '../../components/ui/form';
import { Button, EmptyState, Skeleton } from '../../components/ui/primitives';

type Service = Awaited<ReturnType<typeof api.admin.services>>['items'][number];

/**
 * Everything the storefront reads as content: brand copy, the announcement strip,
 * contact details, delivery/returns text and the homepage hero. Edits here take
 * effect across the site without a deploy.
 */
export const AdminSettings = () => {
  const { t } = useI18n();
  const [draft, setDraft] = useState<PublicSettings | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savedNote, setSavedNote] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [settings, serviceList] = await Promise.all([api.admin.settings(), api.admin.services()]);
      setDraft(settings);
      setServices(serviceList.items);
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

  if (loading) return <Skeleton className="h-96 w-full" />;
  if (error || !draft) {
    return (
      <EmptyState
        title={t('common.errorTitle')}
        body={t('common.errorBody')}
        action={
          <Button variant="outline" size="sm" onClick={() => void load()}>
            {t('action.retry')}
          </Button>
        }
      />
    );
  }

  const updateSection = <K extends keyof PublicSettings>(section: K, patch: Partial<PublicSettings[K]>) =>
    setDraft((current) => (current ? { ...current, [section]: { ...(current[section] as object), ...patch } } : current));

  const save = async () => {
    if (!draft) return;
    setSaving(true);
    try {
      const result = await api.admin.updateSettings(draft as unknown as Record<string, unknown>);
      setDraft(result);
      setSavedNote(true);
      window.setTimeout(() => setSavedNote(false), 2000);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : t('common.errorBody'));
    } finally {
      setSaving(false);
    }
  };

  const toggleService = async (service: Service) => {
    await api.admin.updateService(service.id, { isActive: !service.isActive });
    await load();
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-[15px] uppercase tracking-label text-navy">{t('admin.settings')}</h1>
        <div className="flex items-center gap-3">
          {savedNote ? <span className="text-[13px] text-champagne-dark">{t('admin.savedNote')}</span> : null}
          <Button onClick={() => void save()} loading={saving}>
            {t('action.save')}
          </Button>
        </div>
      </div>
      <p className="text-[12px] leading-relaxed text-slate">{t('admin.settingsNote')}</p>

      <section className="border border-line bg-paper p-6">
        <h2 className="label-eyebrow text-slate">{t('brand.full')}</h2>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <Field label="Brand name (English)">
            <Input value={draft.brand.nameEn} onChange={(event) => updateSection('brand', { nameEn: event.target.value })} />
          </Field>
          <Field label="نام برند (فارسی)">
            <Input value={draft.brand.nameFa} onChange={(event) => updateSection('brand', { nameFa: event.target.value })} />
          </Field>
          <Field label="Tagline (English)">
            <Input value={draft.brand.tagline_en} onChange={(event) => updateSection('brand', { tagline_en: event.target.value })} />
          </Field>
          <Field label="شعار (فارسی)">
            <Input value={draft.brand.tagline_fa} onChange={(event) => updateSection('brand', { tagline_fa: event.target.value })} />
          </Field>
        </div>
      </section>

      <section className="border border-line bg-paper p-6">
        <h2 className="label-eyebrow text-slate">{t('admin.announcementEnabled')}</h2>
        <label className="mt-5 flex items-center gap-3 text-[14px] text-ink">
          <input
            type="checkbox"
            checked={draft.announcement.enabled}
            onChange={(event) => updateSection('announcement', { enabled: event.target.checked })}
          />
          {t('admin.announcementEnabled')}
        </label>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <Field label="Announcement (English)">
            <Input value={draft.announcement.textEn} onChange={(event) => updateSection('announcement', { textEn: event.target.value })} />
          </Field>
          <Field label="اطلاعیه (فارسی)">
            <Input value={draft.announcement.textFa} onChange={(event) => updateSection('announcement', { textFa: event.target.value })} />
          </Field>
          <Field label="Link">
            <Input value={draft.announcement.href ?? ''} onChange={(event) => updateSection('announcement', { href: event.target.value })} />
          </Field>
        </div>
      </section>

      <section className="border border-line bg-paper p-6">
        <h2 className="label-eyebrow text-slate">{t('footer.contact')}</h2>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <Field label="Phone">
            <Input value={draft.contact.phone} onChange={(event) => updateSection('contact', { phone: event.target.value })} />
          </Field>
          <Field label="Email">
            <Input value={draft.contact.email} onChange={(event) => updateSection('contact', { email: event.target.value })} />
          </Field>
          <Field label="Address (English)">
            <Input value={draft.contact.addressEn} onChange={(event) => updateSection('contact', { addressEn: event.target.value })} />
          </Field>
          <Field label="نشانی (فارسی)">
            <Input value={draft.contact.addressFa} onChange={(event) => updateSection('contact', { addressFa: event.target.value })} />
          </Field>
          <Field label="Opening hours (English)">
            <Input value={draft.contact.hoursEn} onChange={(event) => updateSection('contact', { hoursEn: event.target.value })} />
          </Field>
          <Field label="ساعات کاری (فارسی)">
            <Input value={draft.contact.hoursFa} onChange={(event) => updateSection('contact', { hoursFa: event.target.value })} />
          </Field>
          <Field label="Instagram URL">
            <Input value={draft.contact.instagram ?? ''} onChange={(event) => updateSection('contact', { instagram: event.target.value })} />
          </Field>
          <Field label="WhatsApp">
            <Input value={draft.contact.whatsapp ?? ''} onChange={(event) => updateSection('contact', { whatsapp: event.target.value })} />
          </Field>
        </div>
      </section>

      <section className="border border-line bg-paper p-6">
        <h2 className="label-eyebrow text-slate">{t('checkout.delivery')} & {t('product.returns')}</h2>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <Field label="Currency code">
            <Input value={draft.commerce.currency} onChange={(event) => updateSection('commerce', { currency: event.target.value })} />
          </Field>
          <Field label="Shipping flat rate">
            <Input
              type="number"
              value={draft.commerce.shippingFlat}
              onChange={(event) => updateSection('commerce', { shippingFlat: Number(event.target.value) })}
            />
          </Field>
          <Field label="Free shipping above">
            <Input
              type="number"
              value={draft.commerce.freeShippingThreshold ?? ''}
              onChange={(event) =>
                updateSection('commerce', {
                  freeShippingThreshold: event.target.value === '' ? null : Number(event.target.value),
                })
              }
            />
          </Field>
          <Field label="Delivery days (English)">
            <Input value={draft.commerce.deliveryDaysEn} onChange={(event) => updateSection('commerce', { deliveryDaysEn: event.target.value })} />
          </Field>
          <Field label="زمان تحویل (فارسی)">
            <Input value={draft.commerce.deliveryDaysFa} onChange={(event) => updateSection('commerce', { deliveryDaysFa: event.target.value })} />
          </Field>
          <Field label="Returns (English)">
            <Textarea value={draft.commerce.returnsEn} onChange={(event) => updateSection('commerce', { returnsEn: event.target.value })} />
          </Field>
          <Field label="بازگشت کالا (فارسی)">
            <Textarea value={draft.commerce.returnsFa} onChange={(event) => updateSection('commerce', { returnsFa: event.target.value })} />
          </Field>
        </div>
      </section>

      <section className="border border-line bg-paper p-6">
        <h2 className="label-eyebrow text-slate">{t('home.heroEyebrow')}</h2>
        <div className="mt-5 grid gap-5">
          <Field label="Headline (English)">
            <Input value={draft.hero.headlineEn} onChange={(event) => updateSection('hero', { headlineEn: event.target.value })} />
          </Field>
          <Field label="تیتر (فارسی)">
            <Input value={draft.hero.headlineFa} onChange={(event) => updateSection('hero', { headlineFa: event.target.value })} />
          </Field>
          <Field label="Supporting copy (English)">
            <Textarea value={draft.hero.bodyEn} onChange={(event) => updateSection('hero', { bodyEn: event.target.value })} />
          </Field>
          <Field label="متن پشتیبان (فارسی)">
            <Textarea value={draft.hero.bodyFa} onChange={(event) => updateSection('hero', { bodyFa: event.target.value })} />
          </Field>
          <Field label="Hero image URL">
            <Input value={draft.hero.imageUrl} onChange={(event) => updateSection('hero', { imageUrl: event.target.value })} />
          </Field>
        </div>
      </section>

      <section className="border border-line bg-paper p-6">
        <h2 className="label-eyebrow text-slate">{t('admin.services')}</h2>
        <p className="mt-3 text-[12px] text-slate">{t('admin.servicesNote')}</p>
        <ul className="mt-5 divide-y divide-line">
          {services.map((service) => (
            <li key={service.id} className="flex flex-wrap items-center justify-between gap-4 py-4">
              <div>
                <p className="text-[14px] text-navy">{service.nameFa}</p>
                <p className="mt-1 text-[12px] text-slate">
                  {service.nameEn} · {service.durationFa}
                </p>
              </div>
              <label className="flex items-center gap-3 text-[13px] text-slate">
                <input type="checkbox" checked={service.isActive} onChange={() => void toggleService(service)} />
                {service.isActive ? t('admin.active') : t('admin.inactive')}
              </label>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};
