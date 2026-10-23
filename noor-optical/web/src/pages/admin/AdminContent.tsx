import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { useI18n } from '../../lib/i18n';
import type { PublicSettings } from '../../lib/types';
import { Field, Input, Textarea } from '../../components/ui/form';
import { Button, EmptyState, Skeleton } from '../../components/ui/primitives';

/**
 * Content management: optometrist profile, About page copy, trust strip items,
 * and SEO settings. All values persist in the settings table and render
 * dynamically on the public site.
 */
export const AdminContent = () => {
  const { t } = useI18n();
  const [draft, setDraft] = useState<PublicSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedNote, setSavedNote] = useState(false);
  const [tab, setTab] = useState<'optometrist' | 'about' | 'trust' | 'seo'>('optometrist');

  const load = async () => {
    setLoading(true); setError(null);
    try { setDraft(await api.admin.settings()); }
    catch (cause) { setError(cause instanceof Error ? cause.message : t('common.errorBody')); }
    finally { setLoading(false); }
  };

  useEffect(() => { void load(); // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) return <Skeleton className="h-96 w-full" />;
  if (error || !draft) return <EmptyState title={t('common.errorTitle')} body={error ?? t('common.errorBody')} action={<Button variant="outline" size="sm" onClick={() => void load()}>{t('action.retry')}</Button>} />;

  const updateSection = <K extends keyof PublicSettings>(section: K, patch: Partial<PublicSettings[K]>) =>
    setDraft((cur) => cur ? { ...cur, [section]: { ...(cur[section] as object), ...patch } } : cur);

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
    } finally { setSaving(false); }
  };

  const tabs = [
    { key: 'optometrist' as const, label: t('admin.optometrist') },
    { key: 'about' as const, label: t('admin.aboutPage') },
    { key: 'trust' as const, label: t('admin.trustItems') },
    { key: 'seo' as const, label: t('admin.seo') },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-[15px] uppercase tracking-label text-navy">{t('admin.content')}</h1>
        <div className="flex items-center gap-3">
          {savedNote ? <span className="text-[13px] text-champagne-dark">{t('admin.savedNote')}</span> : null}
          <Button onClick={() => void save()} loading={saving}>{t('action.save')}</Button>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto border-b border-line">
        {tabs.map((tb) => (
          <button
            key={tb.key}
            type="button"
            onClick={() => setTab(tb.key)}
            className={`whitespace-nowrap border-b-2 px-4 py-3 text-[13px] transition-colors ${tab === tb.key ? 'border-navy text-navy' : 'border-transparent text-slate hover:text-navy'}`}
          >
            {tb.label}
          </button>
        ))}
      </div>

      {tab === 'optometrist' ? (
        <section className="border border-line bg-paper p-6">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label={`${t('admin.nameEn')}`}><Input value={draft.optometrist.nameEn} onChange={(e) => updateSection('optometrist', { nameEn: e.target.value })} /></Field>
            <Field label={`${t('admin.nameFa')}`}><Input value={draft.optometrist.nameFa} onChange={(e) => updateSection('optometrist', { nameFa: e.target.value })} /></Field>
            <Field label={`${t('admin.titleLabel')} (EN)`}><Input value={draft.optometrist.titleEn} onChange={(e) => updateSection('optometrist', { titleEn: e.target.value })} /></Field>
            <Field label={`${t('admin.titleLabel')} (FA)`}><Input value={draft.optometrist.titleFa} onChange={(e) => updateSection('optometrist', { titleFa: e.target.value })} /></Field>
            <Field label={`${t('admin.bio')} (EN)`}><Textarea value={draft.optometrist.bioEn} onChange={(e) => updateSection('optometrist', { bioEn: e.target.value })} /></Field>
            <Field label={`${t('admin.bio')} (FA)`}><Textarea value={draft.optometrist.bioFa} onChange={(e) => updateSection('optometrist', { bioFa: e.target.value })} /></Field>
            <Field label={`${t('admin.credentials')} (EN)`}><Textarea value={draft.optometrist.credentialsEn} onChange={(e) => updateSection('optometrist', { credentialsEn: e.target.value })} /></Field>
            <Field label={`${t('admin.credentials')} (FA)`}><Textarea value={draft.optometrist.credentialsFa} onChange={(e) => updateSection('optometrist', { credentialsFa: e.target.value })} /></Field>
            <Field label={t('admin.imageUrl')} className="sm:col-span-2"><Input value={draft.optometrist.imageUrl} onChange={(e) => updateSection('optometrist', { imageUrl: e.target.value })} /></Field>
          </div>
        </section>
      ) : null}

      {tab === 'about' ? (
        <section className="border border-line bg-paper p-6">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label={`Eyebrow (EN)`}><Input value={draft.about.eyebrowEn} onChange={(e) => updateSection('about', { eyebrowEn: e.target.value })} /></Field>
            <Field label={`Eyebrow (FA)`}><Input value={draft.about.eyebrowFa} onChange={(e) => updateSection('about', { eyebrowFa: e.target.value })} /></Field>
            <Field label={`Title (EN)`}><Input value={draft.about.titleEn} onChange={(e) => updateSection('about', { titleEn: e.target.value })} /></Field>
            <Field label={`Title (FA)`}><Input value={draft.about.titleFa} onChange={(e) => updateSection('about', { titleFa: e.target.value })} /></Field>
            <Field label="P1 (EN)"><Textarea value={draft.about.p1En} onChange={(e) => updateSection('about', { p1En: e.target.value })} /></Field>
            <Field label="P1 (FA)"><Textarea value={draft.about.p1Fa} onChange={(e) => updateSection('about', { p1Fa: e.target.value })} /></Field>
            <Field label="P2 (EN)"><Textarea value={draft.about.p2En} onChange={(e) => updateSection('about', { p2En: e.target.value })} /></Field>
            <Field label="P2 (FA)"><Textarea value={draft.about.p2Fa} onChange={(e) => updateSection('about', { p2Fa: e.target.value })} /></Field>
            <Field label="P3 (EN)"><Textarea value={draft.about.p3En} onChange={(e) => updateSection('about', { p3En: e.target.value })} /></Field>
            <Field label="P3 (FA)"><Textarea value={draft.about.p3Fa} onChange={(e) => updateSection('about', { p3Fa: e.target.value })} /></Field>
          </div>
          <h3 className="mt-8 text-[13px] uppercase tracking-label text-slate">{t('admin.values')}</h3>
          <div className="mt-4 grid gap-5 sm:grid-cols-2">
            <Field label={`${t('admin.value1')} Title (EN)`}><Input value={draft.about.v1TitleEn} onChange={(e) => updateSection('about', { v1TitleEn: e.target.value })} /></Field>
            <Field label={`${t('admin.value1')} Title (FA)`}><Input value={draft.about.v1TitleFa} onChange={(e) => updateSection('about', { v1TitleFa: e.target.value })} /></Field>
            <Field label={`${t('admin.value1')} Body (EN)`}><Textarea value={draft.about.v1BodyEn} onChange={(e) => updateSection('about', { v1BodyEn: e.target.value })} /></Field>
            <Field label={`${t('admin.value1')} Body (FA)`}><Textarea value={draft.about.v1BodyFa} onChange={(e) => updateSection('about', { v1BodyFa: e.target.value })} /></Field>
            <Field label={`${t('admin.value2')} Title (EN)`}><Input value={draft.about.v2TitleEn} onChange={(e) => updateSection('about', { v2TitleEn: e.target.value })} /></Field>
            <Field label={`${t('admin.value2')} Title (FA)`}><Input value={draft.about.v2TitleFa} onChange={(e) => updateSection('about', { v2TitleFa: e.target.value })} /></Field>
            <Field label={`${t('admin.value2')} Body (EN)`}><Textarea value={draft.about.v2BodyEn} onChange={(e) => updateSection('about', { v2BodyEn: e.target.value })} /></Field>
            <Field label={`${t('admin.value2')} Body (FA)`}><Textarea value={draft.about.v2BodyFa} onChange={(e) => updateSection('about', { v2BodyFa: e.target.value })} /></Field>
            <Field label={`${t('admin.value3')} Title (EN)`}><Input value={draft.about.v3TitleEn} onChange={(e) => updateSection('about', { v3TitleEn: e.target.value })} /></Field>
            <Field label={`${t('admin.value3')} Title (FA)`}><Input value={draft.about.v3TitleFa} onChange={(e) => updateSection('about', { v3TitleFa: e.target.value })} /></Field>
            <Field label={`${t('admin.value3')} Body (EN)`}><Textarea value={draft.about.v3BodyEn} onChange={(e) => updateSection('about', { v3BodyEn: e.target.value })} /></Field>
            <Field label={`${t('admin.value3')} Body (FA)`}><Textarea value={draft.about.v3BodyFa} onChange={(e) => updateSection('about', { v3BodyFa: e.target.value })} /></Field>
          </div>
        </section>
      ) : null}

      {tab === 'trust' ? (
        <section className="border border-line bg-paper p-6">
          <p className="text-[12px] text-slate">{t('admin.settingsNote')}</p>
          <div className="mt-5 space-y-6">
            {draft.trust.map((item, i) => (
              <div key={i} className="border border-line p-4">
                <p className="mb-3 text-[13px] text-navy">#{i + 1}</p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Title (EN)"><Input value={item.titleEn} onChange={(e) => {
                    const trust = [...draft.trust]; trust[i] = { ...item, titleEn: e.target.value }; updateSection('trust', undefined as never); setDraft({ ...draft, trust });
                  }} /></Field>
                  <Field label="Title (FA)"><Input value={item.titleFa} onChange={(e) => {
                    const trust = [...draft.trust]; trust[i] = { ...item, titleFa: e.target.value }; updateSection('trust', undefined as never); setDraft({ ...draft, trust });
                  }} /></Field>
                  <Field label="Body (EN)"><Textarea value={item.bodyEn} onChange={(e) => {
                    const trust = [...draft.trust]; trust[i] = { ...item, bodyEn: e.target.value }; updateSection('trust', undefined as never); setDraft({ ...draft, trust });
                  }} /></Field>
                  <Field label="Body (FA)"><Textarea value={item.bodyFa} onChange={(e) => {
                    const trust = [...draft.trust]; trust[i] = { ...item, bodyFa: e.target.value }; updateSection('trust', undefined as never); setDraft({ ...draft, trust });
                  }} /></Field>
                </div>
              </div>
            ))}
            <Button size="sm" variant="outline" onClick={() => setDraft({ ...draft, trust: [...draft.trust, { titleEn: '', titleFa: '', bodyEn: '', bodyFa: '' }] })}>{t('admin.createNew')}</Button>
          </div>
        </section>
      ) : null}

      {tab === 'seo' ? (
        <section className="border border-line bg-paper p-6">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label={`${t('admin.seoTitle')} (EN)`}><Input value={draft.seo.titleEn} onChange={(e) => updateSection('seo', { titleEn: e.target.value })} /></Field>
            <Field label={`${t('admin.seoTitle')} (FA)`}><Input value={draft.seo.titleFa} onChange={(e) => updateSection('seo', { titleFa: e.target.value })} /></Field>
            <Field label={`${t('admin.seoDesc')} (EN)`}><Textarea value={draft.seo.descriptionEn} onChange={(e) => updateSection('seo', { descriptionEn: e.target.value })} /></Field>
            <Field label={`${t('admin.seoDesc')} (FA)`}><Textarea value={draft.seo.descriptionFa} onChange={(e) => updateSection('seo', { descriptionFa: e.target.value })} /></Field>
            <Field label={t('admin.ogImage')} className="sm:col-span-2"><Input value={draft.seo.ogImageUrl} onChange={(e) => updateSection('seo', { ogImageUrl: e.target.value })} /></Field>
          </div>
        </section>
      ) : null}
    </div>
  );
};
