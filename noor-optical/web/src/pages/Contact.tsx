import { useState } from 'react';
import { api, ApiError } from '../lib/api';
import { formatDigits } from '../lib/format';
import { useI18n } from '../lib/i18n';
import { useSettings } from '../lib/settings';
import { Breadcrumbs } from '../components/ui/nav';
import { Field, FormNotice, Input, Textarea } from '../components/ui/form';
import { Button } from '../components/ui/primitives';
import { ClockIcon, MailIcon, PhoneIcon, PinIcon } from '../components/ui/Icons';

export const ContactPage = () => {
  const { t, pick, locale } = useI18n();
  const settings = useSettings();
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', subject: '', message: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [state, setState] = useState<{ status: 'idle' | 'sending' | 'sent' | 'error'; reference?: string; message?: string }>(
    { status: 'idle' },
  );

  const update = (key: keyof typeof form) => (value: string) =>
    setForm((current) => ({ ...current, [key]: value }));

  const submit = async () => {
    const nextErrors: Record<string, string> = {};
    if (!form.fullName.trim()) nextErrors.fullName = t('checkout.incomplete');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) nextErrors.email = t('checkout.incomplete');
    if (form.message.trim().length < 10) nextErrors.message = t('checkout.incomplete');
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setState({ status: 'sending' });
    try {
      const result = await api.createContact({
        fullName: form.fullName,
        email: form.email,
        phone: form.phone || null,
        subject: form.subject || null,
        message: form.message,
      });
      setState({ status: 'sent', reference: result.reference });
      setForm({ fullName: '', email: '', phone: '', subject: '', message: '' });
    } catch (cause) {
      setState({
        status: 'error',
        message: cause instanceof ApiError ? cause.message : t('common.errorBody'),
      });
    }
  };

  const rows = [
    { icon: PhoneIcon, label: t('contact.phone'), value: formatDigits(settings.contact.phone, locale), href: settings.contact.phone ? `tel:${settings.contact.phone.replace(/\s/g, '')}` : undefined },
    { icon: MailIcon, label: t('contact.email'), value: settings.contact.email, href: settings.contact.email ? `mailto:${settings.contact.email}` : undefined },
    { icon: PinIcon, label: t('contact.address'), value: pick(settings.contact.addressFa, settings.contact.addressEn) },
    { icon: ClockIcon, label: t('contact.hours'), value: pick(settings.contact.hoursFa, settings.contact.hoursEn) },
  ].filter((row) => Boolean(row.value));

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-10 md:px-8 md:py-14">
      <Breadcrumbs items={[{ label: t('nav.home'), to: '/' }, { label: t('nav.contact') }]} />

      <div className="mt-6 grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <p className="label-eyebrow text-champagne-dark">{t('contact.eyebrow')}</p>
          <h1 className="mt-4 text-display text-navy">{t('contact.title')}</h1>
          <p className="mt-5 text-[15px] leading-relaxed text-slate">{t('contact.intro')}</p>

          <dl className="mt-10 space-y-6">
            {rows.map((row) => (
              <div key={row.label} className="flex items-start gap-4 border-t border-line pt-5">
                <row.icon size={18} className="mt-[3px] shrink-0 text-champagne-dark" />
                <div>
                  <dt className="label-eyebrow text-slate">{row.label}</dt>
                  <dd className="mt-2 text-[15px] text-navy">
                    {row.href ? (
                      <a href={row.href} className="transition-colors hover:text-champagne-dark">
                        {row.value}
                      </a>
                    ) : (
                      row.value
                    )}
                  </dd>
                </div>
              </div>
            ))}
          </dl>
        </div>

        <div className="border border-line bg-paper p-6 md:p-8">
          <h2 className="text-section text-navy">{t('contact.formTitle')}</h2>
          <div className="mt-6 space-y-5">
            <Field label={t('checkout.fullName')} required htmlFor="contact-name" error={errors.fullName}>
              <Input id="contact-name" value={form.fullName} onChange={(event) => update('fullName')(event.target.value)} />
            </Field>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label={t('checkout.email')} required htmlFor="contact-email" error={errors.email}>
                <Input id="contact-email" type="email" value={form.email} onChange={(event) => update('email')(event.target.value)} />
              </Field>
              <Field label={t('checkout.phone')} htmlFor="contact-phone" optionalLabel={t('common.optional')}>
                <Input id="contact-phone" value={form.phone} onChange={(event) => update('phone')(event.target.value)} />
              </Field>
            </div>
            <Field label={t('contact.subject')} htmlFor="contact-subject" optionalLabel={t('common.optional')}>
              <Input id="contact-subject" value={form.subject} onChange={(event) => update('subject')(event.target.value)} />
            </Field>
            <Field label={t('contact.message')} required htmlFor="contact-message" error={errors.message}>
              <Textarea id="contact-message" value={form.message} onChange={(event) => update('message')(event.target.value)} />
            </Field>

            {state.status === 'sent' ? (
              <FormNotice tone="success">
                {t('contact.success')} — {t('appointment.reference')}: {state.reference}
              </FormNotice>
            ) : null}
            {state.status === 'error' ? <FormNotice tone="error">{state.message}</FormNotice> : null}

            <Button onClick={submit} loading={state.status === 'sending'} block>
              {state.status === 'sending' ? t('action.sending') : t('action.send')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
