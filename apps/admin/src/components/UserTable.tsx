declare namespace JSX {
  interface Element {}
  interface IntrinsicElements {
    [elemName: string]: unknown;
  }
}

import type { UserProfile } from '@acme/api-client';

export type UserAction = 'edit' | 'suspend' | 'delete';

export interface UserTableProps {
  users: UserProfile[];
  onAction: (userId: string, action: UserAction) => void;
  isLoading?: boolean;
}

function roleBadgeClass(role: string): string {
  switch (role) {
    case 'admin':
      return 'bg-purple-100 text-purple-700';
    case 'member':
      return 'bg-blue-100 text-blue-700';
    case 'viewer':
      return 'bg-neutral-100 text-neutral-600';
    default:
      return 'bg-neutral-100 text-neutral-600';
  }
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function UserTable(props: UserTableProps): JSX.Element {
  const { users, onAction, isLoading = false } = props;

  if (isLoading) {
    return <p className="py-8 text-center text-neutral-500">Loading users...</p>;
  }

  if (users.length === 0) {
    return <p className="py-8 text-center text-neutral-500">No users found.</p>;
  }

  const actions: UserAction[] = ['edit', 'suspend', 'delete'];

  return (
    <div className="overflow-x-auto rounded-xl border bg-white">
      <table className="w-full text-left text-sm">
        <thead className="border-b bg-neutral-50 text-xs uppercase text-neutral-500">
          <tr>
            <th className="px-4 py-3">Name</th>
            <th className="px-4 py-3">Email</th>
            <th className="px-4 py-3">Role</th>
            <th className="px-4 py-3">Organization</th>
            <th className="px-4 py-3">Joined</th>
            <th className="px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {users.map((user) => (
            <tr key={user.id} className="hover:bg-neutral-50">
              <td className="px-4 py-3 font-medium">{user.name}</td>
              <td className="px-4 py-3">{user.email}</td>
              <td className="px-4 py-3">
                <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${roleBadgeClass(user.role)}`}>
                  {user.role}
                </span>
              </td>
              <td className="px-4 py-3 font-mono text-xs">{user.organizationId}</td>
              <td className="px-4 py-3">{formatDate(user.createdAt)}</td>
              <td className="px-4 py-3">
                <div className="flex gap-2">
                  {actions.map((action) => (
                    <button
                      key={action}
                      className="text-xs capitalize text-indigo-600 hover:underline"
                      onClick={() => onAction(user.id, action)}
                    >
                      {action}
                    </button>
                  ))}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
