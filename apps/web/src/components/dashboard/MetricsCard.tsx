import { brand, semantic, neutral } from '@acme/design-tokens';

export interface MetricsCardProps {
  title: string;
  value: string | number;
  previousValue?: number;
  trend?: 'up' | 'down' | 'flat';
  sparklineData?: number[];
  prefix?: string;
  suffix?: string;
}

function trendColor(trend: 'up' | 'down' | 'flat'): string {
  switch (trend) {
    case 'up':
      return semantic.success;
    case 'down':
      return semantic.error;
    case 'flat':
      return neutral[400];
  }
}

function trendArrow(trend: 'up' | 'down' | 'flat'): string {
  switch (trend) {
    case 'up':
      return '\u2191';
    case 'down':
      return '\u2193';
    case 'flat':
      return '\u2192';
  }
}

function renderSparkline(data: number[]): JSX.Element {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const barWidth = 4;
  const gap = 2;
  const height = 32;

  return (
    <svg width={(barWidth + gap) * data.length} height={height} role="img" aria-label="Sparkline">
      {data.map((point, i) => {
        const barHeight = ((point - min) / range) * height;
        return (
          <rect
            key={i}
            x={i * (barWidth + gap)}
            y={height - barHeight}
            width={barWidth}
            height={barHeight}
            fill={brand.primary}
            rx={1}
          />
        );
      })}
    </svg>
  );
}

export function MetricsCard(props: MetricsCardProps): JSX.Element {
  const { title, value, trend, sparklineData, prefix, suffix } = props;

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-neutral-500">{title}</p>
      <div className="mt-2 flex items-end justify-between">
        <span className="text-2xl font-semibold">
          {prefix}{value}{suffix}
        </span>
        {trend && (
          <span className="text-sm font-medium" style={{ color: trendColor(trend) }}>
            {trendArrow(trend)}
          </span>
        )}
      </div>
      {sparklineData && sparklineData.length > 0 && (
        <div className="mt-3">{renderSparkline(sparklineData)}</div>
      )}
    </div>
  );
}
