import { AcmeClient } from '@acme/api-client';

/**
 * Configured API client instance.
 * Reads the base URL from the NEXT_PUBLIC_API_URL environment variable,
 * defaulting to localhost for development.
 */

const BASE_URL: string =
  (typeof process !== 'undefined' && process.env?.['NEXT_PUBLIC_API_URL']) ||
  'http://localhost:3001';

export const apiClient = new AcmeClient({ baseUrl: BASE_URL });

/**
 * Set the auth token on the shared client instance.
 */
export function setClientAuth(token: string): void {
  apiClient.setAuthToken(token);
}

/**
 * Clear auth from the shared client instance (e.g. on logout).
 */
export function clearClientAuth(): void {
  apiClient.clearAuthToken();
}
