import { Clock, AlertTriangle, Repeat } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { Alert } from '../../types';

interface AlertItemProps {
  alert: Alert;
  isSelected: boolean;
  onClick: () => void;
}

const severityConfig: Record<Alert['severity'], {
  bar: string;
  iconBg: string;
  iconColor: string;
  badgeBg: string;
  badgeText: string;
  glow: string;
  label: string;
}> = {
  critical: {
    bar: 'bg-status-critical',
    iconBg: 'bg-status-critical/15',
    iconColor: 'text-status-critical',
    badgeBg: 'bg-status-critical/20 border-status-critical/40',
    badgeText: 'text-status-critical',
    glow: 'shadow-[0_0_0_1px_rgba(239,68,68,0.25),0_0_25px_rgba(239,68,68,0.08)]',
    label: '紧急',
  },
  high: {
    bar: 'bg-status-warning',
    iconBg: 'bg-status-warning/15',
    iconColor: 'text-status-warning',
    badgeBg: 'bg-status-warning/20 border-status-warning/40',
    badgeText: 'text-status-warning',
    glow: 'shadow-[0_0_0_1px_rgba(245,158,11,0.2),0_0_20px_rgba(245,158,11,0.06)]',
    label: '高',
  },
  medium: {
    bar: 'bg-status-info',
    iconBg: 'bg-status-info/15',
    iconColor: 'text-status-info',
    badgeBg: 'bg-status-info/20 border-status-info/40',
    badgeText: 'text-status-info',
    glow: '',
    label: '中',
  },
  low: {
    bar: 'bg-white/30',
    iconBg: 'bg-white/10',
    iconColor: 'text-white/60',
    badgeBg: 'bg-white/5 border-white/15',
    badgeText: 'text-white/60',
    glow: '',
    label: '低',
  },
};

const typeIcons: Record<Alert['type'], typeof Clock> = {
  timeout_wait: Clock,
  long_occupation: AlertTriangle,
  frequent_reassign: Repeat,
};

const typeLabels: Record<Alert['type'], string> = {
  timeout_wait: '等待超时',
  long_occupation: '占用过长',
  frequent_reassign: '频繁改派',
};

function getRelativeTime(isoTime: string): string {
  const now = new Date();
  const then = new Date(isoTime);
  const diff = Math.max(0, Math.floor((now.getTime() - then.getTime()) / 1000));

  if (diff < 60) return `${diff}秒前`;
  const m = Math.floor(diff / 60);
  if (m < 60) return `${m}分钟前`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}小时前`;
  const d = Math.floor(h / 24);
  return `${d}天前`;
}

export default function AlertItem({ alert, isSelected, onClick }: AlertItemProps) {
  const severity = severityConfig[alert.severity];
  const TypeIcon = typeIcons[alert.type];

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'w-full text-left rounded-2xl overflow-hidden transition-all duration-300',
        'border bg-gradient-card backdrop-blur-xl',
        'group',
        isSelected
          ? cn(
              'border-primary-500/50 ring-1 ring-primary-500/30',
              'shadow-[0_0_0_1px_rgba(59,130,246,0.3),0_8px_30px_rgba(59,130,246,0.1)]',
              'bg-white/[0.04]'
            )
          : cn(
              'border-white/10',
              severity.glow,
              'hover:border-white/20 hover:bg-white/[0.03] hover:-translate-y-0.5 hover:shadow-card-hover'
            )
      )}
    >
      <div className="flex">
        <div
          className={cn(
            'w-1.5 flex-shrink-0',
            severity.bar,
            !alert.isHandled && 'animate-pulse'
          )}
        />

        <div className="flex-1 p-4 min-w-0">
          <div className="flex items-start gap-3">
            <div
              className={cn(
                'w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center',
                severity.iconBg
              )}
            >
              <TypeIcon className={cn('w-5 h-5', severity.iconColor)} />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2 min-w-0">
                  <h5 className="font-semibold text-white/95 truncate">
                    {typeLabels[alert.type]}
                  </h5>
                  <span
                    className={cn(
                      'badge flex-shrink-0 border',
                      severity.badgeBg,
                      severity.badgeText
                    )}
                  >
                    {severity.label}
                  </span>
                  {!alert.isHandled && (
                    <span className="flex-shrink-0 relative inline-flex items-center justify-center w-2">
                      <span
                        className={cn(
                          'absolute inline-flex h-2 w-2 rounded-full opacity-75 animate-ping',
                          severity.bar
                        )}
                      />
                      <span
                        className={cn(
                          'relative inline-flex rounded-full h-2 w-2',
                          severity.bar
                        )}
                      />
                    </span>
                  )}
                </div>
                <span className="text-xs text-white/45 flex-shrink-0 tabular-nums">
                  {getRelativeTime(alert.triggeredAt)}
                </span>
              </div>

              <p className="text-sm text-white/70 line-clamp-2 leading-relaxed">
                {alert.message}
              </p>

              <div className="mt-2.5 flex items-center gap-3 text-xs text-white/45 flex-wrap">
                <span className="inline-flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-white/30" />
                  {alert.storeName}
                </span>
                {alert.consultantName && (
                  <span className="inline-flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-white/30" />
                    {alert.consultantName}
                  </span>
                )}
                {alert.customerName && (
                  <span className="inline-flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-white/30" />
                    {alert.customerName}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}
