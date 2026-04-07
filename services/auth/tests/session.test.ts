/**
 * Tests for the in-memory session store.
 */

import { describe, it, expect } from 'vitest';
import { InMemorySessionStore } from '../src/middleware/session.js';

function futureDate(minutes: number): Date {
  return new Date(Date.now() + minutes * 60 * 1000);
}

function pastDate(minutes: number): Date {
  return new Date(Date.now() - minutes * 60 * 1000);
}

describe('InMemorySessionStore', () => {
  it('creates and retrieves a session', () => {
    const store = new InMemorySessionStore();
    const session = store.create({
      userId: 'usr_1',
      token: 'tok_abc',
      expiresAt: futureDate(60),
    });

    expect(session.id).toBeTruthy();
    expect(session.userId).toBe('usr_1');

    const retrieved = store.get(session.id);
    expect(retrieved).toBeDefined();
    expect(retrieved?.token).toBe('tok_abc');
  });

  it('returns undefined for expired sessions', () => {
    const store = new InMemorySessionStore();
    const session = store.create({
      userId: 'usr_1',
      token: 'tok_expired',
      expiresAt: pastDate(1),
    });

    expect(store.get(session.id)).toBeUndefined();
  });

  it('looks up sessions by token', () => {
    const store = new InMemorySessionStore();
    store.create({
      userId: 'usr_1',
      token: 'tok_lookup',
      expiresAt: futureDate(60),
    });

    const found = store.getByToken('tok_lookup');
    expect(found).toBeDefined();
    expect(found?.userId).toBe('usr_1');
  });

  it('deletes a session', () => {
    const store = new InMemorySessionStore();
    const session = store.create({
      userId: 'usr_1',
      token: 'tok_del',
      expiresAt: futureDate(60),
    });

    expect(store.delete(session.id)).toBe(true);
    expect(store.get(session.id)).toBeUndefined();
  });

  it('deletes all sessions for a user', () => {
    const store = new InMemorySessionStore();
    store.create({ userId: 'usr_1', token: 'tok_a', expiresAt: futureDate(60) });
    store.create({ userId: 'usr_1', token: 'tok_b', expiresAt: futureDate(60) });
    store.create({ userId: 'usr_2', token: 'tok_c', expiresAt: futureDate(60) });

    const count = store.deleteAllForUser('usr_1');
    expect(count).toBe(2);

    expect(store.getByUserId('usr_1')).toHaveLength(0);
    expect(store.getByUserId('usr_2')).toHaveLength(1);
  });

  it('prunes expired sessions', () => {
    const store = new InMemorySessionStore();
    store.create({ userId: 'usr_1', token: 'tok_live', expiresAt: futureDate(60) });
    store.create({ userId: 'usr_2', token: 'tok_dead', expiresAt: pastDate(1) });

    const pruned = store.prune();
    expect(pruned).toBe(1);
  });
});
