import { AuthApi } from '@acme/api-client';
import type { UserProfile, LoginResponse } from '@acme/api-client';
import { apiClient, setClientAuth, clearClientAuth } from '../lib/api.js';

export interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface AuthActions {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loadProfile: () => Promise<void>;
}

export type UseAuthReturn = AuthState & AuthActions;

/**
 * Authentication hook.
 * In a real React app this would use useState/useEffect.
 * Here we export the shape so consumers can type-check against it.
 */
export function useAuth(): UseAuthReturn {
  const authApi = new AuthApi(apiClient);

  const state: AuthState = {
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
  };

  const login = async (email: string, password: string): Promise<void> => {
    state.isLoading = true;
    state.error = null;
    try {
      const res = await authApi.login(email, password);
      const data: LoginResponse = res.data;
      setClientAuth(data.accessToken);
      state.isAuthenticated = true;
    } catch (err: unknown) {
      state.error = err instanceof Error ? err.message : 'Login failed';
    } finally {
      state.isLoading = false;
    }
  };

  const logout = async (): Promise<void> => {
    await authApi.logout();
    clearClientAuth();
    state.user = null;
    state.isAuthenticated = false;
  };

  const loadProfile = async (): Promise<void> => {
    state.isLoading = true;
    try {
      const res = await authApi.getProfile();
      state.user = res.data;
      state.isAuthenticated = true;
    } catch {
      state.isAuthenticated = false;
    } finally {
      state.isLoading = false;
    }
  };

  return { ...state, login, logout, loadProfile };
}
