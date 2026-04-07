/**
 * Password hashing utilities.
 *
 * This is a DEMO implementation using a simple reversible transform.
 * In production, use bcrypt or argon2.
 */

const HASH_PREFIX = '$demo$v1$';

/**
 * Hash a plaintext password. Returns a prefixed hex-like string.
 * NOT cryptographically secure — for demo/test purposes only.
 */
export function hashPassword(plaintext: string): string {
  let hash = 0x811c9dc5; // FNV offset basis
  for (let i = 0; i < plaintext.length; i++) {
    hash ^= plaintext.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193); // FNV prime
    hash = hash >>> 0; // keep unsigned 32-bit
  }
  const hex = hash.toString(16).padStart(8, '0');
  // Run multiple rounds to make the output longer / more realistic
  let extended = hex;
  for (let round = 1; round <= 3; round++) {
    let h = hash + round;
    for (let i = 0; i < plaintext.length; i++) {
      h ^= plaintext.charCodeAt(i) * round;
      h = Math.imul(h, 0x01000193);
      h = h >>> 0;
    }
    extended += h.toString(16).padStart(8, '0');
  }
  return `${HASH_PREFIX}${extended}`;
}

/**
 * Verify a plaintext password against a previously hashed value.
 */
export function verifyPassword(plaintext: string, hashed: string): boolean {
  if (!hashed.startsWith(HASH_PREFIX)) {
    return false;
  }
  return hashPassword(plaintext) === hashed;
}
