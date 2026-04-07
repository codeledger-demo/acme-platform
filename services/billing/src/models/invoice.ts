import { NotFoundError, Logger } from '@acme/shared-utils';

const logger = new Logger({ service: 'invoice-store' });

export type InvoiceStatus = 'draft' | 'open' | 'paid' | 'void' | 'uncollectible';

export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitAmount: number;
  amount: number;
}

export interface Invoice {
  id: string;
  customerId: string;
  subscriptionId: string;
  amount: number;
  currency: string;
  status: InvoiceStatus;
  lineItems: LineItem[];
  dueDate: Date;
  paidAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateInvoiceInput {
  customerId: string;
  subscriptionId: string;
  currency: string;
  lineItems: Omit<LineItem, 'id'>[];
  dueDate: Date;
}

export class InvoiceStore {
  private invoices: Map<string, Invoice> = new Map();
  private nextId = 1;
  private nextLineItemId = 1;

  create(input: CreateInvoiceInput): Invoice {
    const id = `inv_${String(this.nextId++).padStart(6, '0')}`;
    const lineItems: LineItem[] = input.lineItems.map((item) => ({
      ...item,
      id: `li_${String(this.nextLineItemId++).padStart(6, '0')}`,
    }));
    const amount = lineItems.reduce((sum, item) => sum + item.amount, 0);

    const invoice: Invoice = {
      id,
      customerId: input.customerId,
      subscriptionId: input.subscriptionId,
      amount,
      currency: input.currency,
      status: 'draft',
      lineItems,
      dueDate: input.dueDate,
      paidAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.invoices.set(id, invoice);
    logger.info('Invoice created', { id, customerId: input.customerId, amount });
    return invoice;
  }

  getById(id: string): Invoice {
    const invoice = this.invoices.get(id);
    if (!invoice) {
      throw new NotFoundError(`Invoice ${id} not found`);
    }
    return invoice;
  }

  listByCustomer(customerId: string): Invoice[] {
    return Array.from(this.invoices.values())
      .filter((inv) => inv.customerId === customerId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  listBySubscription(subscriptionId: string): Invoice[] {
    return Array.from(this.invoices.values())
      .filter((inv) => inv.subscriptionId === subscriptionId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  updateStatus(id: string, status: InvoiceStatus): Invoice {
    const invoice = this.getById(id);
    invoice.status = status;
    invoice.updatedAt = new Date();
    logger.info('Invoice status updated', { id, status });
    return invoice;
  }

  markPaid(id: string, paidAt: Date): Invoice {
    const invoice = this.getById(id);
    invoice.status = 'paid';
    invoice.paidAt = paidAt;
    invoice.updatedAt = new Date();
    logger.info('Invoice marked as paid', { id, paidAt: paidAt.toISOString() });
    return invoice;
  }

  voidInvoice(id: string): Invoice {
    const invoice = this.getById(id);
    if (invoice.status === 'paid') {
      throw new Error(`Cannot void a paid invoice: ${id}`);
    }
    invoice.status = 'void';
    invoice.updatedAt = new Date();
    logger.info('Invoice voided', { id });
    return invoice;
  }
}
