import { useState, useEffect, useMemo } from 'react';
import { Store as StoreIcon, RefreshCw, History, UserRound, Clock } from 'lucide-react';
import QueueColumn from '../components/queue/QueueColumn';
import { STORES, generateQueuingCustomers, CONSULTANTS } from '../data/mockData';
import { useGlobalStore } from '../store';
import { cn } from '../lib/utils';
import { formatTime, getProjectTypeName } from '../utils';
import type { ProjectType, QueuingCustomer } from '../types';

interface CallHistoryRecord {
  id: string;
  time: string;
  customerName: string;
  consultantName: string;
  projectName: string;
  projectType: ProjectType;
}

const PROJECT_TYPES: ProjectType[] = ['hyaluronic', 'photoelectric', 'skincare', 'surgery'];

const projectTypeDotColors: Record<ProjectType, string> = {
  hyaluronic: 'bg-project-hyaluronic',
  photoelectric: 'bg-project-photoelectric',
  skincare: 'bg-project-skincare',
  surgery: 'bg-project-surgery',
};

function generateCallHistory(customers: QueuingCustomer[], count: number): CallHistoryRecord[] {
  const records: CallHistoryRecord[] = [];
  const consultants = CONSULTANTS;
  const now = new Date();
  for (let i = 0; i < count; i++) {
    const customer = customers[i % Math.max(customers.length, 1)];
    const consultant = consultants[(i * 3 + 7) % Math.max(consultants.length, 1)];
    const callTime = new Date(now.getTime() - (i + 1) * 7 * 60 * 1000 - Math.floor(Math.random() * 5 * 60 * 1000));
    records.push({
      id: `call-${i}-${Date.now()}`,
      time: formatTime(callTime.toISOString()),
      customerName: customer?.name ?? `顾客${i + 1}`,
      consultantName: consultant?.name ?? '咨询师',
      projectName: customer?.projectName ?? '医美项目',
      projectType: customer?.projectType ?? 'hyaluronic',
    });
  }
  return records;
}

