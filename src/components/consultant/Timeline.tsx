import { useState } from 'react';
import { cn } from '../../lib/utils';
import type { TimeSlot } from '../../types';

interface TimelineConsultant {
  id: string;
  name: string;
  schedule: TimeSlot[];
}

interface TimelineProps {
  consultants: TimelineConsultant[];
}

const START_HOUR = 9;
const END_HOUR = 21;
const TOTAL_HOURS = END_HOUR - START_HOUR;

const slotColors: Record<TimeSlot['type'], {
  bg: string;
  border: string;
  label: string;
}> = {
  consultation: {
    bg: 'bg-gradient-to-r from-primary-500/60 to-primary-400/50',
    border: 'border-primary-400/60',
    label: '接诊',
  },
  free: {
    bg: 'bg-white/[0.04]',
    border: 'border-white/10',
    label: '空闲',
  },
  break: {
    bg: 'bg-gradient-to-r from-status-warning/40 to-status-warning/25',
    border: 'border-status-warning/50',
    label: '休息',
  },
};

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

function slotToPercent(slot: TimeSlot): { left: number; width: number } {
  const totalMinutes = TOTAL_HOURS * 60;
  const start = timeToMinutes(slot.start) - START_HOUR * 60;
  const end = timeToMinutes(slot.end) - START_HOUR * 60;
  const left = (start / totalMinutes) * 100;
  const width = Math.max(((end - start) / totalMinutes) * 100, 0.5);
  return { left, width };
}

const hourTicks: number[] = Array.from(
  { length: TOTAL_HOURS + 1 },
  (_, i) => START_HOUR + i
);

interface HoverInfo {
  consultantName: string;
  slot: TimeSlot;
  x: number;
  y: number;
}

export default function Timeline({ consultants }: TimelineProps) {
  const [hover, setHover] = useState<HoverInfo | null>(null);

  return (
    <div className="glass-card p-5 overflow-hidden">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-base font-semibold text-white/95">接诊时间轴</h3>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-gradient-to-r from-primary-500/60 to-primary-400/50 border border-primary-400/60" />
            <span className="text-white/60">接诊</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-gradient-to-r from-status-warning/40 to-status-warning/25 border border-status-warning/50" />
            <span className="text-white/60">休息</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-white/[0.04] border border-white/10" />
            <span className="text-white/60">空闲</span>
          </div>
        </div>
      </div>

      <div className="relative overflow-x-auto scrollbar-thin">
        <div className="min-w-[820px]">
          <div
            className="grid gap-0"
            style={{
              gridTemplateColumns: `110px 1fr`,
            }}
          >
            <div className="h-9 flex items-end pb-2 pr-3 border-b border-white/10">
              <span className="text-[11px] font-medium text-white/40 uppercase tracking-wider">
                咨询师
              </span>
            </div>
            <div
              className="relative h-9 border-b border-white/10 pb-2"
              style={{ minHeight: 0 }}
            >
              <div className="absolute inset-0 flex">
                {hourTicks.map((h, i) => (
                  <div
                    key={h}
                    className="flex-1 flex flex-col items-start border-l border-white/5 first:border-l-0"
                    style={{ paddingLeft: i === 0 ? 0 : 0 }}
                  >
                    <span className="text-[11px] text-white/45 tabular-nums font-medium pl-1">
                      {String(h).padStart(2, '0')}:00
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {consultants.map((c) => (
              <>
                <div
                  key={`${c.id}-label`}
                  className="h-14 pr-3 flex items-center justify-end border-b border-white/5"
                >
                  <span className="text-sm font-medium text-white/80 truncate">
                    {c.name}
                  </span>
                </div>
                <div
                  key={`${c.id}-row`}
                  className="relative h-14 border-b border-white/5 group"
                >
                  <div className="absolute inset-0 flex">
                    {hourTicks.slice(0, -1).map((h, i) => (
                      <div
                        key={h}
                        className={cn(
                          'flex-1 border-l border-white/[0.04] first:border-l-0',
                          i % 2 === 1 ? 'bg-white/[0.015]' : ''
                        )}
                      />
                    ))}
                  </div>

                  {c.schedule.map((slot, idx) => {
                    const { left, width } = slotToPercent(slot);
                    const color = slotColors[slot.type];
                    return (
                      <div
                        key={idx}
                        className={cn(
                          'absolute top-2.5 bottom-2.5 rounded-md border cursor-pointer',
                          'transition-all duration-200 hover:scale-y-[1.1] hover:-translate-y-0.5 hover:z-10',
                          color.bg,
                          color.border,
                          slot.type === 'consultation' && 'shadow-[0_0_0_1px_rgba(59,130,246,0.2),0_4px_12px_rgba(59,130,246,0.15)]',
                          slot.type === 'break' && 'shadow-[0_0_0_1px_rgba(245,158,11,0.15)]'
                        )}
                        style={{
                          left: `calc(${left}% + 2px)`,
                          width: `calc(${width}% - 4px)`,
                        }}
                        onMouseEnter={(e) => {
                          const rect = (e.currentTarget.offsetParent as HTMLElement).getBoundingClientRect();
                          setHover({
                            consultantName: c.name,
                            slot,
                            x: e.clientX - rect.left,
                            y: e.clientY - rect.top - 8,
                          });
                        }}
                        onMouseLeave={() => setHover(null)}
                      >
                        {slot.type === 'consultation' && width > 8 && slot.customerName && (
                          <div className="absolute inset-0 flex items-center px-2 overflow-hidden">
                            <span className="text-[11px] text-white/95 font-medium truncate">
                              {slot.customerName}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            ))}
          </div>
        </div>

        {hover && (
          <div
            className="pointer-events-none absolute z-50 animate-fade-in-up"
            style={{
              left: hover.x,
              top: hover.y,
              transform: 'translate(-50%, -100%)',
            }}
          >
            <div className="glass-card border-white/20 px-3.5 py-2.5 whitespace-nowrap shadow-xl">
              <div className="text-xs font-medium text-white/95 mb-1.5">
                {hover.consultantName} · {slotColors[hover.slot.type].label}
              </div>
              <div className="text-[11px] text-white/60 tabular-nums">
                {hover.slot.start} - {hover.slot.end}
              </div>
              {hover.slot.type === 'consultation' && hover.slot.customerName && (
                <div className="text-[11px] text-primary-300 mt-1">
                  顾客：{hover.slot.customerName}
                </div>
              )}
              <div className="absolute left-1/2 -translate-x-1/2 bottom-[-5px] w-2.5 h-2.5 rotate-45 bg-gradient-card border-r border-b border-white/20" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
