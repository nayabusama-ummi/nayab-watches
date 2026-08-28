import { apiClient } from './client';
import { mockStore } from '../data/mockStore';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  /** Resolved from the database on every protected request, never trusted from here. */
  role: 'CUSTOMER' | 'ADMIN';
  createdAt: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

/**
 * No token field. The session is an HttpOnly cookie set by the server and is
 * deliberately unreadable from JavaScript — there is nothing for the client to
 * store, and nothing an injected script could steal.
 */
export interface AuthResponse {
  user: UserProfile;
}

export const authApi = {
  register: async (payload: RegisterPayload): Promise<AuthResponse> => {
    try {
      const res = await apiClient<AuthResponse>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      if (res && res.user) {
        mockStore.saveUser(res.user);
        return res;
      }
      const user = mockStore.loginDemo(payload.email, payload.name);
      return { user };
    } catch {
      const user = mockStore.loginDemo(payload.email, payload.name);
      return { user };
    }
  },

  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    try {
      const res = await apiClient<AuthResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      if (res && res.user) {
        mockStore.saveUser(res.user);
        return res;
      }
      const user = mockStore.loginDemo(payload.email);
      return { user };
    } catch {
      const user = mockStore.loginDemo(payload.email);
      return { user };
    }
  },

  logout: async (): Promise<{ message?: string }> => {
    try {
      await apiClient<{ message?: string }>('/auth/logout', { method: 'POST' });
    } catch {}
    mockStore.saveUser(null);
    return { message: 'Logged out successfully' };
  },

  getMe: async (): Promise<{ user: UserProfile }> => {
    try {
      const res = await apiClient<{ user: UserProfile }>('/auth/me');
      if (res && res.user) {
        mockStore.saveUser(res.user);
        return res;
      }
      const user = mockStore.getUser();
      if (user) return { user };
      throw new Error('Not authenticated');
    } catch {
      const user = mockStore.getUser();
      if (user) return { user };
      throw new Error('Not authenticated');
    }
  },
};
