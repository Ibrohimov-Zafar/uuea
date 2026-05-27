import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Profile } from '@/types/types';
import { apiLogin, apiMe, apiSignup, type ApiUser } from '@/api/auth';
import { setAuthToken, toApiError } from '@/api/http';

const TOKEN_KEY = 'miaoda_token';

interface AuthContextType {
  user: ApiUser | null;
  profile: Profile | null;
  loading: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isBusinessOwner: boolean;
  /**
   * Accepts either username or email.
   * If no '@' is present, it's treated as username and we generate `${username}@miaoda.com`.
   */
  signInWithUsername: (usernameOrEmail: string, password: string) => Promise<{ error: Error | null }>;
  /**
   * Accepts username + password. Optional fullName and email.
   * If email is not provided, `${username}@miaoda.com` is used.
   */
  signUpWithUsername: (
    username: string,
    password: string,
    fullName?: string,
    email?: string,
  ) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<ApiUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const isSuperAdmin = profile?.role === 'super_admin';
  const isBusinessOwner = profile?.role === 'business_owner';
  const isAdmin = profile?.role === 'admin' || isSuperAdmin;

  const refreshProfile = async () => {
    if (!user) { setProfile(null); return; }
    try {
      const { profile: p, user: u } = await apiMe();
      setUser(u);
      setProfile(p);
    } catch {
      // token might be invalid/expired
      localStorage.removeItem(TOKEN_KEY);
      setAuthToken(null);
      setUser(null);
      setProfile(null);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setAuthToken(null);
      setUser(null);
      setProfile(null);
      setLoading(false);
      return;
    }

    setAuthToken(token);
    apiMe()
      .then(({ user: u, profile: p }) => {
        setUser(u);
        setProfile(p);
      })
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY);
        setAuthToken(null);
        setUser(null);
        setProfile(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const signInWithUsername = async (usernameOrEmail: string, password: string) => {
    try {
      const { token, user: u, profile: p } = await apiLogin(usernameOrEmail.trim(), password);
      localStorage.setItem(TOKEN_KEY, token);
      setAuthToken(token);
      setUser(u);
      setProfile(p);
      return { error: null };
    } catch (error) {
      return { error: toApiError(error) };
    }
  };

  const signUpWithUsername = async (
    username: string,
    password: string,
    fullName?: string,
    email?: string,
  ) => {
    try {
      const cleanUsername = username.trim();
      const cleanEmail = (email?.trim() || `${cleanUsername}@miaoda.com`).trim();
      const { token, user: u, profile: p } = await apiSignup({
        username: cleanUsername,
        password,
        fullName: fullName?.trim() || cleanUsername,
        email: cleanEmail,
      });
      localStorage.setItem(TOKEN_KEY, token);
      setAuthToken(token);
      setUser(u);
      setProfile(p);
      return { error: null };
    } catch (error) {
      return { error: toApiError(error) };
    }
  };

  const signOut = async () => {
    localStorage.removeItem(TOKEN_KEY);
    setAuthToken(null);
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, isAdmin, isSuperAdmin, isBusinessOwner, signInWithUsername, signUpWithUsername, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
