import { AppError } from '../../../../packages/shared-utils/src/errors.js';

export interface HealthCheckResponse {
  status: 'ok' | 'degraded';
  service: string;
  uptime: number;
  timestamp: string;
}

const startTime = Date.now();

export function handleHealthCheck(): HealthCheckResponse {
  return {
    status: 'ok',
    service: 'auth',
    uptime: Date.now() - startTime,
    timestamp: new Date().toISOString(),
  };
}
