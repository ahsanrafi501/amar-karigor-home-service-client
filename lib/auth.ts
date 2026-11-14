'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { ApiResponse, User } from '@/types';
import { establishSession, SessionOrder } from '@/lib/session-order';
export type { User } from '@/types';
type AuthContextType = { user: User | null; loading: boolean; error: string | null; login: (payload: { email: string; password: string }) => Promise<User>; register: (payload: { name: string; email: string; password: string }) => Promise<void>; logout: () => Promise<void>; refresh: () => Promise<User | null>; };

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const sessionOrder = useRef(new SessionOrder());
  const refresh = useCallback(async () => {
    const current = sessionOrder.current.begin();
    setError(null);
    try { const result = await api.get<ApiResponse<{ userProfile: User | null }>>('/user/my-profile'); if (current()) setUser(result.data.userProfile); return result.data.userProfile; }
    catch (cause) { if (current()) { setUser(null); setError(cause instanceof Error ? cause.message : 'Session unavailable'); } return null; }
    finally { if (current()) setLoading(false); }
  }, []);
  useEffect(() => { void refresh(); }, [refresh]);
  const login = useCallback(async (payload: { email: string; password: string }) => {
    const current = sessionOrder.current.begin();
    setLoading(true);
    try {
    const identity = await establishSession(
      () => api.post('/auth/login', payload),
      async () => { await queryClient.cancelQueries(); queryClient.clear(); const response = await api.get<ApiResponse<{ userProfile: User }>>('/user/my-profile'); return response.data.userProfile; },
      () => { if (current()) { setUser(null); setError(null); } },
    );
    if (current()) { setUser(identity); setError(null); } return identity;
    } finally { if (current()) setLoading(false); }
  }, [queryClient]);
  const register = useCallback(async (payload: { name: string; email: string; password: string }) => { await api.post('/user/register', payload); }, []);
  const logout = useCallback(async () => {
    const current = sessionOrder.current.begin();
    await api.post('/auth/logout');
    await queryClient.cancelQueries(); queryClient.clear(); if (current()) { setUser(null); setError(null); setLoading(false); }
  }, [queryClient]);
  const value = useMemo(() => ({ user, loading, error, login, register, logout, refresh }), [user, loading, error, login, register, logout, refresh]);

  return React.createElement(AuthContext.Provider, { value }, children);
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
