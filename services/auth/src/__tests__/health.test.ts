import { describe, it, expect } from 'vitest';
import { handleHealthCheck } from '../routes/health.js';

describe('health check', () => {
  it('returns ok status', () => {
    const result = handleHealthCheck();
    expect(result.status).toBe('ok');
    expect(result.service).toBe('auth');
    expect(typeof result.uptime).toBe('number');
  });
});
