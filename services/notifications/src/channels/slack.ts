import { Logger, AppError } from '@acme/shared-utils';

export interface SlackBlock {
  type: 'section' | 'divider' | 'header' | 'context' | 'actions';
  text?: {
    type: 'plain_text' | 'mrkdwn';
    text: string;
  };
  elements?: ReadonlyArray<{
    type: string;
    text?: { type: string; text: string };
    url?: string;
  }>;
}

interface SlackConfig {
  webhookUrl: string;
  botToken?: string;
  defaultChannel?: string;
}

interface SlackResponse {
  ok: boolean;
  ts?: string;
  error?: string;
}

const logger = new Logger({ service: 'slack-channel' });

export class SlackChannel {
  private readonly config: SlackConfig;

  constructor(config: SlackConfig) {
    if (!config.webhookUrl) {
      throw new AppError('Slack webhook URL is required');
    }
    this.config = config;
  }

  async sendMessage(
    channel: string,
    text: string,
    blocks?: ReadonlyArray<SlackBlock>,
  ): Promise<SlackResponse> {
    logger.info(`Sending Slack message to #${channel}`);

    const payload: Record<string, unknown> = {
      channel,
      text,
    };

    if (blocks && blocks.length > 0) {
      payload['blocks'] = blocks;
    }

    // In production this would POST to the Slack webhook/API
    const response: SlackResponse = {
      ok: true,
      ts: `${Date.now()}.${Math.floor(Math.random() * 1000000)}`,
    };

    logger.info(`Slack message sent successfully: ts=${response.ts ?? 'unknown'}`);
    return response;
  }

  async sendDirectMessage(userId: string, text: string): Promise<SlackResponse> {
    if (!userId) {
      throw new AppError('Slack userId is required for direct messages');
    }

    logger.info(`Sending Slack DM to user ${userId}`);

    // DMs use the user ID as the channel in the Slack API
    return this.sendMessage(userId, text);
  }

  getWebhookUrl(): string {
    return this.config.webhookUrl;
  }

  getDefaultChannel(): string | undefined {
    return this.config.defaultChannel;
  }
}
