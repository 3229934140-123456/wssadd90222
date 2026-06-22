import { UserRound, Clock, ArrowRightLeft, PhoneCall, UserCheck } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { QueuingCustomer } from '../../types';

interface CustomerCardProps {
  customer: QueuingCustomer;
}

const statusBorderColors: Record<QueuingCustomer['status'], string> = {
  waiting: 'border-primary-400/60',
  calling: 'border-status-warning/70',
  consulting: 'border-status-success/70',
  timeout: 'border-status-critical/80',
};

const statusTextColors: Record<QueuingCustomer['status'], string> = {
  waiting: 'text-white/70',
  calling: 'text-status-warning',
  consulting: 'text-status-success',
  timeout: 'text-status-critical',
};

const statusBadgeConfig: Record<QueuingCustomer['status'], { label: string; cls: string }> = {
  waiting: { label: '排队中', cls: 'bg-white/5 text-white/60 border border-white/10' },
  calling: { label: '呼叫中', cls: 'bg-status-warning/20 text-status-warning border border-status-warning/30 animate-pulse' },
  consulting: { label: '接诊中', cls: 'bg-status-success/20 text-status-success border border-status-success/30' },
  timeout: { label: '已超时', cls: 'bg-status-critical/20 text-status-critical border border-status-critical/30 animate-pulse-slow' },
};

const StatusIcon: Record<QueuingCustomer['status'], typeof Clock> = {
  waiting: Clock,
  calling: PhoneCall,
  consulting: UserCheck,
  timeout: Clock,
};

const avatarBgColors: Record<QueuingCustomer['projectType'], string> = {
  hyaluronic: 'bg-project-hyaluronic/20',
  photoelectric: 'bg-project-photoelectric/20',
  skincare: 'bg-project-skincare/20',
  surgery: 'bg-project-surgery/20',
};

function formatWaitTime(minutes: number): string {
  if (minutes < 60) return `${minutes}分钟`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}小时${m}分钟` : `${h}小时`;
}

function extractTime(isoTime: string): string {
  const match = isoTime.match(/(\d{1,2}:\d{2})/);
  return match ? match[1] : isoTime;
}

export default function CustomerCard({ customer }: CustomerCardProps) {
  const isTimeout = customer.status === 'timeout';

  return (
    <div
      className={cn(
        'glass-card p-4 transition-all duration-300',
        isTimeout && 'border-status-critical/50 animate-pulse-slow shadow-glow-critical'
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            'w-11 h-11 rounded-full border-2 flex items-center justify-center flex-shrink-0 text-sm font-semibold',
            statusBorderColors[customer.status],
            avatarBgColors[customer.projectType]
          )}
        >
          <span className="text-white/90">
            {customer.avatarInitial || (
              <UserRound className="w-5 h-5 text-white/60" />
            )}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-white/95 truncate">
              {customer.name}
            </span>
            {customer.isNewCustomer ? (
              <span className="badge bg-primary-500/20 text-primary-300 border border-primary-500/30">
                新客
              </span>
            ) : (
              <span className="badge bg-white/5 text-white/60 border border-white/10">
                老客
              </span>
            )}
            <span className={cn('badge border', statusBadgeConfig[customer.status].cls)}>
              {(() => {
                const Icon = StatusIcon[customer.status];
                return <Icon className="w-3 h-3" />;
              })()}
              {statusBadgeConfig[customer.status].label}
            </span>
          </div>

          <p className="mt-1 text-xs text-white/50 truncate">
            {customer.projectName}
          </p>

          <div className="mt-2.5 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-xs">
              <Clock className="w-3.5 h-3.5 text-white/40" />
              <span className={cn('font-medium tabular-nums', statusTextColors[customer.status])}>
                {formatWaitTime(customer.waitMinutes)}
              </span>
            </div>

            <span className="text-xs text-white/40 tabular-nums">
              到达 {extractTime(customer.arrivalTime)}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-white/5 flex justify-end">
        <button
          type="button"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium
                     rounded-lg text-white/60 hover:text-white/90
                     bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20
                     transition-all duration-200"
        >
          <ArrowRightLeft className="w-3.5 h-3.5" />
          <span>改派</span>
        </button>
      </div>
    </div>
  );
}
