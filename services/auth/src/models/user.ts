/**
 * User model — types and an in-memory store for the auth service.
 */

export type UserRole = 'admin' | 'member' | 'viewer';

export interface User {
  id: string;
  email: string;
  username: string;
  passwordHash: string;
  role: UserRole;
  displayName: string | null;
  emailVerified: boolean;
  oauthProvider: string | null;
  oauthProviderId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export type UserPublic = Omit<User, 'passwordHash'>;

let nextId = 1;

function generateId(): string {
  return `usr_${String(nextId++).padStart(8, '0')}`;
}

/**
 * Simple in-memory user store. In production this would be backed by a
 * database, but for demo/test purposes a Map is sufficient.
 */
export class UserStore {
  private readonly users: Map<string, User> = new Map();
  private readonly emailIndex: Map<string, string> = new Map();

  create(data: {
    email: string;
    username: string;
    passwordHash: string;
    role?: UserRole;
    displayName?: string;
    oauthProvider?: string;
    oauthProviderId?: string;
  }): User {
    const id = generateId();
    const now = new Date();
    const user: User = {
      id,
      email: data.email.toLowerCase(),
      username: data.username,
      passwordHash: data.passwordHash,
      role: data.role ?? 'member',
      displayName: data.displayName ?? null,
      emailVerified: false,
      oauthProvider: data.oauthProvider ?? null,
      oauthProviderId: data.oauthProviderId ?? null,
      createdAt: now,
      updatedAt: now,
    };
    this.users.set(id, user);
    this.emailIndex.set(user.email, id);
    return user;
  }

  findById(id: string): User | undefined {
    return this.users.get(id);
  }

  findByEmail(email: string): User | undefined {
    const id = this.emailIndex.get(email.toLowerCase());
    return id ? this.users.get(id) : undefined;
  }

  update(id: string, data: Partial<Pick<User, 'passwordHash' | 'displayName' | 'role' | 'emailVerified'>>): User | undefined {
    const user = this.users.get(id);
    if (!user) return undefined;

    const updated: User = {
      ...user,
      ...data,
      updatedAt: new Date(),
    };
    this.users.set(id, updated);
    return updated;
  }

  delete(id: string): boolean {
    const user = this.users.get(id);
    if (!user) return false;
    this.emailIndex.delete(user.email);
    return this.users.delete(id);
  }

  count(): number {
    return this.users.size;
  }
}
