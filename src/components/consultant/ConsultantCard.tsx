import { useState } from 'react';
import {
  UserRound,
  Clock,
  Users,
  ChevronDown,
  Calendar,
  Coffee,
  Sparkles,
} from 'lucide-react';
import { cn } from '../../utils';
import type { Consultant } from '../../types';

interface ConsultantCardProps {
  consultant: Consultant;
}

const statusConfig: Record<Consultant['status'], {
  dot: string;
  label: string;
  labelColor: string;
  accentBg: string;
}> = {
  busy: {
    dot: 'bg-status-success',
    label: '接诊中',
    labelColor: 'text-status-success',
    accentBg: 'bg-status-success/10 border-status-success/30',
  },
  free: {
    dot: 'bg-white/40',
    label: '空闲',
    labelColor: 'text-white/60',
    accentBg: 'bg-white/5 border-white/10',
  },
  break: {
    dot: 'bg-status-warning',
    label: '休息中',
    labelColor: 'text-status-warning',
    accentBg: 'bg-status-warning/10 border-status-warning/30',
  },
};

export default function ConsultantCard({ consultant }: ConsultantCardProps) {
  const [expanded, setExpanded] = useState(false);
  const status = statusConfig[consultant.status];
  const isConsulting = consultant.status === 'busy';

  return (
    <div
      className={cn(
        'glass-card glass-card-hover overflow-hidden cursor-pointer',
        'transition-all duration-500',
        expanded ? 'ring-1 ring-primary-500/30' : ''
      )}
      onClick={() => setExpanded((e) => !e)}
    >
      <div className="p-5">
        <div className="flex items-start gap-4">
          <div className="relative flex-shrink-0">
            <div
              className={cn(
                'w-14 h-14 rounded-2xl flex items-center justify-center',
                'bg-gradient-to-br from-white/10 to-white/5 border border-white/15',
                'text-xl font-bold text-white/90'
              )}
            >
              {consultant.avatarInitial || (
                <UserRound className="w-7 h-7 text-white/60" />
              )}
            </div>
            <span
              className={cn(
                'absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-dark-800',
                status.dot,
                isConsulting && 'animate-pulse'
              )}
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <h4 className="font-semibold text-white/95 truncate">
                  {consultant.name}
                </h4>
                <span
                  className={cn(
                    'badge flex-shrink-0',
                    status.accentBg,
                    status.labelColor
                  )}
                >
                  <span
                    className={cn('w-1.5 h-1.5 rounded-full', status.dot)}
                  />
                  {status.label}
                </span>
              </div>
              <ChevronDown
                className={cn(
                  'w-4 h-4 text-white/40 flex-shrink-0 transition-transform duration-300',
                  expanded && 'rotate-180'
                )}
              />
            </div>

            {isConsulting && consultant.currentCustomerName ? (
              <div className="mt-3 space-y-2.5">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-white/50">顾客：</span>
                  <span className="font-medium text-white/90 truncate">
                    {consultant.currentCustomerName}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-white/50">项目：</span>
                  <span className="text-white/80 truncate">
                    {consultant.currentProject}
                  </span>
                </div>
                <div>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-white/45">接诊进度</span>
                    <span className="text-white/70 font-medium tabular-nums">
                      {consultant.currentProgress}%
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-status-success to-emerald-400 transition-all duration-700 ease-out"
                      style={{ width: `${consultant.currentProgress}%` }}
                    />
                  </div>
                </div>
              </div>
            ) : consultant.status === 'free' ? (
              <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10">
                <Sparkles className="w-4 h-4 text-white/40" />
                <span className="text-sm text-white/60">随时可以接诊新顾客</span>
              </div>
            ) : (
              <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-lg bg-status-warning/10 border border-status-warning/20">
                <Coffee className="w-4 h-4 text-status-warning" />
                <span className="text-sm text-status-warning/90">正在休息，稍后返回</span>
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-white/5 grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary-500/15 flex items-center justify-center">
              <Users className="w-4 h-4 text-primary-400" />
            </div>
            <div>
              <p className="text-[11px] text-white/45 leading-tight">今日接诊</p>
              <p className="text-sm font-bold text-white/90 tabular-nums leading-tight mt-0.5">
                {consultant.todayServed}
                <span className="text-xs text-white/40 font-normal ml-0.5">人次</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-rosegold-500/15 flex items-center justify-center">
              <Clock className="w-4 h-4 text-rosegold-400" />
            </div>
            <div>
              <p className="text-[11px] text-white/45 leading-tight">平均时长</p>
              <p className="text-sm font-bold text-white/90 tabular-nums leading-tight mt-0.5">
                {consultant.avgConsultMinutes}
                <span className="text-xs text-white/40 font-normal ml-0.5">分钟</span>
              </p>
            </div>
          </div>
        </div>

        <div
          className={cn(
            'grid transition-all duration-500 ease-out overflow-hidden',
            expanded ? 'grid-rows-[1fr] mt-4 opacity-100' : 'grid-rows-[0fr] opacity-0'
          )}
        >
          <div className="min-h-0">
            <div className="pt-4 border-t border-white/5">
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="w-4 h-4 text-white/40" />
                <span className="text-xs font-medium text-white/60">今日排班</span>
              </div>
              <div className="space-y-2">
                {consultant.todaySchedule.slice(0, 4).map((slot, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      'flex items-center justify-between px-3 py-2 rounded-lg text-xs',
                      slot.type === 'consultation'
                        ? 'bg-primary-500/10 border border-primary-500/20'
                        : slot.type === 'break'
                        ? 'bg-status-warning/10 border border-status-warning/20'
                        : 'bg-white/[0.03] border border-white/10'
                    )}
                  >
                    <span className="text-white/60 tabular-nums">
                      {slot.start} - {slot.end}
                    </span>
                    <span
                      className={cn(
                        'font-medium',
                        slot.type === 'consultation'
                          ? 'text-primary-300'
                          : slot.type === 'break'
                          ? 'text-status-warning'
                          : 'text-white/50'
                      )}
                    >
                      {slot.type === 'consultation'
                        ? slot.customerName
                          ? `接诊 · ${slot.customerName}`
                          : '接诊'
                        : slot.type === 'break'
                        ? '休息'
                        : '空闲'}
                    </span>
                  </div>
                ))}
                {consultant.todaySchedule.length > 4 && (
                  <p className="text-center text-xs text-white/35 pt-1">
                    还有 {consultant.todaySchedule.length - 4} 条排班...
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
