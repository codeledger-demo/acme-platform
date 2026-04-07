/**
 * Session management — store interface and in-memory implementation.
 *
 * Sessions are created on login, refreshed on activity, and deleted on
 * logout or expiry.
 */

import type { Session, SessionCreateInput, SessionMetadata } from '../models/session.js';
import { logger } from '../index.js';

// ---------------------------------------------------------------------------
// Session store interface
// ---------------------------------------------------------------------------

export interface SessionStore {
  create(input: SessionCreateInput): Session;
  get(sessionId: string): Session | undefined;
  getByToken(token: string): Session | undefined;
  getByUserId(userId: string): Session[];
  refresh(sessionId: string): Session | undefined;
  delete(sessionId: string): boolean;
  deleteAllForUser(userId: string): number;
  prune(): number;
}

// ---------------------------------------------------------------------------
// In-memory implementation
// ---------------------------------------------------------------------------

let nextSessionId = 1;

function generateSessionId(): string {
  return `ses_${String(nextSessionId++).padStart(10, '0')}`;
}

export class InMemorySessionStore implements SessionStore {
  private readonly sessions: Map<string, Session> = new Map();
  private readonly tokenIndex: Map<string, string> = new Map();

  create(input: SessionCreateInput): Session {
    const id = generateSessionId();
    const now = new Date();

    const session: Session = {
      id,
      userId: input.userId,
      token: input.token,
      refreshToken: input.refreshToken ?? null,
      expiresAt: input.expiresAt,
      createdAt: now,
      lastAccessedAt: now,
      ipAddress: input.metadata?.ipAddress ?? null,
      userAgent: input.metadata?.userAgent ?? null,
      revoked: false,
    };

    this.sessions.set(id, session);
    this.tokenIndex.set(session.token, id);

    logger.debug('Session created', { sessionId: id, userId: input.userId });
    return session;
  }

  get(sessionId: string): Session | undefined {
    const session = this.sessions.get(sessionId);
    if (!session) return undefined;
    if (this.isExpired(session)) {
      this.delete(sessionId);
      return undefined;
    }
    return session;
  }

  getByToken(token: string): Session | undefined {
    const id = this.tokenIndex.get(token);
    if (!id) return undefined;
    return this.get(id);
  }

  getByUserId(userId: string): Session[] {
    const results: Session[] = [];
    for (const session of this.sessions.values()) {
      if (session.userId === userId && !this.isExpired(session) && !session.revoked) {
        results.push(session);
      }
    }
    return results;
  }

  refresh(sessionId: string): Session | undefined {
    const session = this.sessions.get(sessionId);
    if (!session || this.isExpired(session) || session.revoked) {
      return undefined;
    }

    const refreshed: Session = {
      ...session,
      lastAccessedAt: new Date(),
    };
    this.sessions.set(sessionId, refreshed);
    return refreshed;
  }

  delete(sessionId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;
    this.tokenIndex.delete(session.token);
    return this.sessions.delete(sessionId);
  }

  deleteAllForUser(userId: string): number {
    let count = 0;
    for (const [id, session] of this.sessions) {
      if (session.userId === userId) {
        this.tokenIndex.delete(session.token);
        this.sessions.delete(id);
        count++;
      }
    }
    logger.debug('Deleted all sessions for user', { userId, count });
    return count;
  }

  /**
   * Remove all expired or revoked sessions from the store.
   * Returns the number of pruned sessions.
   */
  prune(): number {
    let count = 0;
    const now = new Date();
    for (const [id, session] of this.sessions) {
      if (session.revoked || session.expiresAt <= now) {
        this.tokenIndex.delete(session.token);
        this.sessions.delete(id);
        count++;
      }
    }
    if (count > 0) {
      logger.info('Pruned expired sessions', { count });
    }
    return count;
  }

  private isExpired(session: Session): boolean {
    return session.expiresAt <= new Date() || session.revoked;
  }
}

// ---------------------------------------------------------------------------
// Convenience functions (use the default store singleton)
// ---------------------------------------------------------------------------

const defaultStore = new InMemorySessionStore();

export function createSession(input: SessionCreateInput): Session {
  return defaultStore.create(input);
}

export function getSession(sessionId: string): Session | undefined {
  return defaultStore.get(sessionId);
}

export function getSessionByToken(token: string): Session | undefined {
  return defaultStore.getByToken(token);
}

export function deleteSession(sessionId: string): boolean {
  return defaultStore.delete(sessionId);
}

export function refreshSession(sessionId: string): Session | undefined {
  return defaultStore.refresh(sessionId);
}
