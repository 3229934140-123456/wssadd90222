import { useMemo } from 'react';
import {
  Users,
  UserCheck,
  Clock,
  AlertTriangle,
  TrendingUp,
  Calendar,
  MapPin,
} from 'lucide-react';
import KpiCard from '../components/common/KpiCard';
import LineChartCard from '../components/charts/LineChartCard';
import BarChartCard from '../components/charts/BarChartCard';
import { STORES } from '../data/stores';
import {
  generateTrendData,
  generateStoreRanking,
} from '../data/mockData';
import { useGlobalStore } from '../store';
import { cn } from '../lib/utils';

export default function Overview() {
  const { currentStoreId } = useGlobalStore();
  const currentStore = STORES.find((s) => s.id === currentStoreId) || STORES[0];

  const trendData = useMemo(() => generateTrendData(), []);
  const storeRanking = useMemo(() => generateStoreRanking(), []);

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

  const statusDotClass = (status: string) => {
    switch (status) {
      case 'critical':
        return 'bg-status-critical shadow-glow-critical';
      case 'warning':
        return 'bg-status-warning shadow-glow-warning';
      default:
        return 'bg-status-success shadow-glow-success';
    }
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
          <span className="text-sm text-white/70">
            {currentStore.status === 'normal'
              ? '运营正常'
              : currentStore.status === 'warning'
              ? '轻微拥挤'
              : '严重拥挤'}
          </span>
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
            <p className="mt-1 text-sm text-white/50">实时监控各门店运营状况</p>
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
                  className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors"
                >
                  <td className="py-3.5">
                    <div className="flex items-center gap-2.5">
                      <MapPin className="w-4 h-4 text-primary-400" />
                      <span className="text-sm font-medium text-white/90">
                        {store.name}
                      </span>
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
                      <span
                        className={cn(
                          'w-2 h-2 rounded-full',
                          statusDotClass(store.status)
                        )}
                      />
                      <span className="text-xs text-white/70">
                        {store.status === 'normal'
                          ? '正常'
                          : store.status === 'warning'
                          ? '拥挤'
                          : '严重'}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
