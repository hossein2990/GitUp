import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { api, ApiError } from '../lib/api';
import { useAuth } from '../lib/auth';
import { useI18n } from '../lib/i18n';
import { useBodyScrollLock } from '../lib/hooks';
import { Breadcrumbs } from '../components/ui/nav';
import { Field, FormNotice, Input } from '../components/ui/form';
import { Button } from '../components/ui/primitives';

type Mode = 'login' | 'register';

export const LoginPage = () => <AuthPage mode="login" />;
export const RegisterPage = () => <AuthPage mode="register" />;

/**
 * Sign-in and registration share one shell. Store staff sign in with the same
 * form and continue to the admin panel.
 */
const AuthPage = ({ mode }: { mode: Mode }) => {
  const { t } = useI18n();
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, signUp, user } = useAuth();
  useBodyScrollLock(false);

  const redirectTo = (location.state as { from?: string } | null)?.from;
  const [form, setForm] = useState({ email: '', password: '', fullName: '', phone: '' });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const update = (key: keyof typeof form) => (value: string) =>
    setForm((current) => ({ ...current, [key]: value }));

  const submit = async () => {
    const nextErrors: Record<string, string> = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) nextErrors.email = t('checkout.incomplete');
    if (form.password.length < (mode === 'register' ? 8 : 1)) nextErrors.password = t('auth.passwordHint');
    if (mode === 'register' && !form.fullName.trim()) nextErrors.fullName = t('checkout.incomplete');
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setLoading(true);
    setError(null);
    try {
      const user =
        mode === 'login'
          ? await signIn(form.email.trim(), form.password)
          : await signUp({
              email: form.email.trim(),
              password: form.password,
              fullName: form.fullName,
              phone: form.phone || null,
            });
      navigate(redirectTo ?? (user.role === 'admin' ? '/admin' : '/account'));
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : t('common.errorBody'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-[1100px] px-4 py-12 md:px-8 md:py-16">
      <Breadcrumbs
        items={[
          { label: t('nav.home'), to: '/' },
          { label: mode === 'login' ? t('auth.loginTitle') : t('auth.registerTitle') },
        ]}
      />

      <div className="mt-8 grid gap-12 lg:grid-cols-[1fr_1fr]">
        <div>
          <h1 className="text-display text-navy">
            {mode === 'login' ? t('auth.loginTitle') : t('auth.registerTitle')}
          </h1>
          <p className="mt-4 text-[15px] leading-relaxed text-slate">{t('account.guestBody')}</p>
          <p className="mt-6 border-s-2 border-champagne/70 bg-paper px-4 py-3 text-[13px] leading-relaxed text-slate">
            {t('auth.staffNote')}
          </p>
          {user ? (
            <p className="mt-6 text-[14px] text-navy">
              {user.email}{' '}
              <Link to="/account" className="underline decoration-champagne decoration-2 underline-offset-4">
                {t('action.myAccount')}
              </Link>
            </p>
          ) : null}
        </div>

        <form
          className="border border-line bg-paper p-6 md:p-8"
          onSubmit={(event) => {
            event.preventDefault();
            void submit();
          }}
        >
          <div className="space-y-5">
            {mode === 'register' ? (
              <>
                <Field label={t('auth.fullName')} required htmlFor="auth-name" error={errors.fullName}>
                  <Input id="auth-name" value={form.fullName} onChange={(event) => update('fullName')(event.target.value)} autoComplete="name" />
                </Field>
                <Field label={t('auth.phone')} htmlFor="auth-phone" optionalLabel={t('common.optional')}>
                  <Input id="auth-phone" value={form.phone} onChange={(event) => update('phone')(event.target.value)} autoComplete="tel" />
                </Field>
              </>
            ) : null}

            <Field label={t('checkout.email')} required htmlFor="auth-email" error={errors.email}>
              <Input id="auth-email" type="email" value={form.email} onChange={(event) => update('email')(event.target.value)} autoComplete="email" />
            </Field>
            <Field
              label={t('auth.password')}
              required
              htmlFor="auth-password"
              error={errors.password}
              hint={mode === 'register' ? t('auth.passwordHint') : undefined}
            >
              <Input
                id="auth-password"
                type="password"
                value={form.password}
                onChange={(event) => update('password')(event.target.value)}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              />
            </Field>

            {error ? <FormNotice tone="error">{error}</FormNotice> : null}

            <Button type="submit" block size="lg" loading={loading}>
              {mode === 'login' ? t('action.login') : t('action.register')}
            </Button>

            <p className="text-center text-[13px] text-slate">
              {mode === 'login' ? (
                <Link to="/register" className="underline decoration-champagne decoration-2 underline-offset-4">
                  {t('auth.noAccount')}
                </Link>
              ) : (
                <Link to="/login" className="underline decoration-champagne decoration-2 underline-offset-4">
                  {t('auth.haveAccount')}
                </Link>
              )}
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};
