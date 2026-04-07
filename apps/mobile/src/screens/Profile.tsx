declare namespace JSX {
  interface Element {}
  interface IntrinsicElements {
    [elemName: string]: unknown;
  }
}

import { AuthApi } from '@acme/api-client';
import type { AcmeClient, UserProfile } from '@acme/api-client';

export interface ProfileScreenProps {
  client: AcmeClient;
  onLogout: () => void;
}

interface ProfileState {
  user: UserProfile | null;
  isLoading: boolean;
  error: string | null;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function ProfileScreen(props: ProfileScreenProps): JSX.Element {
  const { client, onLogout } = props;
  const authApi = new AuthApi(client);

  const state: ProfileState = {
    user: null,
    isLoading: false,
    error: null,
  };

  const loadProfile = async (): Promise<void> => {
    state.isLoading = true;
    try {
      const res = await authApi.getProfile();
      state.user = res.data;
    } catch (err: unknown) {
      state.error = err instanceof Error ? err.message : 'Failed to load profile';
    } finally {
      state.isLoading = false;
    }
  };

  void loadProfile();

  const user = state.user;

  return (
    <div className="flex flex-1 flex-col p-4">
      <h1 className="mb-6 text-xl font-bold">Profile</h1>

      {state.error && <p className="text-sm text-red-500">{state.error}</p>}

      {user && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-lg font-bold text-indigo-600">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-semibold">{user.name}</p>
              <p className="text-sm text-neutral-500">{user.email}</p>
            </div>
          </div>

          <div className="rounded-xl border bg-neutral-50 p-4 text-sm">
            <p><strong>Role:</strong> {user.role}</p>
            <p><strong>Organization:</strong> {user.organizationId}</p>
            <p><strong>Member since:</strong> {formatDate(user.createdAt)}</p>
          </div>

          <button
            className="mt-4 w-full rounded-lg border border-red-300 py-3 text-center text-red-600"
            onClick={onLogout}
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
