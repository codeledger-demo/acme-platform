import type { Invoice } from '@acme/api-client';

export interface InvoiceTableProps {
  invoices: Invoice[];
  onDownload?: (invoiceId: string) => void;
  isLoading?: boolean;
}

function formatCurrency(cents: number, currency: string): string {
  const amount = (cents / 100).toFixed(2);
  const symbol = currency === 'usd' ? '$' : currency.toUpperCase();
  return `${symbol}${amount}`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function statusBadgeClass(status: Invoice['status']): string {
  switch (status) {
    case 'paid':
      return 'bg-green-100 text-green-700';
    case 'open':
      return 'bg-yellow-100 text-yellow-700';
    case 'draft':
      return 'bg-neutral-100 text-neutral-600';
    case 'void':
      return 'bg-neutral-100 text-neutral-400';
    case 'uncollectible':
      return 'bg-red-100 text-red-700';
  }
}

export function InvoiceTable(props: InvoiceTableProps): JSX.Element {
  const { invoices, onDownload, isLoading = false } = props;

  if (isLoading) {
    return <p className="py-8 text-center text-neutral-500">Loading invoices...</p>;
  }

  if (invoices.length === 0) {
    return <p className="py-8 text-center text-neutral-500">No invoices found.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-neutral-200 bg-white">
      <table className="w-full text-left text-sm">
        <thead className="border-b bg-neutral-50 text-xs uppercase text-neutral-500">
          <tr>
            <th className="px-4 py-3">Date</th>
            <th className="px-4 py-3">Invoice #</th>
            <th className="px-4 py-3">Amount</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-100">
          {invoices.map((inv) => (
            <tr key={inv.id}>
              <td className="whitespace-nowrap px-4 py-3">{formatDate(inv.issuedAt)}</td>
              <td className="px-4 py-3 font-mono text-xs">{inv.id}</td>
              <td className="px-4 py-3">{formatCurrency(inv.amountCents, inv.currency)}</td>
              <td className="px-4 py-3">
                <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${statusBadgeClass(inv.status)}`}>
                  {inv.status}
                </span>
              </td>
              <td className="px-4 py-3">
                {onDownload && (
                  <button
                    className="text-indigo-600 hover:underline"
                    onClick={() => onDownload(inv.id)}
                  >
                    Download
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
