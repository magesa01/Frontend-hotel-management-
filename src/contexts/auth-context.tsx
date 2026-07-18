import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { authService } from '@/services/auth.service';
import { clearStoredSession, getStoredToken, getStoredUser } from '@/api/client';
import type { User, UserRole } from '@/types';

interface RegisterInput {
  fullName: string;
  email: string;
  phoneNumber: string;
  password: string;
}

interface AuthContextValue {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (input: RegisterInput) => Promise<{ requiresEmailConfirmation: boolean }>;
  logout: () => void;
  updateProfile: (patch: Partial<User>) => void;
  hasRole: (...roles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = getStoredToken();
    const storedUser = getStoredUser();
    if (storedToken && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
      } catch {
        clearStoredSession();
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { user: u, token: t } = await authService.login(email, password);
    setUser(u);
    setToken(t);
  }, []);

  const register = useCallback(async (input: RegisterInput) => {
    const result = await authService.register(input);
    if ('requiresEmailConfirmation' in result) {
      return { requiresEmailConfirmation: true };
    }
    setUser(result.user);
    setToken(result.token);
    return { requiresEmailConfirmation: false };
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    clearStoredSession();
    setUser(null);
    setToken(null);
  }, []);

  const updateProfile = useCallback((patch: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...patch } : prev));
    const stored = getStoredUser();
    if (stored && user) {
      localStorage.setItem('aurelia.hms.user', JSON.stringify({ ...user, ...patch }));
    }
  }, [user]);

  const hasRole = useCallback(
    (...roles: UserRole[]) => (user ? roles.includes(user.role) : false),
    [user]
  );

  const value = useMemo<AuthContextValue>(
    () => ({ user, token, loading, login, register, logout, updateProfile, hasRole }),
    [user, token, loading, login, register, logout, updateProfile, hasRole]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}