import { describe, it, expect, beforeEach } from 'vitest';
import { NotificationQueue, NotificationProcessor } from '../src/queue/processor.js';
import { EmailChannel } from '../src/channels/email.js';
import { SlackChannel } from '../src/channels/slack.js';
import { InAppChannel } from '../src/channels/in-app.js';

describe('NotificationQueue', () => {
  let queue: NotificationQueue;

  beforeEach(() => {
    queue = new NotificationQueue();
  });

  it('should enqueue jobs and sort by priority', () => {
    queue.enqueue('email', { to: 'a@test.com' }, 3);
    queue.enqueue('slack', { channel: '#general' }, 1);
    queue.enqueue('in_app', { userId: 'u1' }, 2);

    const pending = queue.getPending();
    expect(pending).toHaveLength(3);
    expect(pending[0]!.channel).toBe('slack');
    expect(pending[1]!.channel).toBe('in_app');
    expect(pending[2]!.channel).toBe('email');
  });

  it('should move exhausted jobs to dead letter queue', () => {
    const job = queue.enqueue('email', { to: 'a@test.com' }, 3);
    queue.dequeue(); // attempt 1
    queue.markFailed(job.id, 'fail 1');
    queue.dequeue(); // attempt 2
    queue.markFailed(job.id, 'fail 2');
    queue.dequeue(); // attempt 3
    queue.markFailed(job.id, 'fail 3');

    expect(queue.getDeadLetterQueue()).toHaveLength(1);
    expect(queue.getDeadLetterQueue()[0]!.id).toBe(job.id);
  });
});

describe('NotificationProcessor', () => {
  it('should route email jobs to the email channel', async () => {
    const queue = new NotificationQueue();
    const emailChannel = new EmailChannel({
      host: 'smtp.test.local',
      port: 587,
      secure: false,
      auth: { user: 'test@acme.dev', pass: 'pass' },
      from: 'noreply@acme.dev',
    });

    queue.enqueue('email', { to: 'user@test.com', subject: 'Hi', html: '<p>Hi</p>' }, 2);

    const processor = new NotificationProcessor(queue, { email: emailChannel });
    const processed = await processor.processAll();

    expect(processed).toBe(1);
    expect(queue.getPending()).toHaveLength(0);
  });

  it('should fail gracefully when channel is not configured', async () => {
    const queue = new NotificationQueue();
    queue.enqueue('slack', { channel: '#test', text: 'hello' }, 2);

    const processor = new NotificationProcessor(queue, {});
    await processor.processAll();

    // Job should have failed and eventually hit dead letter
    // after max attempts through processAll re-dequeueing
    expect(queue.getPending()).toHaveLength(0);
  });
});
