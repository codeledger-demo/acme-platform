import { formatISO } from '@acme/shared-utils';

interface InvoiceEmailData {
  name: string;
  invoiceNumber: string;
  amount: number;
  currency: string;
  dueDate: Date;
  payUrl: string;
}

interface RenderedEmail {
  subject: string;
  html: string;
  text: string;
}

export function renderInvoiceEmail(data: InvoiceEmailData): RenderedEmail {
  const { name, invoiceNumber, amount, currency, dueDate, payUrl } = data;
  const formattedAmount = `${currency} ${amount.toFixed(2)}`;
  const formattedDueDate = formatISO(dueDate);

  const subject = `Invoice ${invoiceNumber} - ${formattedAmount} due ${formattedDueDate}`;

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h1 style="color: #1e293b;">Invoice ${escapeHtml(invoiceNumber)}</h1>
  <p>Hi ${escapeHtml(name)},</p>
  <p>A new invoice has been generated for your account.</p>
  <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
    <tr style="border-bottom: 1px solid #e2e8f0;">
      <td style="padding: 8px 0; color: #64748b;">Invoice Number</td>
      <td style="padding: 8px 0; text-align: right; font-weight: bold;">${escapeHtml(invoiceNumber)}</td>
    </tr>
    <tr style="border-bottom: 1px solid #e2e8f0;">
      <td style="padding: 8px 0; color: #64748b;">Amount Due</td>
      <td style="padding: 8px 0; text-align: right; font-weight: bold;">${escapeHtml(formattedAmount)}</td>
    </tr>
    <tr>
      <td style="padding: 8px 0; color: #64748b;">Due Date</td>
      <td style="padding: 8px 0; text-align: right; font-weight: bold;">${escapeHtml(formattedDueDate)}</td>
    </tr>
  </table>
  <a href="${escapeHtml(payUrl)}"
     style="display: inline-block; padding: 12px 24px; background: #16a34a; color: #fff;
            text-decoration: none; border-radius: 6px; font-weight: bold;">
    Pay Now
  </a>
  <p style="margin-top: 24px; color: #6b7280; font-size: 14px;">
    If you have questions about this invoice, reply to this email.
  </p>
</body>
</html>`;

  const text = `Invoice ${invoiceNumber}\n\nHi ${name},\n\nAmount Due: ${formattedAmount}\nDue Date: ${formattedDueDate}\n\nPay now: ${payUrl}\n\nIf you have questions about this invoice, reply to this email.`;

  return { subject, html, text };
}

function escapeHtml(str: string): string {
  return str
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}
