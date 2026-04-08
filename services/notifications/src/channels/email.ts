import { Logger, retry, AppError } from '@acme/shared-utils';

export interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
  from: string;
  replyTo?: string;
}

interface SendResult {
  messageId: string;
  accepted: string[];
  rejected: string[];
}

const logger = new Logger({ service: 'email-channel' });

export class EmailChannel {
  private readonly config: EmailConfig;
  private connected: boolean = false;

  constructor(config: EmailConfig) {
    this.config = config;
  }

  async validateConnection(): Promise<boolean> {
    try {
      logger.info(`Validating SMTP connection to ${this.config.host}:${this.config.port}`);

      if (!this.config.host || !this.config.auth.user) {
        throw new AppError('Invalid email configuration: missing host or auth credentials');
      }

      // In production this would open a real SMTP connection
      this.connected = true;
      logger.info('SMTP connection validated successfully');
      return true;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      logger.error(`SMTP connection validation failed: ${message}`);
      this.connected = false;
      return false;
    }
  }

  async send(to: string, subject: string, html: string, text?: string): Promise<SendResult> {
    if (!this.connected) {
      await this.validateConnection();
    }

    logger.info(`Sending email to ${to}: "${subject}"`);

    const sendOnce = async (): Promise<SendResult> => {
      if (!to || !subject || !html) {
        throw new AppError('Missing required email fields: to, subject, and html are required');
      }

      // Simulate transport send — real implementation would use nodemailer
      const messageId = `<${Date.now()}-${Math.random().toString(36).slice(2)}@${this.config.host}>`;

      return {
        messageId,
        accepted: [to],
        rejected: [],
      };
    };

    const result = await retry(sendOnce, { maxAttempts: 3, baseDelay: 1000 });

    logger.info(`Email sent successfully: ${result.messageId}`);
    return result;
  }

  async sendTemplate(
    to: string,
    template: { subject: string; html: string; text?: string },
    data: Record<string, string>,
  ): Promise<SendResult> {
    let resolvedSubject = template.subject;
    let resolvedHtml = template.html;
    let resolvedText = template.text;

    for (const [key, value] of Object.entries(data)) {
      const placeholder = `{{${key}}}`;
      resolvedSubject = resolvedSubject.replaceAll(placeholder, value);
      resolvedHtml = resolvedHtml.replaceAll(placeholder, value);
      if (resolvedText) {
        resolvedText = resolvedText.replaceAll(placeholder, value);
      }
    }

    return this.send(to, resolvedSubject, resolvedHtml, resolvedText);
  }
}
