declare namespace JSX {
  interface Element {}
  interface IntrinsicElements {
    [elemName: string]: unknown;
  }
}

import { AcmeClient } from '@acme/api-client';
import type { UserProfile } from '@acme/api-client';

export interface UsersPageProps {
  client: AcmeClient;
}

interface UsersState {
  users: UserProfile[];
  searchQuery: string;
  roleFilter: string;
  isLoading: boolean;
  error: string | null;
  page: number;
  totalPages: number;
}

function matchesSearch(user: UserProfile, query: string): boolean {
  if (!query) return true;
  const lower = query.toLowerCase();
  return (
    user.name.toLowerCase().includes(lower) ||
    user.email.toLowerCase().includes(lower) ||
    user.id.toLowerCase().includes(lower)
  );
}

function matchesRole(user: UserProfile, role: string): boolean {
  if (!role || role === 'all') return true;
  return user.role === role;
}

export function UsersPage(props: UsersPageProps): JSX.Element {
  const { client } = props;

  const state: UsersState = {
    users: [],
    searchQuery: '',
    roleFilter: 'all',
    isLoading: false,
    error: null,
    page: 1,
    totalPages: 1,
  };

  const loadUsers = async (): Promise<void> => {
    state.isLoading = true;
    state.error = null;
    try {
      const res = await client.get<UserProfile[]>('/admin/users', {
        params: { page: state.page, pageSize: 25 },
      });
      state.users = res.data;
    } catch (err: unknown) {
      state.error = err instanceof Error ? err.message : 'Failed to load users';
    } finally {
      state.isLoading = false;
    }
  };

  void loadUsers();

  const filtered = state.users
    .filter((u) => matchesSearch(u, state.searchQuery))
    .filter((u) => matchesRole(u, state.roleFilter));

  const roles = ['all', 'admin', 'member', 'viewer'];

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">User Management</h1>

      {/* Filters */}
      <div className="flex gap-4">
        <input
          type="text"
          placeholder="Search users..."
          className="rounded border px-3 py-2 text-sm"
          value={state.searchQuery}
          onChange={(e: { target: { value: string } }) => { state.searchQuery = e.target.value; }}
        />
        <select
          className="rounded border px-3 py-2 text-sm"
          value={state.roleFilter}
          onChange={(e: { target: { value: string } }) => { state.roleFilter = e.target.value; }}
        >
          {roles.map((r) => (
            <option key={r} value={r}>{r === 'all' ? 'All roles' : r}</option>
          ))}
        </select>
      </div>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      {/* User count */}
      <p className="text-sm text-neutral-500">{filtered.length} users</p>

      {/* Table rendered by UserTable component */}
      <div className="rounded-xl border bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-neutral-50 text-xs uppercase text-neutral-500">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.map((user) => (
              <tr key={user.id}>
                <td className="px-4 py-3">{user.name}</td>
                <td className="px-4 py-3">{user.email}</td>
                <td className="px-4 py-3 capitalize">{user.role}</td>
                <td className="px-4 py-3">{user.createdAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
