export type AlertSeverity = 'info' | 'warning' | 'critical';

interface AlertEmailData {
  name: string;
  alertType: string;
  message: string;
  severity: AlertSeverity;
  actionUrl: string;
}

interface RenderedEmail {
  subject: string;
  html: string;
  text: string;
}

const SEVERITY_STYLES: Record<AlertSeverity, { color: string; bg: string; label: string }> = {
  info: { color: '#2563eb', bg: '#eff6ff', label: 'Info' },
  warning: { color: '#d97706', bg: '#fffbeb', label: 'Warning' },
  critical: { color: '#dc2626', bg: '#fef2f2', label: 'Critical' },
};

export function renderAlertEmail(data: AlertEmailData): RenderedEmail {
  const { name, alertType, message, severity, actionUrl } = data;
  const style = SEVERITY_STYLES[severity];

  const prefix = severity === 'critical' ? '[CRITICAL] ' : severity === 'warning' ? '[WARNING] ' : '';
  const subject = `${prefix}${alertType} Alert - Action Required`;

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background: ${style.bg}; border-left: 4px solid ${style.color}; padding: 16px; margin-bottom: 16px;">
    <strong style="color: ${style.color}; text-transform: uppercase; font-size: 12px;">${style.label}</strong>
    <h2 style="color: #1e293b; margin: 8px 0 0;">${escapeHtml(alertType)}</h2>
  </div>
  <p>Hi ${escapeHtml(name)},</p>
  <p>${escapeHtml(message)}</p>
  <a href="${escapeHtml(actionUrl)}"
     style="display: inline-block; padding: 12px 24px; background: ${style.color}; color: #fff;
            text-decoration: none; border-radius: 6px; font-weight: bold;">
    View Details
  </a>
  <p style="margin-top: 24px; color: #6b7280; font-size: 14px;">
    This is an automated alert from your Acme dashboard.
  </p>
</body>
</html>`;

  const text = `[${style.label.toUpperCase()}] ${alertType} Alert\n\nHi ${name},\n\n${message}\n\nView details: ${actionUrl}\n\nThis is an automated alert from your Acme dashboard.`;

  return { subject, html, text };
}

function escapeHtml(str: string): string {
  return str
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}
