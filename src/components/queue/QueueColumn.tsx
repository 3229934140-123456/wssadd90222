import { ChevronRight, UserMinus, UserPlus, Users } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { ProjectType, QueuingCustomer } from '../../types';
import CustomerCard from './CustomerCard';

interface QueueColumnProps {
  type: ProjectType;
  customers: QueuingCustomer[];
  onCallNext?: () => void;
}

const projectConfig: Record<ProjectType, {
  label: string;
  icon: typeof Users;
  gradient: string;
  badgeBg: string;
  badgeText: string;
  borderGlow: string;
}> = {
  hyaluronic: {
    label: '玻尿酸',
    icon: UserPlus,
    gradient: 'from-project-hyaluronic/30 to-project-hyaluronic/5',
    badgeBg: 'bg-project-hyaluronic/25',
    badgeText: 'text-project-hyaluronic',
    borderGlow: 'shadow-[0_0_0_1px_rgba(168,85,247,0.25),0_0_25px_rgba(168,85,247,0.08)]',
  },
  photoelectric: {
    label: '光电',
    icon: UserMinus,
    gradient: 'from-project-photoelectric/30 to-project-photoelectric/5',
    badgeBg: 'bg-project-photoelectric/25',
    badgeText: 'text-project-photoelectric',
    borderGlow: 'shadow-[0_0_0_1px_rgba(59,130,246,0.25),0_0_25px_rgba(59,130,246,0.08)]',
  },
  skincare: {
    label: '皮肤',
    icon: Users,
    gradient: 'from-project-skincare/30 to-project-skincare/5',
    badgeBg: 'bg-project-skincare/25',
    badgeText: 'text-project-skincare',
    borderGlow: 'shadow-[0_0_0_1px_rgba(16,185,129,0.25),0_0_25px_rgba(16,185,129,0.08)]',
  },
  surgery: {
    label: '手术',
    icon: Users,
    gradient: 'from-project-surgery/30 to-project-surgery/5',
    badgeBg: 'bg-project-surgery/25',
    badgeText: 'text-project-surgery',
    borderGlow: 'shadow-[0_0_0_1px_rgba(249,115,22,0.25),0_0_25px_rgba(249,115,22,0.08)]',
  },
};

const callBtnGradient: Record<ProjectType, string> = {
  hyaluronic: 'bg-gradient-to-r from-project-hyaluronic to-purple-600 hover:shadow-[0_0_25px_rgba(168,85,247,0.35)]',
  photoelectric: 'bg-gradient-to-r from-project-photoelectric to-blue-600 hover:shadow-[0_0_25px_rgba(59,130,246,0.35)]',
  skincare: 'bg-gradient-to-r from-project-skincare to-emerald-600 hover:shadow-[0_0_25px_rgba(16,185,129,0.35)]',
  surgery: 'bg-gradient-to-r from-project-surgery to-orange-600 hover:shadow-[0_0_25px_rgba(249,115,22,0.35)]',
};

export default function QueueColumn({ type, customers, onCallNext }: QueueColumnProps) {
  const config = projectConfig[type];
  const Icon = config.icon;
  const count = customers.length;
  const sorted = [...customers].sort((a, b) => b.waitMinutes - a.waitMinutes);

  return (
    <div
      className={cn(
        'flex flex-col h-full rounded-2xl border border-white/10',
        'bg-gradient-to-b',
        config.gradient,
        'backdrop-blur-xl overflow-hidden',
        config.borderGlow
      )}
    >
      <header className="px-5 py-4 flex items-center justify-between border-b border-white/10">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'w-10 h-10 rounded-xl flex items-center justify-center',
              config.badgeBg
            )}
          >
            <Icon className={cn('w-5 h-5', config.badgeText)} />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white/95">
              {config.label}
            </h3>
            <p className="text-xs text-white/45 mt-0.5">
              排队等候
            </p>
          </div>
        </div>
        <div
          className={cn(
            'px-3 py-1 rounded-full text-sm font-bold tabular-nums min-w-[44px] text-center',
            config.badgeBg,
            config.badgeText
          )}
        >
          {count}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto scrollbar-thin p-3 space-y-3">
        {sorted.length === 0 ? (
          <div className="h-full min-h-[180px] flex flex-col items-center justify-center text-white/35">
            <Users className="w-10 h-10 mb-2 opacity-60" />
            <p className="text-sm font-medium">暂无排队</p>
            <p className="text-xs mt-1 opacity-70">等待顾客到来</p>
          </div>
        ) : (
          sorted.map((c) => (
            <CustomerCard key={c.id} customer={c} />
          ))
        )}
      </div>

      <div className="p-4 border-t border-white/10">
        <button
          type="button"
          onClick={onCallNext}
          disabled={count === 0}
          className={cn(
            'w-full group inline-flex items-center justify-center gap-2',
            'px-5 py-3 rounded-xl font-semibold text-white',
            'transition-all duration-300 active:scale-[0.98]',
            count > 0
              ? cn(callBtnGradient[type], 'shadow-lg hover:scale-[1.01]')
              : 'bg-white/5 text-white/40 cursor-not-allowed border border-white/10'
          )}
        >
          <span>呼叫下一位</span>
          <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>
    </div>
  );
}
