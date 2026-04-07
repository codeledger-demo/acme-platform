import { describe, it, expect, beforeEach } from 'vitest';
import { EmailChannel } from '../src/channels/email.js';
import type { EmailConfig } from '../src/channels/email.js';

const TEST_CONFIG: EmailConfig = {
  host: 'smtp.test.local',
  port: 587,
  secure: false,
  auth: { user: 'test@acme.dev', pass: 'test-pass' },
  from: 'noreply@acme.dev',
};

describe('EmailChannel', () => {
  let channel: EmailChannel;

  beforeEach(() => {
    channel = new EmailChannel(TEST_CONFIG);
  });

  it('should validate connection successfully', async () => {
    const result = await channel.validateConnection();
    expect(result).toBe(true);
  });

  it('should send an email and return a message ID', async () => {
    const result = await channel.send('user@example.com', 'Test Subject', '<p>Hello</p>');
    expect(result.messageId).toBeTruthy();
    expect(result.accepted).toContain('user@example.com');
    expect(result.rejected).toHaveLength(0);
  });

  it('should send a templated email with placeholder substitution', async () => {
    const template = {
      subject: 'Hello {{name}}',
      html: '<p>Welcome, {{name}}!</p>',
      text: 'Welcome, {{name}}!',
    };
    const result = await channel.sendTemplate('user@example.com', template, { name: 'Alice' });
    expect(result.messageId).toBeTruthy();
    expect(result.accepted).toContain('user@example.com');
  });

  it('should reject invalid connection config', async () => {
    const badChannel = new EmailChannel({ ...TEST_CONFIG, host: '', auth: { user: '', pass: '' } });
    const result = await badChannel.validateConnection();
    expect(result).toBe(false);
  });
});
