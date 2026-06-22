import {
  ResponsiveContainer,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Bar,
  Cell,
  type TooltipProps,
} from 'recharts';
import { cn } from '../../lib/utils';

interface BarConfig {
  key: string;
  name: string;
  color: string;
}

interface BarChartCardProps {
  title: string;
  subtitle?: string;
  data: any[];
  xKey: string;
  bars: BarConfig[];
  height?: number;
  showLegend?: boolean;
}

function CustomTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload || !payload.length) return null;

  return (
    <div
      className={cn(
        'glass-card px-4 py-3 min-w-[180px]',
        'backdrop-blur-xl border border-white/15 shadow-2xl'
      )}
    >
      <p className="text-xs font-semibold text-white/70 mb-2.5 pb-2 border-b border-white/10">
        {label}
      </p>
      <div className="space-y-1.5">
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-sm"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-xs text-white/60">{entry.name}</span>
            </div>
            <span className="text-sm font-semibold text-white">
              {typeof entry.value === 'number'
                ? entry.value.toLocaleString()
                : entry.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function CustomLegend({ payload }: any) {
  if (!payload || !payload.length) return null;

  return (
    <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 pt-2">
      {payload.map((entry: any, index: number) => (
        <div key={index} className="flex items-center gap-2">
          <span
            className="w-3 h-3 rounded-sm"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-xs font-medium text-white/60">{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

export default function BarChartCard({
  title,
  subtitle,
  data,
  xKey,
  bars,
  height = 320,
  showLegend = true,
}: BarChartCardProps) {
  return (
    <div className="glass-card p-6 w-full">
      <div className="mb-5">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        {subtitle && (
          <p className="mt-1 text-sm text-white/50">{subtitle}</p>
        )}
      </div>

      <div style={{ width: '100%', height }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <defs>
              {bars.map((bar, index) => (
                <linearGradient
                  key={`bar-gradient-${index}`}
                  id={`bar-gradient-${bar.key}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor={bar.color} stopOpacity={1} />
                  <stop offset="100%" stopColor={bar.color} stopOpacity={0.6} />
                </linearGradient>
              ))}
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.06)"
              vertical={false}
            />

            <XAxis
              dataKey={xKey}
              axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
              tickLine={false}
              tick={{ fill: 'rgba(255,255,255,0.45)', fontSize: 12 }}
              dy={10}
            />

            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'rgba(255,255,255,0.45)', fontSize: 12 }}
              width={40}
            />

            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: 'rgba(255,255,255,0.04)' }}
            />

            {showLegend && (
              <Legend content={<CustomLegend />} wrapperStyle={{ paddingTop: 16 }} />
            )}

            {bars.map((bar, index) => (
              <Bar
                key={index}
                dataKey={bar.key}
                name={bar.name}
                fill={`url(#bar-gradient-${bar.key})`}
                radius={[6, 6, 0, 0]}
                maxBarSize={48}
              >
                {data.map((_, i) => (
                  <Cell
                    key={`cell-${i}`}
                    className="transition-all duration-200 hover:opacity-80"
                  />
                ))}
              </Bar>
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
