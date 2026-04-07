declare namespace JSX {
  interface Element {}
  interface IntrinsicElements {
    [elemName: string]: unknown;
  }
}

import { brand, semantic, neutral } from '@acme/design-tokens';

export interface MetricCardProps {
  label: string;
  value: string | number;
  trend?: 'up' | 'down' | 'flat';
  subtitle?: string;
}

function trendIndicator(trend: 'up' | 'down' | 'flat'): { symbol: string; color: string } {
  switch (trend) {
    case 'up':
      return { symbol: '\u2191', color: semantic.success };
    case 'down':
      return { symbol: '\u2193', color: semantic.error };
    case 'flat':
      return { symbol: '\u2192', color: neutral[400] };
  }
}

export function MetricCard(props: MetricCardProps): JSX.Element {
  const { label, value, trend, subtitle } = props;
  const indicator = trend ? trendIndicator(trend) : null;

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-medium text-neutral-500">{label}</p>
      <div className="mt-1 flex items-baseline gap-2">
        <span className="text-xl font-bold">{value}</span>
        {indicator && (
          <span className="text-sm" style={{ color: indicator.color }}>
            {indicator.symbol}
          </span>
        )}
      </div>
      {subtitle && <p className="mt-1 text-xs text-neutral-400">{subtitle}</p>}
    </div>
  );
}
