interface WelcomeEmailData {
  name: string;
  email: string;
  verifyUrl: string;
}

interface RenderedEmail {
  subject: string;
  html: string;
  text: string;
}

export function renderWelcomeEmail(data: WelcomeEmailData): RenderedEmail {
  const { name, email, verifyUrl } = data;

  const subject = `Welcome to Acme, ${name}!`;

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h1 style="color: #2563eb;">Welcome to Acme, ${escapeHtml(name)}!</h1>
  <p>Thanks for signing up with <strong>${escapeHtml(email)}</strong>.</p>
  <p>Please verify your email address to get started:</p>
  <a href="${escapeHtml(verifyUrl)}"
     style="display: inline-block; padding: 12px 24px; background: #2563eb; color: #fff;
            text-decoration: none; border-radius: 6px; font-weight: bold;">
    Verify Email
  </a>
  <p style="margin-top: 24px; color: #6b7280; font-size: 14px;">
    If you didn't create this account, you can safely ignore this email.
  </p>
</body>
</html>`;

  const text = `Welcome to Acme, ${name}!\n\nThanks for signing up with ${email}.\n\nPlease verify your email address: ${verifyUrl}\n\nIf you didn't create this account, you can safely ignore this email.`;

  return { subject, html, text };
}

function escapeHtml(str: string): string {
  return str
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}
