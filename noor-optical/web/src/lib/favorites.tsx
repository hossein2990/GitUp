import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { Product, Variant } from './types';

const STORAGE_KEY = 'noor.favorites.v1';

export type FavoriteEntry = {
  productId: number;
  slug: string;
  nameEn: string;
  nameFa: string;
  brandName: string | null;
  price: number;
  salePrice: number | null;
  currency: string;
  imageUrl: string | null;
  inStock: boolean;
  addedAt: string;
};

type FavoritesContextValue = {
  entries: FavoriteEntry[];
  count: number;
  has: (productId: number) => boolean;
  toggle: (product: Product, variant: Variant | null) => void;
  remove: (productId: number) => void;
  clear: () => void;
};

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

const readStored = (): FavoriteEntry[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(parsed) ? (parsed as FavoriteEntry[]) : [];
  } catch {
    return [];
  }
};

export const FavoritesProvider = ({ children }: { children: ReactNode }) => {
  const [entries, setEntries] = useState<FavoriteEntry[]>(readStored);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    } catch {
      // Non-fatal: favourites simply will not persist.
    }
  }, [entries]);

  const toggle = useCallback((product: Product, variant: Variant | null) => {
    setEntries((current) => {
      if (current.some((entry) => entry.productId === product.id)) {
        return current.filter((entry) => entry.productId !== product.id);
      }
      const image = variant?.images[0]?.url ?? product.images[0]?.url ?? null;
      const entry: FavoriteEntry = {
        productId: product.id,
        slug: product.slug,
        nameEn: product.nameEn,
        nameFa: product.nameFa,
        brandName: product.brand?.name ?? null,
        price: variant?.price || product.price,
        salePrice: variant?.salePrice ?? product.salePrice,
        currency: product.currency,
        imageUrl: image,
        inStock: variant ? variant.inStock : product.inStock,
        addedAt: new Date().toISOString(),
      };
      return [entry, ...current];
    });
  }, []);

  const value = useMemo<FavoritesContextValue>(
    () => ({
      entries,
      count: entries.length,
      has: (productId: number) => entries.some((entry) => entry.productId === productId),
      toggle,
      remove: (productId: number) =>
        setEntries((current) => current.filter((entry) => entry.productId !== productId)),
      clear: () => setEntries([]),
    }),
    [entries, toggle],
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) throw new Error('useFavorites must be used inside FavoritesProvider');
  return context;
};
