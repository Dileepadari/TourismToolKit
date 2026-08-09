'use client';

import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useApolloClient } from '@apollo/client/react';
import { LOGOUT_MUTATION, ME_QUERY, REFRESH_SESSION_MUTATION } from '@/graphql/queries';
import type { LogoutData, MeData, RefreshSessionData } from '@/graphql/types';
import { User } from '../utils/types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  /** Called after a successful login/register mutation; the cookie is already set. */
  onSignedIn: (user: User) => void;
  logout: (everywhere?: boolean) => Promise<void>;
  updateUser: (user: Partial<User>) => void;
  refresh: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Authentication state.
 *
 * There is no token in here. The access and refresh tokens live in HttpOnly
 * cookies the browser attaches automatically - script cannot read them, so an
 * XSS can no longer walk off with a session. The previous version kept the JWT
 * in localStorage and mirrored it into a readable cookie.
 *
 * The session is therefore established by asking the server who we are, not by
 * reading local state.
 */
/**
 * Whether this browser has a session worth trying to refresh.
 *
 * `tt_session` is the deliberately readable marker set alongside the HttpOnly
 * credentials. Without this check every anonymous page load fired a
 * `refreshSession` mutation that could only fail - a wasted round trip on the
 * most common path, and enough of them to exhaust the endpoint's rate limit and
 * lock real users out of signing in.
 */
function hasSessionMarker(): boolean {
  if (typeof document === 'undefined') return false;
  return document.cookie.split('; ').some((entry) => entry.startsWith('tt_session='));
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const client = useApolloClient();

  const loadCurrentUser = useCallback(async (): Promise<User | null> => {
    const { data } = await client.query<MeData>({
      query: ME_QUERY,
      fetchPolicy: 'network-only',
    });
    return data?.me ?? null;
  }, [client]);

  const refresh = useCallback(async (): Promise<boolean> => {
    try {
      const { data } = await client.mutate<RefreshSessionData>({
        mutation: REFRESH_SESSION_MUTATION,
      });
      if (data?.refreshSession?.success && data.refreshSession.user) {
        setUser(data.refreshSession.user);
        return true;
      }
    } catch {
      // Network or server error - treat as signed out.
    }
    setUser(null);
    return false;
  }, [client]);

  // Resolve the session once on mount. The access token is short-lived, so a
  // returning visitor usually needs the refresh cookie exchanged for a new one.
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const current = await loadCurrentUser();
        if (cancelled) return;

        if (current) {
          setUser(current);
        } else if (hasSessionMarker()) {
          await refresh();
        } else {
          setUser(null);
        }
      } catch {
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [loadCurrentUser, refresh]);

  // Keep the short-lived access token fresh while the tab is open, so a long
  // session does not expire mid-use.
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(() => void refresh(), 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, [user, refresh]);

  const onSignedIn = useCallback(
    (signedIn: User) => {
      setUser(signedIn);
      router.push('/dashboard');
    },
    [router],
  );

  const logout = useCallback(
    async (everywhere = false) => {
      try {
        // Server-side revocation - this is what a stateless token could not do.
        await client.mutate<LogoutData>({
          mutation: LOGOUT_MUTATION,
          variables: { everywhere },
        });
      } catch {
        // Even if the call fails, drop local state and send the user to login.
      }
      setUser(null);
      await client.clearStore();
      router.push('/auth/login');
    },
    [client, router],
  );

  const updateUser = useCallback((updates: Partial<User>) => {
    setUser((current) => (current ? { ...current, ...updates } : current));
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: user !== null,
        isLoading,
        onSignedIn,
        logout,
        updateUser,
        refresh,
      }}
    >
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
