import { useMemo, useState } from 'react';
import {
  Clock,
  Users,
  TrendingUp,
  UserPlus,
  UserMinus,
  AlertCircle,
  Filter,
} from 'lucide-react';
import KpiCard from '../components/common/KpiCard';
import LineChartCard from '../components/charts/LineChartCard';
import BarChartCard from '../components/charts/BarChartCard';
import { generateWaitingAnalysis, generateCancelRecords, STORES } from '../data/mockData';
import { useGlobalStore } from '../store';
import { cn } from '../utils';
import type { ProjectType, CancelRecord } from '../types';

const projectTypeLabels: Record<ProjectType, string> = {
  hyaluronic: '玻尿酸',
  photoelectric: '光电',
  skincare: '皮肤',
  surgery: '手术',
};

const waitLevelColors = [
  { min: 0, max: 15, label: '正常', cls: 'text-status-success', bg: 'bg-status-success/15' },
  { min: 15, max: 30, label: '偏长', cls: 'text-status-info', bg: 'bg-status-info/15' },
  { min: 30, max: 45, label: '较长', cls: 'text-status-warning', bg: 'bg-status-warning/15' },
  { min: 45, max: Infinity, label: '过长', cls: 'text-status-critical', bg: 'bg-status-critical/15' },
];

export default function WaitingAnalysis() {
  const { currentStoreId } = useGlobalStore();
  const [cancelFilter, setCancelFilter] = useState<'all' | 'new' | 'old'>('all');
  const [projectFilter, setProjectFilter] = useState<'all' | ProjectType>('all');

  const currentStore = useMemo(
    () => STORES.find((s) => s.id === currentStoreId) ?? STORES[0],
    [currentStoreId]
  );

  const analysisData = useMemo(() => generateWaitingAnalysis(), []);
  const cancelRecords = useMemo(() => generateCancelRecords(), []);

  const businessHoursData = analysisData.filter((d) => d.hour >= 9 && d.hour <= 20);

  const overallStats = useMemo(() => {
    const businessData = businessHoursData;
    const totalWait = businessData.reduce((sum, d) => sum + d.avgWaitMinutes * (d.newCustomerCount + d.oldCustomerCount), 0);
    const totalCustomers = businessData.reduce((sum, d) => sum + d.newCustomerCount + d.oldCustomerCount, 0);
    const totalNew = businessData.reduce((sum, d) => sum + d.newCustomerCount, 0);
    const totalOld = businessData.reduce((sum, d) => sum + d.oldCustomerCount, 0);
    const totalPeak = businessData.reduce((sum, d) => sum + d.peakCount, 0);
    const avgWait = totalCustomers > 0 ? Math.round(totalWait / totalCustomers) : 0;
    const peakHour = businessData.reduce((max, d) => (d.peakCount > max.peakCount ? d : max), businessData[0]);
    return {
      avgWait,
      totalCustomers,
      totalNew,
      totalOld,
      avgPeak: Math.round(totalPeak / businessData.length),
      peakHour: `${peakHour.hour.toString().padStart(2, '0')}:00`,
      avgNewWait: totalNew > 0 ? Math.round(businessData.reduce((s, d) => s + d.newCustomerAvgWait * d.newCustomerCount, 0) / totalNew) : 0,
      avgOldWait: totalOld > 0 ? Math.round(businessData.reduce((s, d) => s + d.oldCustomerAvgWait * d.oldCustomerCount, 0) / totalOld) : 0,
    };
  }, [businessHoursData]);

  const filteredCancelRecords = useMemo(() => {
    return cancelRecords.filter((r) => {
      if (cancelFilter === 'new' && !r.isNewCustomer) return false;
      if (cancelFilter === 'old' && r.isNewCustomer) return false;
      if (projectFilter !== 'all' && r.projectType !== projectFilter) return false;
      return true;
    });
  }, [cancelRecords, cancelFilter, projectFilter]);

  const cancelByReason = useMemo(() => {
    const countMap: Record<string, number> = {};
    cancelRecords.forEach((r) => {
      countMap[r.cancelReason] = (countMap[r.cancelReason] || 0) + 1;
    });
    return Object.entries(countMap)
      .map(([reason, count]) => ({ reason, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }, [cancelRecords]);

  const waitTimeChartData = businessHoursData.map((d) => ({
    time: `${d.hour.toString().padStart(2, '0')}:00`,
    平均等待: d.avgWaitMinutes,
    新客等待: d.newCustomerAvgWait,
    老客等待: d.oldCustomerAvgWait,
  }));

  const flowChartData = businessHoursData.map((d) => ({
    time: `${d.hour.toString().padStart(2, '0')}:00`,
    新客数: d.newCustomerCount,
    老客数: d.oldCustomerCount,
    峰值人数: d.peakCount,
  }));

  const cancelReasonChartData = cancelByReason.map((r) => ({
    reason: r.reason.length > 8 ? r.reason.slice(0, 8) + '...' : r.reason,
    取消数: r.count,
  }));

  const getWaitLevel = (minutes: number) => {
    return waitLevelColors.find((l) => minutes >= l.min && minutes < l.max) || waitLevelColors[waitLevelColors.length - 1];
  };

  const avgWaitLevel = getWaitLevel(overallStats.avgWait);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">顾客等待分析</h2>
        <p className="mt-1 text-sm text-white/50">
          多维度分析顾客等待时间、客流分布和取消原因，帮助优化运营效率
        </p>
        <div className="mt-2 flex items-center gap-2 text-xs">
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary-500/15 text-primary-300 border border-primary-500/25">
            <span className="w-1.5 h-1.5 rounded-full bg-primary-400" />
            当前门店：{currentStore.name}
          </span>
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/5 text-white/50 border border-white/10">
            目前展示全品牌平均数据
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
        <KpiCard
          title="整体平均等待"
          value={overallStats.avgWait}
          unit="分钟"
          icon={Clock}
          gradientClass="bg-gradient-kpi1"
          colorClass="text-primary-400"
          delay={0}
        />
        <div className={cn('glass-card p-5 border-2', avgWaitLevel.bg, 'border-opacity-50')}>
          <div className="flex items-center justify-between">
            <AlertCircle className={cn('w-6 h-6', avgWaitLevel.cls)} />
            <span className={cn('px-3 py-1 rounded-full text-xs font-semibold', avgWaitLevel.bg, avgWaitLevel.cls)}>
              {avgWaitLevel.label}
            </span>
          </div>
          <p className="mt-4 text-xs font-medium text-white/50">等待等级</p>
          <p className={cn('mt-1 text-2xl font-bold', avgWaitLevel.cls)}>
            {avgWaitLevel.label}
          </p>
        </div>
        <KpiCard
          title="今日总客流"
          value={overallStats.totalCustomers}
          unit="人"
          icon={Users}
          trend={8.7}
          gradientClass="bg-gradient-kpi2"
          colorClass="text-project-photoelectric"
          delay={80}
        />
        <KpiCard
          title="新客/老客"
          value={`${overallStats.totalNew}/${overallStats.totalOld}`}
          icon={Users}
          gradientClass="bg-gradient-kpi3"
          colorClass="text-project-skincare"
          delay={160}
        />
        <KpiCard
          title="高峰时段"
          value={overallStats.peakHour}
          icon={TrendingUp}
          gradientClass="bg-gradient-kpi4"
          colorClass="text-status-critical"
          delay={240}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <LineChartCard
          title="等待时间趋势"
          subtitle="按小时统计的平均等待时长（新客vs老客）"
          data={waitTimeChartData}
          xKey="time"
          lines={[
            { key: '平均等待', name: '平均等待', color: '#60A5FA' },
            { key: '新客等待', name: '新客等待', color: '#F472B6' },
            { key: '老客等待', name: '老客等待', color: '#34D399', type: 'line' },
          ]}
        />
        <BarChartCard
          title="新老客分布"
          subtitle="按小时统计的新客与老客到店人数"
          data={flowChartData}
          xKey="time"
          bars={[
            { key: '新客数', name: '新客数', color: '#F472B6' },
            { key: '老客数', name: '老客数', color: '#34D399' },
          ]}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <BarChartCard
          title="取消原因TOP6"
          subtitle="按取消原因统计的取消数量"
          data={cancelReasonChartData}
          xKey="reason"
          bars={[{ key: '取消数', name: '取消数', color: '#F87171' }]}
          showLegend={false}
        />
        <div className="xl:col-span-2 glass-card p-6">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
            <div>
              <h3 className="text-lg font-semibold text-white">取消记录明细</h3>
              <p className="mt-1 text-sm text-white/50">
                共 {filteredCancelRecords.length} 条取消记录
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5">
                <Filter className="w-4 h-4 text-white/40" />
                <div className="flex rounded-lg border border-white/10 overflow-hidden">
                  {(['all', 'new', 'old'] as const).map((f) => (
                    <button
                      key={f}
                      onClick={() => setCancelFilter(f)}
                      className={cn(
                        'px-3 py-1.5 text-xs font-medium transition-all',
                        cancelFilter === f
                          ? 'bg-primary-500/20 text-primary-300'
                          : 'text-white/60 hover:text-white/80 hover:bg-white/5'
                      )}
                    >
                      {f === 'all' ? '全部' : f === 'new' ? '新客' : '老客'}
                    </button>
                  ))}
                </div>
              </div>
              <select
                value={projectFilter}
                onChange={(e) => setProjectFilter(e.target.value as any)}
                className="px-3 py-1.5 text-xs rounded-lg bg-white/5 border border-white/10 text-white/70 focus:outline-none focus:border-primary-500/50"
              >
                <option value="all">全部项目</option>
                {Object.entries(projectTypeLabels).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="overflow-x-auto max-h-[420px] overflow-y-auto scrollbar-thin">
            <table className="w-full">
              <thead className="sticky top-0 z-10 backdrop-blur-md bg-dark-900/85">
                <tr className="text-left text-xs text-white/45 border-b border-white/10">
                  <th className="pb-3 font-medium whitespace-nowrap">顾客</th>
                  <th className="pb-3 font-medium whitespace-nowrap">类型</th>
                  <th className="pb-3 font-medium whitespace-nowrap">项目</th>
                  <th className="pb-3 font-medium whitespace-nowrap">等待时长</th>
                  <th className="pb-3 font-medium whitespace-nowrap">取消时间</th>
                  <th className="pb-3 font-medium">取消原因</th>
                </tr>
              </thead>
              <tbody>
                {filteredCancelRecords.map((record) => {
                  const waitLevel = getWaitLevel(record.waitMinutes);
                  return (
                    <tr
                      key={record.id}
                      className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm font-medium text-white/80">
                            {record.customerName[0]}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white/90">
                              {record.customerName}
                            </p>
                            <p className="text-[10px] text-white/40 tabular-nums">
                              {record.phone}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3">
                        <span
                          className={cn(
                            'badge',
                            record.isNewCustomer
                              ? 'bg-primary-500/20 text-primary-300 border-primary-500/30'
                              : 'bg-white/5 text-white/60 border-white/10'
                          )}
                        >
                          {record.isNewCustomer ? '新客' : '老客'}
                        </span>
                      </td>
                      <td className="py-3">
                        <span className="text-sm text-white/80">
                          {projectTypeLabels[record.projectType]}
                        </span>
                      </td>
                      <td className="py-3">
                        <span className={cn('text-sm font-semibold tabular-nums', waitLevel.cls)}>
                          {record.waitMinutes}分钟
                        </span>
                      </td>
                      <td className="py-3 text-sm text-white/60 tabular-nums whitespace-nowrap">
                        {record.cancelTime.slice(11, 16)}
                      </td>
                      <td className="py-3 text-sm text-white/70 max-w-[200px] truncate">
                        {record.cancelReason}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
