import type { ComponentType } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '../../utils';

interface KpiCardProps {
  title: string;
  value: number | string;
  unit?: string;
  icon: ComponentType<{ className?: string }>;
  trend?: number;
  gradientClass?: string;
  colorClass?: string;
  delay?: number;
}

export default function KpiCard({
  title,
  value,
  unit,
  icon: Icon,
  trend,
  gradientClass = 'bg-gradient-kpi1',
  colorClass = 'text-primary-400',
  delay = 0,
}: KpiCardProps) {
  const trendIsPositive = trend !== undefined && trend > 0;
  const trendIsNegative = trend !== undefined && trend < 0;
  const trendIsZero = trend !== undefined && trend === 0;

  return (
    <div
      className={cn(
        'glass-card glass-card-hover p-5 animate-fade-in-up opacity-0',
        gradientClass
      )}
      style={{
        animationDelay: `${delay}ms`,
        animationFillMode: 'forwards',
      }}
    >
      <div className="flex items-start justify-between">
        <div className="relative">
          <div
            className={cn(
              'w-12 h-12 rounded-xl flex items-center justify-center',
              'bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-sm',
              'border border-white/10 shadow-lg'
            )}
          >
            <Icon className={cn('w-6 h-6', colorClass)} />
          </div>
          <div
            className={cn(
              'absolute -inset-1 rounded-xl blur-xl opacity-30 -z-10',
              colorClass.replace('text-', 'bg-')
            )}
          />
        </div>

        <div className="flex flex-col items-end gap-1">
          {trend !== undefined && (
            <div
              className={cn(
                'flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold',
                trendIsPositive && 'bg-status-success/15 text-status-success border border-status-success/20',
                trendIsNegative && 'bg-status-critical/15 text-status-critical border border-status-critical/20',
                trendIsZero && 'bg-white/5 text-white/50 border border-white/10'
              )}
            >
              {trendIsPositive && <TrendingUp className="w-3.5 h-3.5" />}
              {trendIsNegative && <TrendingDown className="w-3.5 h-3.5" />}
              {trendIsZero && <Minus className="w-3.5 h-3.5" />}
              <span>{trendIsPositive ? '+' : ''}{trend}%</span>
            </div>
          )}
        </div>
      </div>

      <div className="mt-5">
        <div className="flex items-baseline gap-1.5 animate-count-up opacity-0"
          style={{
            animationDelay: `${delay + 150}ms`,
            animationFillMode: 'forwards',
          }}
        >
          <span className="text-3xl font-bold text-white tracking-tight">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </span>
          {unit && (
            <span className="text-base font-medium text-white/60">{unit}</span>
          )}
        </div>
        <p className="mt-1.5 text-sm font-medium text-white/50">{title}</p>
      </div>

      <div className="mt-4 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    </div>
  );
}
