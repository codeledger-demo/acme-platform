import { brand, neutral } from '@acme/design-tokens';

export interface DataPoint {
  label: string;
  value: number;
}

export interface UsageChartProps {
  data: DataPoint[];
  title?: string;
  height?: number;
  barColor?: string;
}

const DEFAULT_HEIGHT = 200;
const BAR_GAP = 4;
const LABEL_HEIGHT = 20;
const Y_AXIS_WIDTH = 40;

function formatValue(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

export function UsageChart(props: UsageChartProps): JSX.Element {
  const { data, title, height = DEFAULT_HEIGHT, barColor = brand.primary } = props;
  const chartHeight = height - LABEL_HEIGHT;
  const maxValue = Math.max(...data.map((d) => d.value), 1);

  const barCount = data.length;
  const totalWidth = 600;
  const usableWidth = totalWidth - Y_AXIS_WIDTH;
  const barWidth = barCount > 0 ? (usableWidth - BAR_GAP * barCount) / barCount : 0;

  // Y-axis tick values (0, 25%, 50%, 75%, 100%)
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((pct) => ({
    value: Math.round(maxValue * pct),
    y: chartHeight - chartHeight * pct,
  }));

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5">
      {title && (
        <h3 className="mb-4 text-sm font-semibold text-neutral-700">{title}</h3>
      )}
      <svg width={totalWidth} height={height} role="img" aria-label={title ?? 'Usage chart'}>
        {/* Y-axis ticks */}
        {ticks.map((tick) => (
          <g key={tick.value}>
            <line
              x1={Y_AXIS_WIDTH}
              y1={tick.y}
              x2={totalWidth}
              y2={tick.y}
              stroke={neutral[200]}
              strokeDasharray="4 2"
            />
            <text
              x={Y_AXIS_WIDTH - 6}
              y={tick.y + 4}
              textAnchor="end"
              fontSize={10}
              fill={neutral[400]}
            >
              {formatValue(tick.value)}
            </text>
          </g>
        ))}

        {/* Bars */}
        {data.map((point, i) => {
          const barHeight = (point.value / maxValue) * chartHeight;
          const x = Y_AXIS_WIDTH + i * (barWidth + BAR_GAP);
          const y = chartHeight - barHeight;

          return (
            <g key={point.label}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                fill={barColor}
                rx={2}
              />
              <text
                x={x + barWidth / 2}
                y={height - 4}
                textAnchor="middle"
                fontSize={10}
                fill={neutral[500]}
              >
                {point.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
