import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { api, setAuthToken } from './api';
import type { AuthUser } from './types';

const STORAGE_KEY = 'noor.session.v1';

type AuthContextValue = {
  user: AuthUser | null;
  ready: boolean;
  isStaff: boolean;
  signIn: (email: string, password: string) => Promise<AuthUser>;
  signUp: (input: {
    email: string;
    password: string;
    fullName: string;
    phone?: string | null;
  }) => Promise<AuthUser>;
  signOut: () => void;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

type StoredSession = { token: string; user: AuthUser };

const readStored = (): StoredSession | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredSession) : null;
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<StoredSession | null>(readStored);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setAuthToken(session?.token ?? null);
  }, [session]);

  // Confirm a stored token is still valid (it may have expired).
  useEffect(() => {
    let cancelled = false;
    const verify = async () => {
      if (!session?.token) {
        setReady(true);
        return;
      }
      try {
        const { user } = await api.me();
        if (!cancelled) setSession({ token: session.token, user });
      } catch {
        if (!cancelled) setSession(null);
      } finally {
        if (!cancelled) setReady(true);
      }
    };
    void verify();
    return () => {
      cancelled = true;
    };
    // Only re-verify when the token itself changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.token]);

  const persist = useCallback((next: StoredSession | null) => {
    setSession(next);
    try {
      if (next) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      else window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Session stays in memory when storage is unavailable.
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.user ?? null,
      ready,
      isStaff: session?.user.role === 'admin',
      signIn: async (email, password) => {
        const result = await api.login({ email, password });
        persist({ token: result.token, user: result.user });
        return result.user;
      },
      signUp: async (input) => {
        const result = await api.register(input);
        persist({ token: result.token, user: result.user });
        return result.user;
      },
      signOut: () => persist(null),
      refresh: async () => {
        const { user } = await api.me();
        persist({ token: session?.token ?? '', user });
      },
    }),
    [session, ready, persist],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
};
