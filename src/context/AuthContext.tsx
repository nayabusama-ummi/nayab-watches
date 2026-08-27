import React, { createContext, useContext, useEffect, useState } from 'react';
import { authApi, UserProfile, LoginPayload, RegisterPayload } from '../api/auth.api';
import { cartApi } from '../api/cart.api';

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const { user: profile } = await authApi.getMe();
      setUser(profile);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (payload: LoginPayload) => {
    const res = await authApi.login(payload);
    setUser(res.user);

    // Merge guest cart if guest session exists
    const guestSessionId = localStorage.getItem('nayab_guest_session_id');
    if (guestSessionId) {
      try {
        await cartApi.mergeCart(guestSessionId);
        localStorage.removeItem('nayab_guest_session_id');
      } catch (e) {
        console.warn('Could not merge guest cart:', e);
      }
    }
  };

  const register = async (payload: RegisterPayload) => {
    const res = await authApi.register(payload);
    setUser(res.user);

    const guestSessionId = localStorage.getItem('nayab_guest_session_id');
    if (guestSessionId) {
      try {
        await cartApi.mergeCart(guestSessionId);
        localStorage.removeItem('nayab_guest_session_id');
      } catch (e) {
        console.warn('Could not merge guest cart:', e);
      }
    }
  };

  const logout = async () => {
    await authApi.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
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
