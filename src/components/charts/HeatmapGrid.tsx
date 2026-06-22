import { useState, useMemo } from 'react';
import { cn } from '../../lib/utils';

interface HeatmapData {
  day: string;
  hour: number;
  value: number;
}

interface HeatmapGridProps {
  data: HeatmapData[];
  days?: string[];
}

const LEVEL_COLORS = [
  'bg-white/[0.03] border-white/[0.05]',
  'bg-primary-900/40 border-primary-700/30',
  'bg-primary-700/50 border-primary-500/30',
  'bg-primary-500/60 border-primary-400/40',
  'bg-primary-400/75 border-primary-300/50',
  'bg-primary-300/85 border-primary-200/60',
];

const LEVEL_TEXT = [
  '空闲',
  '低负载',
  '中负载',
  '负载较高',
  '高负载',
  '满载',
];

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const DEFAULT_DAYS = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];

export default function HeatmapGrid({
  data,
  days = DEFAULT_DAYS,
}: HeatmapGridProps) {
  const [hoveredCell, setHoveredCell] = useState<{
    day: string;
    hour: number;
    value: number;
    x: number;
    y: number;
  } | null>(null);

  const valueMap = useMemo(() => {
    const map = new Map<string, number>();
    data.forEach((d) => {
      const key = `${d.day}-${d.hour}`;
      map.set(key, Math.min(5, Math.max(0, d.value)));
    });
    return map;
  }, [data]);

  const getValue = (day: string, hour: number) => {
    return valueMap.get(`${day}-${hour}`) ?? 0;
  };

  const handleMouseEnter = (
    e: React.MouseEvent<HTMLDivElement>,
    day: string,
    hour: number,
    value: number
  ) => {
    const rect = (e.currentTarget.offsetParent as HTMLElement)?.getBoundingClientRect();
    const cellRect = e.currentTarget.getBoundingClientRect();
    setHoveredCell({
      day,
      hour,
      value,
      x: cellRect.left - (rect?.left ?? 0) + cellRect.width / 2,
      y: cellRect.top - (rect?.top ?? 0),
    });
  };

  const handleMouseLeave = () => {
    setHoveredCell(null);
  };

  const displayHours = HOURS.filter((h) => h % 3 === 0);

  return (
    <div className="glass-card p-6 w-full">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white">咨询师负载热力图</h3>
        <p className="mt-1 text-sm text-white/50">按星期和小时分布的工作负载情况</p>
      </div>

      <div className="relative">
        <div className="flex">
          <div className="w-14 shrink-0" />

          <div className="flex-1 grid grid-cols-24 gap-1">
            {HOURS.map((hour) => (
              <div key={`header-${hour}`} className="h-6 flex items-end justify-center">
                {displayHours.includes(hour) && (
                  <span className="text-[10px] font-medium text-white/40">
                    {hour.toString().padStart(2, '0')}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-2 space-y-1">
          {days.map((day, dayIdx) => (
            <div key={day} className="flex items-stretch">
              <div className="w-14 shrink-0 flex items-center pr-2">
                <span
                  className={cn(
                    'text-xs font-medium',
                    dayIdx >= 5 ? 'text-rosegold-400/70' : 'text-white/55'
                  )}
                >
                  {day}
                </span>
              </div>

              <div className="flex-1 grid grid-cols-24 gap-1">
                {HOURS.map((hour) => {
                  const value = getValue(day, hour);
                  const colorClass = LEVEL_COLORS[value];
                  const isWorkHour = hour >= 9 && hour <= 20;
                  const isWeekend = dayIdx >= 5;

                  return (
                    <div
                      key={`${day}-${hour}`}
                      className={cn(
                        'h-8 rounded-md border transition-all duration-200 cursor-pointer',
                        'hover:scale-[1.15] hover:z-10 hover:shadow-lg',
                        colorClass,
                        !isWorkHour && !isWeekend && value === 0 && 'opacity-50',
                        isWeekend && value === 0 && 'opacity-60'
                      )}
                      onMouseEnter={(e) => handleMouseEnter(e, day, hour, value)}
                      onMouseLeave={handleMouseLeave}
                      style={{
                        boxShadow:
                          value >= 3
                            ? `0 0 ${value * 2}px rgba(96, 165, 250, ${value * 0.08})`
                            : undefined,
                      }}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {hoveredCell && (
          <div
            className="absolute z-50 pointer-events-none"
            style={{
              left: hoveredCell.x,
              top: hoveredCell.y - 8,
              transform: 'translate(-50%, -100%)',
            }}
          >
            <div
              className={cn(
                'glass-card px-3.5 py-2.5 min-w-[150px] whitespace-nowrap',
                'backdrop-blur-xl border border-white/15 shadow-2xl'
              )}
            >
              <div className="flex items-center gap-2 mb-1.5 pb-1.5 border-b border-white/10">
                <span className="text-sm font-semibold text-white">
                  {hoveredCell.day}
                </span>
                <span className="text-xs text-white/40">·</span>
                <span className="text-sm font-semibold text-white">
                  {hoveredCell.hour.toString().padStart(2, '0')}:00 -{' '}
                  {(hoveredCell.hour + 1).toString().padStart(2, '0')}:00
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    'w-3 h-3 rounded-sm border',
                    LEVEL_COLORS[hoveredCell.value]
                  )}
                />
                <span className="text-xs text-white/60">
                  负载等级:
                </span>
                <span
                  className={cn(
                    'text-xs font-semibold',
                    hoveredCell.value >= 4
                      ? 'text-status-critical'
                      : hoveredCell.value >= 3
                      ? 'text-status-warning'
                      : hoveredCell.value >= 1
                      ? 'text-status-info'
                      : 'text-white/70'
                  )}
                >
                  {LEVEL_TEXT[hoveredCell.value]} ({hoveredCell.value}/5)
                </span>
              </div>
            </div>
            <div className="absolute left-1/2 -translate-x-1/2 -bottom-1 w-2 h-2 rotate-45 bg-gradient-card border-r border-b border-white/15" />
          </div>
        )}
      </div>

      <div className="mt-6 pt-4 border-t border-white/10">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-white/50">负载等级</span>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              {LEVEL_COLORS.map((color, idx) => (
                <div
                  key={idx}
                  className={cn('w-5 h-5 rounded-md border', color)}
                  title={LEVEL_TEXT[idx]}
                />
              ))}
            </div>
            <div className="flex items-center gap-3 text-xs text-white/40">
              <span>空闲</span>
              <span>→</span>
              <span>满载</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
