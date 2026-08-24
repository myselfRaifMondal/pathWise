import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { api, tokens } from '@/lib/api';
import type { User } from '@/lib/types';

type Status = 'loading' | 'authenticated' | 'anonymous';

type AuthContextValue = {
  status: Status;
  user: User | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name?: string) => Promise<void>;
  signOut: () => Promise<void>;
  forgot: (email: string) => Promise<string>;
  updateProfile: (patch: Partial<Pick<User, 'name' | 'themePreference'>>) => Promise<void>;
  deleteAccount: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<Status>('loading');
  const [user, setUser] = useState<User | null>(null);

  // Restore the session from stored tokens on launch.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { access, refresh } = await tokens.read();
      if (!access && !refresh) {
        if (!cancelled) setStatus('anonymous');
        return;
      }
      try {
        const me = await api.me();
        if (cancelled) return;
        setUser(me);
        setStatus('authenticated');
      } catch {
        await tokens.clear();
        if (!cancelled) setStatus('anonymous');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const adopt = useCallback(
    async (response: { accessToken: string; refreshToken: string; user: User }) => {
      await tokens.write(response.accessToken, response.refreshToken);
      setUser(response.user);
      setStatus('authenticated');
    },
    [],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user,
      signIn: async (email, password) => adopt(await api.login(email, password)),
      signUp: async (email, password, name) => adopt(await api.signup(email, password, name)),
      signOut: async () => {
        await tokens.clear();
        setUser(null);
        setStatus('anonymous');
      },
      forgot: async (email) => (await api.forgot(email)).message,
      updateProfile: async (patch) => setUser(await api.updateMe(patch)),
      deleteAccount: async () => {
        await api.deleteAccount();
        await tokens.clear();
        setUser(null);
        setStatus('anonymous');
      },
    }),
    [adopt, status, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
