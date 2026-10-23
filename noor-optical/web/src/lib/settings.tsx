import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { api } from './api';
import type { PublicSettings } from './types';

/**
 * Local fallbacks mirror the API defaults so the storefront renders before the
 * settings request resolves (and if it fails).
 */
const FALLBACK: PublicSettings = {
  brand: {
    nameEn: 'NOOR OPTICAL',
    nameFa: 'فروشگاه تخصصی عینک نور',
    tagline_en: 'Clearer · Brighter · Together',
    tagline_fa: 'شفاف‌تر · روشن‌تر · همراه شما',
  },
  announcement: { enabled: false, textEn: '', textFa: '', href: null },
  contact: {
    phone: '',
    whatsapp: null,
    email: '',
    addressEn: '',
    addressFa: '',
    hoursEn: '',
    hoursFa: '',
    instagram: null,
    mapUrl: null,
  },
  commerce: {
    currency: 'IRT',
    shippingFlat: 0,
    freeShippingThreshold: null,
    codEnabled: true,
    deliveryDaysEn: '',
    deliveryDaysFa: '',
    returnsEn: '',
    returnsFa: '',
  },
  hero: { headlineEn: '', headlineFa: '', bodyEn: '', bodyFa: '', imageUrl: '' },
  trust: [],
};

type SettingsContextValue = {
  settings: PublicSettings;
  loading: boolean;
  reload: () => Promise<void>;
};

const SettingsContext = createContext<SettingsContextValue>({
  settings: FALLBACK,
  loading: true,
  reload: async () => undefined,
});

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<PublicSettings>(FALLBACK);
  const [loading, setLoading] = useState(true);
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    let cancelled = false;
    api
      .settings()
      .then((result) => {
        if (!cancelled) setSettings({ ...FALLBACK, ...result });
      })
      .catch(() => {
        // Keep the fallbacks; the site stays usable without the settings call.
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [nonce]);

  const value = useMemo<SettingsContextValue>(
    () => ({
      settings,
      loading,
      reload: async () => {
        setNonce((current) => current + 1);
      },
    }),
    [settings, loading],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};

export const useSettings = () => useContext(SettingsContext).settings;
export const useSettingsState = () => useContext(SettingsContext);
