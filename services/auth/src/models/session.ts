/**
 * Session model — type definitions for auth sessions.
 */

export interface Session {
  id: string;
  userId: string;
  token: string;
  refreshToken: string | null;
  expiresAt: Date;
  createdAt: Date;
  lastAccessedAt: Date;
  ipAddress: string | null;
  userAgent: string | null;
  revoked: boolean;
}

export interface SessionMetadata {
  ipAddress: string | null;
  userAgent: string | null;
}

export interface SessionCreateInput {
  userId: string;
  token: string;
  refreshToken?: string;
  expiresAt: Date;
  metadata?: SessionMetadata;
}
