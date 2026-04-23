import { Logger, Config } from '@acme/shared-utils';

const config = new Config({ prefix: 'AUTH' });

export const logger = new Logger(
  { service: 'auth' },
  config.getString('LOG_LEVEL', 'info') === 'debug' ? 'debug' : 'info',
);

const rawSecret = config.getString('JWT_SECRET', '');
if (!rawSecret) {
  throw new Error('JWT_SECRET environment variable is required and must not be empty');
}
export const JWT_SECRET: string = rawSecret;

export const TOKEN_EXPIRY_SECONDS = config.getNumber('TOKEN_EXPIRY_SECONDS', 3600);
export const SESSION_TTL_SECONDS = config.getNumber('SESSION_TTL_SECONDS', 86_400);
