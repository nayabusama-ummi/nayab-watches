import { apiClient } from './client';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
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

export interface AuthResponse {
  user: UserProfile;
  token?: string;
}

export const authApi = {
  register: (payload: RegisterPayload): Promise<AuthResponse> => {
    return apiClient<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  login: (payload: LoginPayload): Promise<AuthResponse> => {
    return apiClient<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  logout: (): Promise<{ message: string }> => {
    return apiClient<{ message: string }>('/auth/logout', {
      method: 'POST',
    });
  },

  getMe: (): Promise<{ user: UserProfile }> => {
    return apiClient<{ user: UserProfile }>('/auth/me');
  },
};
