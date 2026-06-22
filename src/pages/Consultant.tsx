import { useState, useEffect, useMemo } from 'react';
import { Users, UserRound, Coffee, Stethoscope, BarChart3 } from 'lucide-react';
import KpiCard from '../components/common/KpiCard';
import ConsultantCard from '../components/consultant/ConsultantCard';
import Timeline from '../components/consultant/Timeline';
import HeatmapGrid from '../components/charts/HeatmapGrid';
import { STORES, CONSULTANTS } from '../data/mockData';
import { useGlobalStore } from '../store';
import { cn } from '../lib/utils';
import type { Consultant, ConsultantStatus, TimeSlot } from '../types';

interface HeatmapData {
  day: string;
  hour: number;
  value: number;
}

type FilterTab = 'all' | ConsultantStatus;

const tabConfig: { key: FilterTab; label: string; icon: typeof Users; activeCls: string; countKey?: string }[] = [
  { key: 'all', label: '全部', icon: Users, activeCls: 'bg-primary-500/20 text-primary-300 border-primary-500/30' },
  { key: 'busy', label: '接诊中', icon: Stethoscope, activeCls: 'bg-status-success/20 text-status-success border-status-success/30' },
  { key: 'free', label: '空闲', icon: UserRound, activeCls: 'bg-white/10 text-white/70 border-white/20' },
  { key: 'break', label: '休息中', icon: Coffee, activeCls: 'bg-status-warning/20 text-status-warning border-status-warning/30' },
];

const borderColorMap: Record<ConsultantStatus, string> = {
  busy: 'ring-2 ring-status-success/40 shadow-glow-success',
  free: '',
  break: 'ring-2 ring-status-warning/35',
};

function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9999) * 10000;
  return x - Math.floor(x);
}

function generateHeatmapData(consultants: Consultant[]): HeatmapData[] {
  const data: HeatmapData[] = [];
  const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
  const cCount = consultants.length;

  for (let d = 0; d < 7; d++) {
    for (let h = 0; h < 24; h++) {
      const isWorkHour = h >= 9 && h <= 20;
      const isWeekend = d >= 5;
      const isPeak = (h >= 10 && h <= 12) || (h >= 14 && h <= 17);

      let baseLoad = 0;
      if (isWorkHour) {
        if (isWeekend) {
          baseLoad = isPeak ? 3.2 : 1.8;
        } else {
          baseLoad = isPeak ? 4.2 : 2.5;
        }
      }

      const jitter = (seededRandom(d * 24 + h + cCount) - 0.5) * 1.2;
      const load = Math.max(0, Math.min(5, Math.round(baseLoad + jitter)));

      data.push({
        day: days[d],
        hour: h,
        value: load,
      });
    }
  }
  return data;
}

