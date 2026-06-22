import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  UserCheck,
  Clock,
  AlertTriangle,
  TrendingUp,
  Calendar,
  MapPin,
  X,
  UserRound,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';
import KpiCard from '../components/common/KpiCard';
import LineChartCard from '../components/charts/LineChartCard';
import BarChartCard from '../components/charts/BarChartCard';
import {
  STORES,
  generateTrendData,
  generateStoreRanking,
  generateQueuingCustomers,
  generateAlerts,
  CONSULTANTS,
} from '../data/mockData';
import { useGlobalStore } from '../store';
import { cn, getProjectTypeName } from '../utils';
import type { ProjectType, Store, ConsultantStatus } from '../types';

const PROJECT_TYPES: ProjectType[] = ['hyaluronic', 'photoelectric', 'skincare', 'surgery'];

const projectTypeDotColors: Record<ProjectType, string> = {
  hyaluronic: 'bg-project-hyaluronic',
  photoelectric: 'bg-project-photoelectric',
  skincare: 'bg-project-skincare',
  surgery: 'bg-project-surgery',
};

export default function Overview() {
  const navigate = useNavigate();
  const { currentStoreId, setCurrentStoreId } = useGlobalStore();
  const [detailStoreId, setDetailStoreId] = useState<string | null>(null);
  const currentStore = STORES.find((s) => s.id === currentStoreId) || STORES[0];

  const trendData = useMemo(() => generateTrendData(), []);
  const storeRanking = useMemo(() => generateStoreRanking(), []);

  const detailStore = useMemo(
    () => (detailStoreId ? STORES.find((s) => s.id === detailStoreId) || null : null),
    [detailStoreId]
  );

  const kpiData = [
    {
      title: '今日接诊总数',
      value: currentStore.todayConsultations,
      unit: '人次',
      icon: UserCheck,
      trend: 12.5,
      gradientClass: 'bg-gradient-kpi1',
      colorClass: 'text-primary-400',
    },
    {
      title: '当前排队人数',
      value: currentStore.currentWaiting,
      unit: '人',
      icon: Users,
      trend: -5.2,
      gradientClass: 'bg-gradient-kpi2',
      colorClass: 'text-project-photoelectric',
    },
    {
      title: '最长等待时间',
      value: currentStore.longestWaitMinutes,
      unit: '分钟',
      icon: Clock,
      trend: 8.3,
      gradientClass: 'bg-gradient-kpi3',
      colorClass: 'text-status-warning',
    },
    {
      title: '空闲咨询师',
      value: `${currentStore.freeConsultants}/${currentStore.totalConsultants}`,
      icon: Calendar,
      trend: 0,
      gradientClass: 'bg-gradient-kpi4',
      colorClass: 'text-status-success',
    },
  ];

  const statusDotClass = (status: Store['status']) => {
    switch (status) {
      case 'critical':
        return 'bg-status-critical shadow-glow-critical';
      case 'warning':
        return 'bg-status-warning shadow-glow-warning';
      default:
        return 'bg-status-success shadow-glow-success';
    }
  };

  const statusLabel = (status: Store['status']) => {
    switch (status) {
      case 'critical':
        return '严重拥挤';
      case 'warning':
        return '轻微拥挤';
      default:
        return '运营正常';
    }
  };

  const handleRowClick = (storeId: string) => {
    setDetailStoreId(storeId === detailStoreId ? null : storeId);
  };

  const handleNavigate = (path: string, storeId: string) => {
    setCurrentStoreId(storeId);
    setDetailStoreId(null);
    navigate(path);
  };

  const renderDetailPanel = () => {
    if (!detailStore) return null;

    const queuingCustomers = generateQueuingCustomers(detailStore.id);
    const storeAlerts = generateAlerts(detailStore.id);
    const storeConsultants = CONSULTANTS.filter((c) => c.storeId === detailStore.id);

    const customersByType: Record<ProjectType, number> = {
      hyaluronic: 0,
      photoelectric: 0,
      skincare: 0,
      surgery: 0,
    };
    queuingCustomers.forEach((c) => {
      customersByType[c.projectType]++;
    });

    const timeoutCount = queuingCustomers.filter((c) => c.status === 'timeout').length;
    const arrivedNotConsultedCount = queuingCustomers.filter(
      (c) => c.status === 'waiting' && c.waitMinutes >= detailStore.lateThresholdMin
    ).length;

    const consultantStats: Record<ConsultantStatus, number> = {
      busy: 0,
      free: 0,
      break: 0,
    };
    storeConsultants.forEach((c) => {
      consultantStats[c.status]++;
    });

    const unhandledAlerts = storeAlerts.filter((a) => !a.isHandled);
    const timeoutWaitAlerts = storeAlerts.filter((a) => a.type === 'timeout_wait' && !a.isHandled);
    const arrivedNotConsultedAlerts = storeAlerts.filter(
      (a) => a.type === 'arrived_not_consulted' && !a.isHandled
    );
    const recentAlerts = unhandledAlerts.slice(0, 3);

    return (
      <>
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300"
          onClick={() => setDetailStoreId(null)}
        />
        <aside
          className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md flex flex-col
                     bg-dark-900 border-l border-white/10 shadow-2xl
                     animate-slide-in-right overflow-hidden"
        >
          <header className="relative overflow-hidden px-6 pt-6 pb-5 border-b border-white/10 bg-gradient-to-b from-primary-500/20 via-primary-500/5 to-transparent">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className="w-12 h-12 rounded-2xl flex-shrink-0 flex items-center justify-center bg-primary-500/20 border border-primary-500/30">
                  <MapPin className="w-6 h-6 text-primary-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-white truncate">{detailStore.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-white/50">{detailStore.city}</span>
                    <span className={cn('w-2 h-2 rounded-full', statusDotClass(detailStore.status))} />
                    <span className="text-xs text-white/70">{statusLabel(detailStore.status)}</span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDetailStoreId(null)}
                className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center
                           text-white/60 hover:text-white hover:bg-white/10
                           transition-all duration-200"
                aria-label="关闭"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-4 gap-2 mt-5">
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 text-center">
                <p className="text-[10px] text-white/45 leading-tight">今日接诊</p>
                <p className="text-base font-bold text-white tabular-nums mt-0.5">
                  {detailStore.todayConsultations}
                  <span className="text-[10px] font-normal text-white/40 ml-0.5">人</span>
                </p>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 text-center">
                <p className="text-[10px] text-white/45 leading-tight">当前排队</p>
                <p className="text-base font-bold text-white tabular-nums mt-0.5">
                  {detailStore.currentWaiting}
                  <span className="text-[10px] font-normal text-white/40 ml-0.5">人</span>
                </p>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 text-center">
                <p className="text-[10px] text-white/45 leading-tight">最长等待</p>
                <p className="text-base font-bold text-status-warning tabular-nums mt-0.5">
                  {detailStore.longestWaitMinutes}
                  <span className="text-[10px] font-normal text-white/40 ml-0.5">分</span>
                </p>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 text-center">
                <p className="text-[10px] text-white/45 leading-tight">空闲咨询</p>
                <p className="text-base font-bold text-status-success tabular-nums mt-0.5">
                  {detailStore.freeConsultants}
                  <span className="text-[10px] font-normal text-white/40 ml-0.5">/{detailStore.totalConsultants}</span>
                </p>
              </div>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto scrollbar-thin">
            <div className="p-6 space-y-5">
              <section>
                <h4 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" />
                  排队摘要
                </h4>
                <div className="rounded-xl bg-white/[0.03] border border-white/5 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-white/60">项目分布</span>
                    <span className="text-[10px] text-white/40">
                      共 {queuingCustomers.length} 人
                    </span>
                  </div>
                  <div className="flex items-center gap-4 flex-wrap">
                    {PROJECT_TYPES.map((type) => (
                      <div key={type} className="flex items-center gap-1.5">
                        <span className={cn('w-2.5 h-2.5 rounded-full', projectTypeDotColors[type])} />
                        <span className="text-[11px] text-white/50">{getProjectTypeName(type).slice(0, 4)}</span>
                        <span className="text-xs font-semibold text-white/90 tabular-nums">
                          {customersByType[type]}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="pt-3 border-t border-white/5 grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-status-critical/15 flex items-center justify-center">
                        <Clock className="w-3.5 h-3.5 text-status-critical" />
                      </div>
                      <div>
                        <p className="text-[10px] text-white/45 leading-tight">超时等待</p>
                        <p className="text-sm font-semibold text-status-critical tabular-nums leading-tight mt-0.5">
                          {timeoutCount} 人
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-rosegold-500/15 flex items-center justify-center">
                        <AlertCircle className="w-3.5 h-3.5 text-rosegold-400" />
                      </div>
                      <div>
                        <p className="text-[10px] text-white/45 leading-tight">到店未接诊</p>
                        <p className="text-sm font-semibold text-rosegold-400 tabular-nums leading-tight mt-0.5">
                          {arrivedNotConsultedCount} 人
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <h4 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <UserRound className="w-3.5 h-3.5" />
                  咨询师摘要
                </h4>
                <div className="rounded-xl bg-white/[0.03] border border-white/5 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-status-success" />
                        <span className="text-[11px] text-white/60">空闲 {consultantStats.free}</span>
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-primary-500" />
                        <span className="text-[11px] text-white/60">接诊 {consultantStats.busy}</span>
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-white/40" />
                        <span className="text-[11px] text-white/60">休息 {consultantStats.break}</span>
                      </span>
                    </div>
                    <span className="text-[10px] text-white/40">共 {storeConsultants.length} 人</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/5 overflow-hidden flex">
                    <div
                      className="bg-status-success h-full transition-all"
                      style={{
                        width: storeConsultants.length > 0 ? `${(consultantStats.free / storeConsultants.length) * 100}%` : '0%',
                      }}
                    />
                    <div
                      className="bg-primary-500 h-full transition-all"
                      style={{
                        width: storeConsultants.length > 0 ? `${(consultantStats.busy / storeConsultants.length) * 100}%` : '0%',
                      }}
                    />
                    <div
                      className="bg-white/30 h-full transition-all"
                      style={{
                        width: storeConsultants.length > 0 ? `${(consultantStats.break / storeConsultants.length) * 100}%` : '0%',
                      }}
                    />
                  </div>
                </div>
              </section>

              <section>
                <h4 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  预警摘要
                </h4>
                <div className="rounded-xl bg-white/[0.03] border border-white/5 p-4 space-y-3">
                  <div className="flex items-center gap-4 flex-wrap">
                    <div>
                      <p className="text-[10px] text-white/45 leading-tight">未处理</p>
                      <p className="text-sm font-semibold text-status-warning tabular-nums leading-tight mt-0.5">
                        {unhandledAlerts.length} 条
                      </p>
                    </div>
                    <div className="w-px h-8 bg-white/10" />
                    <div>
                      <p className="text-[10px] text-white/45 leading-tight">等待超时</p>
                      <p className="text-sm font-semibold text-status-critical tabular-nums leading-tight mt-0.5">
                        {timeoutWaitAlerts.length} 条
                      </p>
                    </div>
                    <div className="w-px h-8 bg-white/10" />
                    <div>
                      <p className="text-[10px] text-white/45 leading-tight">到店未接诊</p>
                      <p className="text-sm font-semibold text-rosegold-400 tabular-nums leading-tight mt-0.5">
                        {arrivedNotConsultedAlerts.length} 条
                      </p>
                    </div>
                  </div>
                  {recentAlerts.length > 0 && (
                    <div className="pt-3 border-t border-white/5 space-y-2">
                      <p className="text-[10px] text-white/45">最近预警</p>
                      {recentAlerts.map((alert) => (
                        <div
                          key={alert.id}
                          className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5"
                        >
                          <p className="text-xs text-white/70 line-clamp-1 leading-relaxed">
                            {alert.message}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </section>
            </div>
          </div>

          <footer className="px-6 py-5 border-t border-white/10 bg-dark-900/80 backdrop-blur-xl">
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleNavigate('/queue', detailStore.id)}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-medium
                           bg-primary-500/15 hover:bg-primary-500/25 border border-primary-500/30
                           text-primary-300 hover:text-primary-200 transition-all duration-200"
              >
                <Users className="w-3.5 h-3.5" />
                <span>实时排队</span>
                <ArrowRight className="w-3 h-3 opacity-70" />
              </button>
              <button
                type="button"
                onClick={() => handleNavigate('/consultant', detailStore.id)}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-medium
                           bg-project-skincare/15 hover:bg-project-skincare/25 border border-project-skincare/30
                           text-project-skincare hover:text-project-skincare transition-all duration-200"
              >
                <UserRound className="w-3.5 h-3.5" />
                <span>咨询师</span>
                <ArrowRight className="w-3 h-3 opacity-70" />
              </button>
              <button
                type="button"
                onClick={() => handleNavigate('/alert', detailStore.id)}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-medium
                           bg-status-critical/15 hover:bg-status-critical/25 border border-status-critical/30
                           text-status-critical hover:text-status-critical transition-all duration-200"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>预警中心</span>
                <ArrowRight className="w-3 h-3 opacity-70" />
              </button>
            </div>
          </footer>
        </aside>
      </>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">门店总览</h2>
          <p className="mt-1 text-sm text-white/50">
            <MapPin className="inline w-4 h-4 mr-1" />
            {currentStore.name} · {currentStore.city}
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10">
          <span
            className={cn(
              'w-2.5 h-2.5 rounded-full animate-pulse-slow',
              statusDotClass(currentStore.status)
            )}
          />
          <span className="text-sm text-white/70">{statusLabel(currentStore.status)}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        {kpiData.map((kpi, idx) => (
          <KpiCard
            key={kpi.title}
            title={kpi.title}
            value={kpi.value}
            unit={kpi.unit}
            icon={kpi.icon}
            trend={kpi.trend}
            gradientClass={kpi.gradientClass}
            colorClass={kpi.colorClass}
            delay={idx * 80}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <LineChartCard
          title="今日接诊&排队趋势"
          subtitle="按小时统计的接诊量与排队人数变化"
          data={trendData}
          xKey="time"
          lines={[
            {
              key: 'consultations',
              name: '接诊量',
              color: '#10B981',
              type: 'area',
            },
            {
              key: 'waiting',
              name: '排队人数',
              color: '#3B82F6',
              type: 'line',
            },
          ]}
        />
        <BarChartCard
          title="门店效率指数排名"
          subtitle="各门店综合运营效率对比"
          data={storeRanking.slice(0, 6)}
          xKey="storeName"
          bars={[
            {
              key: 'efficiencyScore',
              name: '效率指数',
              color: '#60A5FA',
            },
          ]}
          showLegend={false}
        />
      </div>

      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-lg font-semibold text-white">全部门店状态</h3>
            <p className="mt-1 text-sm text-white/50">实时监控各门店运营状况，点击行查看详情</p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-status-success" />
              <span className="text-white/60">正常</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-status-warning" />
              <span className="text-white/60">轻微拥挤</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-status-critical" />
              <span className="text-white/60">严重拥挤</span>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-white/45 border-b border-white/10">
                <th className="pb-3 font-medium">门店</th>
                <th className="pb-3 font-medium">城市</th>
                <th className="pb-3 font-medium text-center">排队/上限</th>
                <th className="pb-3 font-medium text-center">空闲/总数</th>
                <th className="pb-3 font-medium text-center">今日接诊</th>
                <th className="pb-3 font-medium text-center">最长等待</th>
                <th className="pb-3 font-medium text-center">状态</th>
              </tr>
            </thead>
            <tbody>
              {STORES.map((store) => (
                <tr
                  key={store.id}
                  onClick={() => handleRowClick(store.id)}
                  className={cn(
                    'border-b border-white/5 last:border-0 transition-colors cursor-pointer',
                    detailStoreId === store.id
                      ? 'bg-primary-500/[0.05]'
                      : 'hover:bg-white/[0.02]'
                  )}
                >
                  <td className="py-3.5">
                    <div className="flex items-center gap-2.5">
                      <MapPin className="w-4 h-4 text-primary-400" />
                      <span className="text-sm font-medium text-white/90">{store.name}</span>
                    </div>
                  </td>
                  <td className="py-3.5 text-sm text-white/60">{store.city}</td>
                  <td className="py-3.5 text-center">
                    <span className="text-sm font-semibold text-white/90 tabular-nums">
                      {store.currentWaiting}
                    </span>
                    <span className="text-sm text-white/40 tabular-nums">
                      {' '}
                      / {store.maxWaiting}
                    </span>
                  </td>
                  <td className="py-3.5 text-center">
                    <span className="text-sm font-semibold text-status-success tabular-nums">
                      {store.freeConsultants}
                    </span>
                    <span className="text-sm text-white/40 tabular-nums">
                      {' '}
                      / {store.totalConsultants}
                    </span>
                  </td>
                  <td className="py-3.5 text-center text-sm font-semibold text-white/90 tabular-nums">
                    {store.todayConsultations}
                  </td>
                  <td className="py-3.5 text-center">
                    <span
                      className={cn(
                        'text-sm font-semibold tabular-nums',
                        store.longestWaitMinutes >= 60
                          ? 'text-status-critical'
                          : store.longestWaitMinutes >= 40
                          ? 'text-status-warning'
                          : 'text-white/80'
                      )}
                    >
                      {store.longestWaitMinutes}分钟
                    </span>
                  </td>
                  <td className="py-3.5 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <span className={cn('w-2 h-2 rounded-full', statusDotClass(store.status))} />
                      <span className="text-xs text-white/70">
                        {store.status === 'normal' ? '正常' : store.status === 'warning' ? '拥挤' : '严重'}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {renderDetailPanel()}
    </div>
  );
}
