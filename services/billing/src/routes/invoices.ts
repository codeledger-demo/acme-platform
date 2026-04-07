import { Logger, AppError } from '@acme/shared-utils';
import { validateInvoice } from '@acme/validation';
import { InvoiceStore } from '../models/invoice.js';
import type { Invoice } from '../models/invoice.js';
import { StripeClient } from '../stripe/client.js';

const logger = new Logger({ service: 'invoice-routes' });

export interface InvoiceResponse {
  success: boolean;
  data?: Invoice | Invoice[];
  error?: string;
}

export function listInvoices(
  customerId: string,
  store: InvoiceStore,
): InvoiceResponse {
  const invoices = store.listByCustomer(customerId);
  logger.info('Listed invoices', { customerId, count: invoices.length });
  return { success: true, data: invoices };
}

export function getInvoice(
  id: string,
  store: InvoiceStore,
): InvoiceResponse {
  const invoice = store.getById(id);
  return { success: true, data: invoice };
}

export function voidInvoice(
  id: string,
  store: InvoiceStore,
): InvoiceResponse {
  logger.info('Voiding invoice', { id });
  const invoice = store.voidInvoice(id);
  return { success: true, data: invoice };
}

export async function retryPayment(
  invoiceId: string,
  store: InvoiceStore,
  stripeClient: StripeClient,
): Promise<InvoiceResponse> {
  const invoice = store.getById(invoiceId);

  if (invoice.status !== 'open' && invoice.status !== 'uncollectible') {
    throw new AppError(
      `Cannot retry payment for invoice with status: ${invoice.status}`,
      { code: 'INVALID_INVOICE_STATUS' },
    );
  }

  logger.info('Retrying payment', { invoiceId, amount: invoice.amount });

  await stripeClient.createPaymentIntent({
    amount: invoice.amount,
    currency: invoice.currency,
    customerId: invoice.customerId,
  });

  store.updateStatus(invoiceId, 'open');
  const updated = store.getById(invoiceId);

  return { success: true, data: updated };
}
