"use client";
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { API_BASE, fetchJSON } from '../lib/api';

interface AuthContextType {
  isAuthenticated: boolean;
  user: { id: number; email: string } | null;
  mode: 'signin' | 'signup' | 'forgot-password' | null;
  setMode: (mode: 'signin' | 'signup' | 'forgot-password' | null) => void;
  login: (email: string, password: string) => Promise<{ error?: string } | undefined>;
  signup: (email: string, password: string) => Promise<{ error?: string } | undefined>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<{ id: number; email: string } | null>(null);
  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot-password' | null>(null);

  // Check session on mount
  React.useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const data = await fetchJSON(`${API_BASE}/api/session`, {
        credentials: 'include',
      });
      if (data && data.authenticated) {
        setIsAuthenticated(true);
        setUser(data.user);
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch {
      setIsAuthenticated(false);
      setUser(null);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const data = await fetchJSON(`${API_BASE}/api/login`, {
        method: 'POST',
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });
      if (data && !data.error) {
        setIsAuthenticated(true);
        setUser(data.user);
        return {};
      } else {
        setIsAuthenticated(false);
        setUser(null);
        return { error: data?.error || 'Login failed' };
      }
    } catch {
      setIsAuthenticated(false);
      setUser(null);
      return { error: 'Network error' };
    }
  };

  const signup = async (email: string, password: string) => {
    try {
      const data = await fetchJSON(`${API_BASE}/api/signup`, {
        method: 'POST',
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });
      if (data && !data.error) {
        setIsAuthenticated(true);
        setUser(data.user);
        return {};
      } else {
        setIsAuthenticated(false);
        setUser(null);
        return { error: data?.error || 'Signup failed' };
      }
    } catch {
      setIsAuthenticated(false);
      setUser(null);
      return { error: 'Network error' };
    }
  };

  const logout = async () => {
    await fetchJSON(`${API_BASE}/api/logout`, {
      method: 'POST',
      credentials: 'include',
    });
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, mode, setMode, login, signup, logout, checkSession }}>
      {children}
    </AuthContext.Provider>
  );
};


export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