export default function Queue() {
  const { currentStoreId } = useGlobalStore();
  const [refreshTick, setRefreshTick] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [secondsUntilRefresh, setSecondsUntilRefresh] = useState(30);

  const currentStore = useMemo(
    () => STORES.find((s) => s.id === currentStoreId) ?? STORES[0],
    [currentStoreId]
  );

  const customers = useMemo(
    () => generateQueuingCustomers(currentStoreId),
    [currentStoreId, refreshTick]
  );

  const customersByType = useMemo(() => {
    const map: Record<ProjectType, QueuingCustomer[]> = {
      hyaluronic: [],
      photoelectric: [],
      skincare: [],
      surgery: [],
    };
    customers.forEach((c) => {
      map[c.projectType].push(c);
    });
    return map;
  }, [customers]);

  const summary = useMemo(() => {
    const totalWaiting = customers.length;
    const avgWait = totalWaiting > 0
      ? Math.round(customers.reduce((s, c) => s + c.waitMinutes, 0) / totalWaiting)
      : 0;
    return { totalWaiting, avgWait };
  }, [customers]);

  const callHistory = useMemo(
    () => generateCallHistory(customers, 5),
    [customers]
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsUntilRefresh((s) => {
        if (s <= 1) {
          setRefreshTick((t) => t + 1);
          return 30;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setRefreshTick((t) => t + 1);
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    setRefreshTick((t) => t + 1);
    setSecondsUntilRefresh(30);
    setTimeout(() => setIsRefreshing(false), 600);
  };

  return (
    <div className="relative p-6 space-y-6 min-h-full pr-[360px]">
      <div className="glass-card p-5 animate-fade-in-up opacity-0" style={{ animationDelay: '0ms', animationFillMode: 'forwards' }}>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500/30 to-primary-600/10 border border-primary-500/30 flex items-center justify-center flex-shrink-0">
              <StoreIcon className="w-6 h-6 text-primary-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{currentStore.name}</h2>
              <p className="text-sm text-white/50 mt-0.5">
                {currentStore.city} · {currentStore.address}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              type="button"
              onClick={handleManualRefresh}
              className={cn(
                'inline-flex items-center gap-2 px-4 py-2 rounded-xl font-medium',
                'bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20',
                'text-white/80 hover:text-white transition-all duration-200'
              )}
            >
              <RefreshCw className={cn('w-4 h-4', isRefreshing && 'animate-spin')} />
              <span>刷新数据</span>
              <span className="text-xs text-white/40">({secondsUntilRefresh}s)</span>
            </button>

            <div className="h-8 w-px bg-white/10 hidden md:block" />

            <div className="flex items-center gap-5 flex-wrap">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-status-critical/15 flex items-center justify-center">
                  <UserRound className="w-5 h-5 text-status-critical" />
                </div>
                <div>
                  <p className="text-[11px] text-white/45 leading-tight">总计候诊</p>
                  <p className="text-lg font-bold text-white tabular-nums leading-tight">{summary.totalWaiting}<span className="text-xs font-normal text-white/40 ml-0.5">人</span></p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-rosegold-500/15 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-rosegold-400" />
                </div>
                <div>
                  <p className="text-[11px] text-white/45 leading-tight">平均等待</p>
                  <p className="text-lg font-bold text-white tabular-nums leading-tight">{summary.avgWait}<span className="text-xs font-normal text-white/40 ml-0.5">分钟</span></p>
                </div>
              </div>

              <div className="flex items-center gap-3 pl-4 border-l border-white/10">
                {PROJECT_TYPES.map((type) => (
                  <div key={type} className="flex items-center gap-1.5">
                    <span className={cn('w-2.5 h-2.5 rounded-full flex-shrink-0', projectTypeDotColors[type])} />
                    <span className="text-xs font-medium text-white/70 tabular-nums">
                      {customersByType[type].length}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        {PROJECT_TYPES.map((type, idx) => (
          <div
            key={type}
            className="animate-fade-in-up opacity-0 min-h-[520px]"
            style={{ animationDelay: `${80 + idx * 80}ms`, animationFillMode: 'forwards' }}
          >
            <QueueColumn
              type={type}
              customers={customersByType[type]}
              onCallNext={() => {
                setRefreshTick((t) => t + 1);
              }}
            />
          </div>
        ))}
      </div>

      <div className="fixed right-6 bottom-6 z-40 w-[320px] animate-fade-in-up opacity-0" style={{ animationDelay: '480ms', animationFillMode: 'forwards' }}>
        <div className="glass-card p-4 shadow-2xl border-white/15">
          <div className="flex items-center gap-2 mb-3 pb-2.5 border-b border-white/10">
            <History className="w-[18px] h-[18px] text-primary-400" />
            <h4 className="text-sm font-semibold text-white/95">叫号历史</h4>
            <span className="ml-auto text-[11px] text-white/40">最近 5 条</span>
          </div>
          <div className="space-y-2.5">
            {callHistory.map((record, idx) => (
              <div
                key={record.id}
                className={cn(
                  'flex items-start gap-3 p-2.5 rounded-xl transition-all duration-200',
                  idx === 0 ? 'bg-primary-500/10 border border-primary-500/20' : 'bg-white/[0.02] border border-white/5 hover:bg-white/[0.04]'
                )}
              >
                <div className="flex flex-col items-center gap-1 pt-0.5 flex-shrink-0">
                  <span className="text-[10px] font-semibold text-white/45 tabular-nums">{record.time}</span>
                  <span className={cn('w-2 h-2 rounded-full', projectTypeDotColors[record.projectType])} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-white/90 truncate">{record.customerName}</span>
                    <span className="text-[10px] text-white/35">→</span>
                    <span className="text-xs text-primary-300 truncate">{record.consultantName}</span>
                  </div>
                  <p className="text-[11px] text-white/50 mt-0.5 truncate">
                    {record.projectName}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-2.5 border-t border-white/10">
            <div className="flex items-center gap-3 flex-wrap">
              {PROJECT_TYPES.map((type) => (
                <div key={type} className="flex items-center gap-1">
                  <span className={cn('w-1.5 h-1.5 rounded-full', projectTypeDotColors[type])} />
                  <span className="text-[11px] text-white/40">{getProjectTypeName(type).slice(0, 2)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
