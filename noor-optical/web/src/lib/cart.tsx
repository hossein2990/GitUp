import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { CartLine } from './types';

const STORAGE_KEY = 'noor.cart.v1';

type CartContextValue = {
  lines: CartLine[];
  count: number;
  subtotal: number;
  currency: string;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addLine: (line: Omit<CartLine, 'quantity'>, quantity?: number) => void;
  setQuantity: (key: string, quantity: number) => void;
  removeLine: (key: string) => void;
  clear: () => void;
};

const lineKey = (line: Pick<CartLine, 'productId' | 'variantId'>) =>
  `${line.productId}:${line.variantId ?? 'base'}`;

const CartContext = createContext<CartContextValue | null>(null);

const readStored = (): CartLine[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (entry): entry is CartLine =>
        Boolean(entry) && typeof entry === 'object' && 'productId' in (entry as CartLine),
    );
  } catch {
    return [];
  }
};

/**
 * The bag lives in the browser: a guest can fill it without an account, and the
 * server re-prices every line at checkout so a stale local price cannot be used.
 */
export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [lines, setLines] = useState<CartLine[]>(readStored);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {
      // Ignore storage failures; the in-memory bag still works this session.
    }
  }, [lines]);

  const addLine = useCallback((line: Omit<CartLine, 'quantity'>, quantity = 1) => {
    setLines((current) => {
      const key = lineKey(line);
      const existing = current.find((entry) => lineKey(entry) === key);
      if (existing) {
        return current.map((entry) =>
          lineKey(entry) === key
            ? { ...entry, quantity: Math.min(10, entry.quantity + quantity) }
            : entry,
        );
      }
      return [...current, { ...line, quantity: Math.min(10, Math.max(1, quantity)) }];
    });
    setIsOpen(true);
  }, []);

  const setQuantity = useCallback((key: string, quantity: number) => {
    setLines((current) =>
      current
        .map((entry) =>
          lineKey(entry) === key
            ? { ...entry, quantity: Math.max(0, Math.min(10, quantity)) }
            : entry,
        )
        .filter((entry) => entry.quantity > 0),
    );
  }, []);

  const removeLine = useCallback((key: string) => {
    setLines((current) => current.filter((entry) => lineKey(entry) !== key));
  }, []);

  const value = useMemo<CartContextValue>(() => {
    const count = lines.reduce((total, line) => total + line.quantity, 0);
    const subtotal = lines.reduce((total, line) => total + line.unitPrice * line.quantity, 0);
    return {
      lines,
      count,
      subtotal,
      currency: lines[0]?.currency ?? 'IRT',
      isOpen,
      openCart: () => setIsOpen(true),
      closeCart: () => setIsOpen(false),
      addLine,
      setQuantity,
      removeLine,
      clear: () => setLines([]),
    };
  }, [lines, isOpen, addLine, setQuantity, removeLine]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used inside CartProvider');
  return context;
};

export const cartLineKey = lineKey;