export default function ConsultantPage() {
  const { currentStoreId } = useGlobalStore();
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [refreshTick, setRefreshTick] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setRefreshTick((t) => t + 1);
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const currentStore = useMemo(
    () => STORES.find((s) => s.id === currentStoreId) ?? STORES[0],
    [currentStoreId]
  );

  const storeConsultants = useMemo(() => {
    const filtered = CONSULTANTS.filter((c) => c.storeId === currentStoreId);
    return filtered.length > 0 ? filtered : CONSULTANTS;
  }, [currentStoreId, refreshTick]);

  const kpis = useMemo(() => {
    const onDuty = storeConsultants.length;
    const busy = storeConsultants.filter((c) => c.status === 'busy').length;
    const free = storeConsultants.filter((c) => c.status === 'free').length;
    const onBreak = storeConsultants.filter((c) => c.status === 'break').length;
    const totalServed = storeConsultants.reduce((s, c) => s + c.todayServed, 0);
    const avgServed = onDuty > 0 ? Number((totalServed / onDuty).toFixed(1)) : 0;
    return { onDuty, busy, free, onBreak, avgServed };
  }, [storeConsultants]);

  const filteredConsultants = useMemo(() => {
    if (activeTab === 'all') return storeConsultants;
    return storeConsultants.filter((c) => c.status === activeTab);
  }, [storeConsultants, activeTab]);

  const tabCounts = useMemo(() => ({
    all: storeConsultants.length,
    busy: kpis.busy,
    free: kpis.free,
    break: kpis.onBreak,
  }), [storeConsultants, kpis]);

  const timelineData = useMemo(() => {
    return storeConsultants.slice(0, 8).map((c) => ({
      id: c.id,
      name: c.name,
      schedule: c.todaySchedule,
    }));
  }, [storeConsultants]);

  const heatmapData = useMemo(
    () => generateHeatmapData(storeConsultants),
    [storeConsultants]
  );

  return (
    <div className="space-y-6 p-6">
      <div className="glass-card p-5 animate-fade-in-up opacity-0" style={{ animationDelay: '0ms', animationFillMode: 'forwards' }}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rosegold-500/30 to-rosegold-600/10 border border-rosegold-500/30 flex items-center justify-center flex-shrink-0">
              <Stethoscope className="w-6 h-6 text-rosegold-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">咨询师负载看板</h2>
              <p className="text-sm text-white/50 mt-0.5">
                {currentStore.name} · 共 {kpis.onDuty} 位咨询师在岗
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-white/45">
            <BarChart3 className="w-4 h-4" />
            <span>数据每60秒自动刷新</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
        <KpiCard
          title="在岗咨询师"
          value={kpis.onDuty}
          unit="位"
          icon={Users}
          trend={2.1}
          gradientClass="bg-gradient-kpi1"
          colorClass="text-primary-400"
          delay={80}
        />
        <KpiCard
          title="接诊中"
          value={kpis.busy}
          unit="位"
          icon={Stethoscope}
          trend={-3.4}
          gradientClass="bg-gradient-kpi3"
          colorClass="text-status-success"
          delay={140}
        />
        <KpiCard
          title="空闲"
          value={kpis.free}
          unit="位"
          icon={UserRound}
          trend={8.7}
          gradientClass="bg-gradient-kpi2"
          colorClass="text-rosegold-400"
          delay={200}
        />
        <KpiCard
          title="休息中"
          value={kpis.onBreak}
          unit="位"
          icon={Coffee}
          trend={0}
          gradientClass="bg-gradient-kpi4"
          colorClass="text-status-warning"
          delay={260}
        />
        <KpiCard
          title="今日人均接诊"
          value={kpis.avgServed}
          unit="人次"
          icon={BarChart3}
          trend={5.6}
          gradientClass="bg-gradient-kpi1"
          colorClass="text-primary-300"
          delay={320}
        />
      </div>

      <div className="glass-card p-6 animate-fade-in-up opacity-0" style={{ animationDelay: '400ms', animationFillMode: 'forwards' }}>
        <div className="mb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-white">咨询师状态</h3>
            <p className="mt-1 text-sm text-white/50">点击卡片展开查看今日排班详情</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {tabConfig.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              const count = tabCounts[tab.key];
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={cn(
                    'inline-flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm border transition-all duration-200',
                    isActive
                      ? cn(tab.activeCls, 'shadow-md')
                      : 'bg-white/5 text-white/60 border-white/10 hover:bg-white/10 hover:text-white/80 hover:border-white/20'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  <span className={cn(
                    'px-1.5 py-0.5 rounded-full text-xs font-semibold tabular-nums',
                    isActive ? 'bg-white/15' : 'bg-white/5 text-white/50'
                  )}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredConsultants.map((consultant, idx) => (
            <div
              key={consultant.id}
              className={cn(
                'animate-fade-in-up opacity-0 rounded-2xl transition-all duration-300',
                borderColorMap[consultant.status]
              )}
              style={{
                animationDelay: `${480 + idx * 40}ms`,
                animationFillMode: 'forwards',
              }}
            >
              <ConsultantCard consultant={consultant} />
            </div>
          ))}
          {filteredConsultants.length === 0 && (
            <div className="col-span-full py-16 flex flex-col items-center justify-center text-white/40">
              <Coffee className="w-12 h-12 mb-3 opacity-60" />
              <p className="text-sm font-medium">暂无符合条件的咨询师</p>
              <p className="text-xs mt-1 opacity-70">请切换其他筛选条件查看</p>
            </div>
          )}
        </div>
      </div>

      <div className="animate-fade-in-up opacity-0" style={{ animationDelay: '640ms', animationFillMode: 'forwards' }}>
        <Timeline consultants={timelineData} />
      </div>

      <div className="animate-fade-in-up opacity-0" style={{ animationDelay: '720ms', animationFillMode: 'forwards' }}>
        <HeatmapGrid data={heatmapData} />
      </div>
    </div>
  );
}
