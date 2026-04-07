import { Logger, AppError } from '@acme/shared-utils';
import { EmailChannel } from '../channels/email.js';
import { SlackChannel } from '../channels/slack.js';
import { InAppChannel } from '../channels/in-app.js';

type JobChannel = 'email' | 'slack' | 'in_app';
type JobStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'dead';
type JobPriority = 1 | 2 | 3 | 4 | 5; // 1 = highest

export interface NotificationJob {
  id: string;
  channel: JobChannel;
  priority: JobPriority;
  status: JobStatus;
  attempts: number;
  maxAttempts: number;
  payload: Record<string, unknown>;
  createdAt: Date;
  lastAttemptAt?: Date;
  error?: string;
}

const logger = new Logger({ service: 'notification-queue' });

const MAX_ATTEMPTS = 3;

export class NotificationQueue {
  private readonly queue: NotificationJob[] = [];
  private readonly deadLetter: NotificationJob[] = [];

  enqueue(
    channel: JobChannel,
    payload: Record<string, unknown>,
    priority: JobPriority = 3,
  ): NotificationJob {
    const job: NotificationJob = {
      id: `job_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      channel,
      priority,
      status: 'pending',
      attempts: 0,
      maxAttempts: MAX_ATTEMPTS,
      payload,
      createdAt: new Date(),
    };

    this.queue.push(job);
    this.queue.sort((a, b) => a.priority - b.priority);

    logger.info(`Job ${job.id} enqueued on channel=${channel} priority=${priority}`);
    return job;
  }

  dequeue(): NotificationJob | undefined {
    const index = this.queue.findIndex((j) => j.status === 'pending');
    if (index === -1) return undefined;

    const job = this.queue[index]!;
    job.status = 'processing';
    job.attempts += 1;
    job.lastAttemptAt = new Date();
    return job;
  }

  markCompleted(jobId: string): void {
    const job = this.queue.find((j) => j.id === jobId);
    if (!job) throw new AppError(`Job ${jobId} not found in queue`);
    job.status = 'completed';
    logger.info(`Job ${jobId} completed`);
  }

  markFailed(jobId: string, error: string): void {
    const job = this.queue.find((j) => j.id === jobId);
    if (!job) throw new AppError(`Job ${jobId} not found in queue`);

    job.error = error;

    if (job.attempts >= job.maxAttempts) {
      job.status = 'dead';
      this.deadLetter.push(job);
      logger.error(`Job ${jobId} moved to dead letter queue after ${job.attempts} attempts: ${error}`);
    } else {
      job.status = 'pending';
      logger.warn(`Job ${jobId} failed (attempt ${job.attempts}/${job.maxAttempts}): ${error}`);
    }
  }

  retryFailed(): number {
    let retried = 0;
    for (const job of this.queue) {
      if (job.status === 'failed') {
        job.status = 'pending';
        retried++;
      }
    }
    logger.info(`Retried ${retried} failed jobs`);
    return retried;
  }

  getPending(): NotificationJob[] {
    return this.queue.filter((j) => j.status === 'pending');
  }

  getDeadLetterQueue(): NotificationJob[] {
    return [...this.deadLetter];
  }
}

interface ChannelMap {
  email?: EmailChannel;
  slack?: SlackChannel;
  in_app?: InAppChannel;
}

export class NotificationProcessor {
  private readonly queue: NotificationQueue;
  private readonly channels: ChannelMap;
  private readonly logger: Logger;

  constructor(queue: NotificationQueue, channels: ChannelMap) {
    this.queue = queue;
    this.channels = channels;
    this.logger = new Logger({ service: 'notification-processor' });
  }

  async processNext(): Promise<boolean> {
    const job = this.queue.dequeue();
    if (!job) return false;

    try {
      await this.route(job);
      this.queue.markCompleted(job.id);
      return true;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.queue.markFailed(job.id, message);
      return true;
    }
  }

  async processAll(): Promise<number> {
    let processed = 0;
    while (await this.processNext()) {
      processed++;
    }
    this.logger.info(`Processed ${processed} jobs`);
    return processed;
  }

  private async route(job: NotificationJob): Promise<void> {
    switch (job.channel) {
      case 'email': {
        const email = this.channels.email;
        if (!email) throw new AppError('Email channel not configured');
        const to = job.payload['to'] as string;
        const subject = job.payload['subject'] as string;
        const html = job.payload['html'] as string;
        const text = job.payload['text'] as string | undefined;
        await email.send(to, subject, html, text);
        break;
      }
      case 'slack': {
        const slack = this.channels.slack;
        if (!slack) throw new AppError('Slack channel not configured');
        const channel = job.payload['channel'] as string;
        const text = job.payload['text'] as string;
        await slack.sendMessage(channel, text);
        break;
      }
      case 'in_app': {
        const inApp = this.channels.in_app;
        if (!inApp) throw new AppError('In-app channel not configured');
        const userId = job.payload['userId'] as string;
        const notification = job.payload['notification'] as {
          title: string;
          body: string;
          priority: 'low' | 'normal' | 'high' | 'urgent';
          actionUrl?: string;
        };
        await inApp.send(userId, notification);
        break;
      }
      default:
        throw new AppError(`Unknown notification channel: ${String(job.channel)}`);
    }
  }
}
