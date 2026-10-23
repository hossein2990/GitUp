import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api, ApiError } from '../lib/api';
import { timeSlots } from '../lib/catalog';
import { useAsync } from '../lib/hooks';
import { useI18n } from '../lib/i18n';
import { useSettings } from '../lib/settings';
import { Breadcrumbs } from '../components/ui/nav';
import { Field, FormNotice, Input, Select, Textarea } from '../components/ui/form';
import { Button } from '../components/ui/primitives';

export const AppointmentPage = () => {
  const { t, pick, locale } = useI18n();
  const settings = useSettings();
  const [searchParams] = useSearchParams();
  const services = useAsync(() => api.services(), []);

  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    email: '',
    serviceSlug: searchParams.get('service') ?? '',
    preferredDate: '',
    preferredTime: '',
    notes: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [state, setState] = useState<{ status: 'idle' | 'sending' | 'sent' | 'error'; reference?: string; message?: string }>(
    { status: 'idle' },
  );

  const update = (key: keyof typeof form) => (value: string) =>
    setForm((current) => ({ ...current, [key]: value }));

  const submit = async () => {
    const nextErrors: Record<string, string> = {};
    if (!form.fullName.trim()) nextErrors.fullName = t('checkout.incomplete');
    if (!form.phone.trim()) nextErrors.phone = t('checkout.incomplete');
    if (form.preferredTime && !timeSlots.includes(form.preferredTime)) nextErrors.preferredTime = t('checkout.incomplete');
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setState({ status: 'sending' });
    try {
      const result = await api.createAppointment({
        fullName: form.fullName,
        phone: form.phone,
        email: form.email || null,
        serviceSlug: form.serviceSlug || null,
        preferredDate: form.preferredDate || null,
        preferredTime: form.preferredTime || null,
        notes: form.notes || null,
      });
      setState({ status: 'sent', reference: result.reference });
      setForm({
        fullName: '',
        phone: '',
        email: '',
        serviceSlug: '',
        preferredDate: '',
        preferredTime: '',
        notes: '',
      });
    } catch (cause) {
      setState({
        status: 'error',
        message: cause instanceof ApiError ? cause.message : t('common.errorBody'),
      });
    }
  };

  const formatSlot = (slot: string) => {
    const [start, end] = slot.split('-');
    const withLocale = `${start}:00 – ${end}:00`;
    return locale === 'fa'
      ? withLocale.replace(/\d/g, (digit) => '۰۱۲۳۴۵۶۷۸۹'[Number(digit)])
      : withLocale;
  };

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-10 md:px-8 md:py-14">
      <Breadcrumbs items={[{ label: t('nav.home'), to: '/' }, { label: t('nav.appointment') }]} />

      <div className="mt-6 grid gap-12 lg:grid-cols-[0.85fr_1.15fr]">
        <div>
          <p className="label-eyebrow text-champagne-dark">{t('appointment.eyebrow')}</p>
          <h1 className="mt-4 text-display text-navy">{t('appointment.title')}</h1>
          <p className="mt-5 text-[15px] leading-relaxed text-slate">{t('appointment.intro')}</p>

          <div className="mt-8 border border-line bg-paper p-5 text-[14px] text-slate">
            <p className="text-navy">{pick(settings.brand.nameFa, settings.brand.nameEn)}</p>
            <p className="mt-2">{pick(settings.contact.addressFa, settings.contact.addressEn)}</p>
            <p className="mt-2">{pick(settings.contact.hoursFa, settings.contact.hoursEn)}</p>
            <p className="mt-2">{settings.contact.phone}</p>
          </div>
        </div>

        <div className="border border-line bg-paper p-6 md:p-8">
          {state.status === 'sent' ? (
            <div className="space-y-4">
              <FormNotice tone="success">
                {t('appointment.success')}
                <span className="mt-2 block">
                  {t('appointment.reference')}: <strong>{state.reference}</strong>
                </span>
              </FormNotice>
              <Button variant="outline" onClick={() => setState({ status: 'idle' })}>
                {t('nav.appointment')}
              </Button>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label={t('checkout.fullName')} required htmlFor="apt-name" error={errors.fullName}>
                  <Input id="apt-name" value={form.fullName} onChange={(event) => update('fullName')(event.target.value)} />
                </Field>
                <Field label={t('checkout.phone')} required htmlFor="apt-phone" error={errors.phone}>
                  <Input id="apt-phone" value={form.phone} onChange={(event) => update('phone')(event.target.value)} />
                </Field>
              </div>

              <Field label={t('checkout.email')} htmlFor="apt-email" optionalLabel={t('common.optional')}>
                <Input id="apt-email" type="email" value={form.email} onChange={(event) => update('email')(event.target.value)} />
              </Field>

              <Field label={t('appointment.service')} htmlFor="apt-service">
                <Select id="apt-service" value={form.serviceSlug} onChange={(event) => update('serviceSlug')(event.target.value)}>
                  <option value="">{t('appointment.anyService')}</option>
                  {(services.data?.items ?? []).map((service) => (
                    <option key={service.slug} value={service.slug}>
                      {pick(service.nameFa, service.nameEn)}
                    </option>
                  ))}
                </Select>
              </Field>

              <div className="grid gap-5 sm:grid-cols-2">
                <Field label={t('appointment.date')} htmlFor="apt-date" optionalLabel={t('common.optional')}>
                  <Input
                    id="apt-date"
                    type="date"
                    value={form.preferredDate}
                    onChange={(event) => update('preferredDate')(event.target.value)}
                  />
                </Field>
                <Field label={t('appointment.time')} htmlFor="apt-time" optionalLabel={t('common.optional')}>
                  <Select id="apt-time" value={form.preferredTime} onChange={(event) => update('preferredTime')(event.target.value)}>
                    <option value="">—</option>
                    {timeSlots.map((slot) => (
                      <option key={slot} value={slot}>
                        {formatSlot(slot)}
                      </option>
                    ))}
                  </Select>
                </Field>
              </div>

              <Field label={t('appointment.notes')} htmlFor="apt-notes" optionalLabel={t('common.optional')}>
                <Textarea id="apt-notes" value={form.notes} onChange={(event) => update('notes')(event.target.value)} />
              </Field>

              {state.status === 'error' ? <FormNotice tone="error">{state.message}</FormNotice> : null}

              <Button onClick={submit} loading={state.status === 'sending'} block>
                {state.status === 'sending' ? t('action.sending') : t('action.bookAppointment')}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
