declare namespace JSX {
  interface Element {}
  interface IntrinsicElements {
    [elemName: string]: unknown;
  }
}

import { AuthApi } from '@acme/api-client';
import type { AcmeClient } from '@acme/api-client';
import { brand } from '@acme/design-tokens';

export interface LoginScreenProps {
  client: AcmeClient;
  onLoginSuccess: (token: string) => void;
}

interface LoginState {
  email: string;
  password: string;
  isLoading: boolean;
  error: string | null;
}

export function LoginScreen(props: LoginScreenProps): JSX.Element {
  const { client, onLoginSuccess } = props;
  const authApi = new AuthApi(client);

  const state: LoginState = {
    email: '',
    password: '',
    isLoading: false,
    error: null,
  };

  const handleLogin = async (): Promise<void> => {
    if (!state.email || !state.password) {
      state.error = 'Email and password are required';
      return;
    }
    state.isLoading = true;
    state.error = null;
    try {
      const res = await authApi.login(state.email, state.password);
      onLoginSuccess(res.data.accessToken);
    } catch (err: unknown) {
      state.error = err instanceof Error ? err.message : 'Login failed';
    } finally {
      state.isLoading = false;
    }
  };

  return (
    <div className="flex flex-1 flex-col items-center justify-center p-6">
      <h1 className="mb-8 text-2xl font-bold" style={{ color: brand.primary }}>
        Welcome to Acme
      </h1>

      {state.error && <p className="mb-4 text-sm text-red-500">{state.error}</p>}

      <input
        type="email"
        placeholder="Email"
        className="mb-3 w-full rounded-lg border px-4 py-3"
        value={state.email}
      />
      <input
        type="password"
        placeholder="Password"
        className="mb-6 w-full rounded-lg border px-4 py-3"
        value={state.password}
      />

      <button
        className="w-full rounded-lg py-3 text-center font-semibold text-white"
        style={{ backgroundColor: brand.primary }}
        disabled={state.isLoading}
        onClick={() => void handleLogin()}
      >
        {state.isLoading ? 'Signing in...' : 'Sign In'}
      </button>
    </div>
  );
}
