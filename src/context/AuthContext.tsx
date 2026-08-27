import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { authApi, UserProfile, LoginPayload, RegisterPayload } from '../api/auth.api';
import { cartApi } from '../api/cart.api';
import { clearGuestSessionId, peekGuestSessionId } from '../lib/guestSession';

interface AuthContextType {
  user: UserProfile | null;
  /** True only while the initial session probe is in flight. */
  isLoading: boolean;
  isAuthenticated: boolean;
  /**
   * Convenience for hiding admin links. NOT a security boundary — the server
   * re-reads the role from the database on every /api/admin request.
   */
  isAdmin: boolean;
  login: (payload: LoginPayload) => Promise<UserProfile>;
  register: (payload: RegisterPayload) => Promise<UserProfile>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();

  const refreshUser = useCallback(async () => {
    try {
      const { user: profile } = await authApi.getMe();
      setUser(profile);
    } catch {
      // A 401 here is the normal case for a visitor, not an error worth logging.
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  /**
   * Runs after a successful sign-in or registration.
   *
   * The guest bag is folded into the account bag, then every cached query is
   * dropped. Without the reset the bag badge, wishlist and account pages keep
   * rendering the anonymous cache — the previous implementation merged
   * server-side and left the UI showing stale data.
   *
   * A merge failure must never block authentication: the client is signed in
   * either way and their account bag is simply whatever it already contained.
   */
  const adoptSession = useCallback(
    async (profile: UserProfile) => {
      const guestSessionId = peekGuestSessionId();

      if (guestSessionId) {
        try {
          await cartApi.mergeCart(guestSessionId);
          clearGuestSessionId();
        } catch (err) {
          console.warn('[nayab] guest bag could not be merged', err);
        }
      }

      setUser(profile);
      await queryClient.invalidateQueries();
    },
    [queryClient]
  );

  const login = useCallback(
    async (payload: LoginPayload) => {
      const { user: profile } = await authApi.login(payload);
      await adoptSession(profile);
      return profile;
    },
    [adoptSession]
  );

  const register = useCallback(
    async (payload: RegisterPayload) => {
      const { user: profile } = await authApi.register(payload);
      await adoptSession(profile);
      return profile;
    },
    [adoptSession]
  );

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      // Local state is cleared even if the request failed — the cookie may
      // already be gone, and leaving a signed-out client looking signed in is
      // worse than a redundant clear.
      setUser(null);
      queryClient.clear();
    }
  }, [queryClient]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'ADMIN',
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
