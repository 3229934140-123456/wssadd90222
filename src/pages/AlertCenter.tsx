import { useState, useMemo, useEffect } from 'react';
import {
  AlertTriangle,
  Clock,
  Repeat,
  CheckCircle2,
  Filter,
  Search,
  X,
  AlertCircle,
} from 'lucide-react';
import AlertItem from '../components/alert/AlertItem';
import AlertDetailPanel from '../components/alert/AlertDetailPanel';
import KpiCard from '../components/common/KpiCard';
import { generateAlerts } from '../data/mockData';
import { useGlobalStore } from '../store';
import { cn } from '../utils';
import type { Alert, AlertType, AlertSeverity } from '../types';

const typeConfig: Record<AlertType, { label: string; icon: typeof Clock }> = {
  timeout_wait: { label: '等待超时', icon: Clock },
  long_occupation: { label: '占用过长', icon: AlertTriangle },
  frequent_reassign: { label: '频繁改派', icon: Repeat },
  arrived_not_consulted: { label: '到店未接诊', icon: AlertCircle },
};

const severityConfig: Record<AlertSeverity, { label: string; cls: string }> = {
  critical: { label: '紧急', cls: 'bg-status-critical/20 text-status-critical border-status-critical/40' },
  high: { label: '高', cls: 'bg-status-warning/20 text-status-warning border-status-warning/40' },
  medium: { label: '中', cls: 'bg-status-info/20 text-status-info border-status-info/40' },
  low: { label: '低', cls: 'bg-white/5 text-white/60 border-white/15' },
};

export default function AlertCenter() {
  const {
    currentStoreId,
    selectedAlertId,
    setSelectedAlertId,
    alertFilter,
    setAlertFilter,
    unhandledAlertsCount,
    setUnhandledAlertsCount,
  } = useGlobalStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState<'all' | AlertSeverity>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'unhandled' | 'handled'>('all');
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    const generated = generateAlerts(currentStoreId);
    setAlerts(generated);
    const count = generated.filter((a) => !a.isHandled).length;
    setUnhandledAlertsCount(count);
  }, [currentStoreId, setUnhandledAlertsCount]);

  const filteredAlerts = useMemo(() => {
    return alerts.filter((alert) => {
      if (alertFilter !== 'all' && alert.type !== alertFilter) return false;
      if (severityFilter !== 'all' && alert.severity !== severityFilter) return false;
      if (statusFilter === 'unhandled' && alert.isHandled) return false;
      if (statusFilter === 'handled' && !alert.isHandled) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (
          !alert.message.toLowerCase().includes(q) &&
          !alert.storeName.toLowerCase().includes(q) &&
          (alert.customerName?.toLowerCase().includes(q) === false) &&
          (alert.consultantName?.toLowerCase().includes(q) === false)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [alerts, alertFilter, severityFilter, statusFilter, searchQuery]);

  const selectedAlert = useMemo(() => {
    return alerts.find((a) => a.id === selectedAlertId) || null;
  }, [alerts, selectedAlertId]);

  const stats = useMemo(() => {
    return {
      total: alerts.length,
      unhandled: alerts.filter((a) => !a.isHandled).length,
      critical: alerts.filter((a) => a.severity === 'critical' && !a.isHandled).length,
      timeout: alerts.filter((a) => a.type === 'timeout_wait' && !a.isHandled).length,
      arrived: alerts.filter((a) => a.type === 'arrived_not_consulted' && !a.isHandled).length,
    };
  }, [alerts]);

  const handleAlert = (note: string) => {
    if (!selectedAlert) return;
    setAlerts((prev) =>
      prev.map((a) =>
        a.id === selectedAlert.id
          ? {
              ...a,
              isHandled: true,
              handledAt: new Date().toISOString(),
              handledBy: '张明',
              handleNote: note || '已处理',
            }
          : a
      )
    );
    setUnhandledAlertsCount(Math.max(0, unhandledAlertsCount - 1));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">预警中心</h2>
          <p className="mt-1 text-sm text-white/50">
            集中管理所有运营预警，及时处理异常情况
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <KpiCard
          title="预警总数"
          value={stats.total}
          unit="条"
          icon={AlertTriangle}
          gradientClass="bg-gradient-kpi1"
          colorClass="text-primary-400"
          delay={0}
        />
        <KpiCard
          title="待处理"
          value={stats.unhandled}
          unit="条"
          icon={Clock}
          gradientClass="bg-gradient-kpi2"
          colorClass="text-status-warning"
          delay={60}
        />
        <KpiCard
          title="紧急预警"
          value={stats.critical}
          unit="条"
          icon={AlertTriangle}
          gradientClass="bg-gradient-kpi3"
          colorClass="text-status-critical"
          delay={120}
        />
        <KpiCard
          title="等待超时"
          value={stats.timeout}
          unit="条"
          icon={Clock}
          gradientClass="bg-gradient-kpi4"
          colorClass="text-project-hyaluronic"
          delay={180}
        />
        <KpiCard
          title="到店未接诊"
          value={stats.arrived}
          unit="条"
          icon={AlertCircle}
          gradientClass="bg-gradient-kpi1"
          colorClass="text-rosegold-400"
          delay={240}
        />
      </div>

      <div className="glass-card p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <Filter className="w-4 h-4 text-white/40" />
            <div className="flex rounded-lg border border-white/10 overflow-hidden">
              {(['all', 'timeout_wait', 'long_occupation', 'frequent_reassign', 'arrived_not_consulted'] as const).map(
                (f) => {
                  const Icon = typeConfig[f]?.icon || Filter;
                  return (
                    <button
                      key={f}
                      onClick={() => setAlertFilter(f)}
                      className={cn(
                        'px-3 py-1.5 text-xs font-medium transition-all flex items-center gap-1.5',
                        alertFilter === f
                          ? 'bg-primary-500/20 text-primary-300'
                          : 'text-white/60 hover:text-white/80 hover:bg-white/5'
                      )}
                    >
                      {f !== 'all' && <Icon className="w-3 h-3" />}
                      {f === 'all' ? '全部类型' : typeConfig[f as AlertType].label}
                    </button>
                  );
                }
              )}
            </div>
            <div className="flex rounded-lg border border-white/10 overflow-hidden ml-2">
              {(['all', 'unhandled', 'handled'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setStatusFilter(f)}
                  className={cn(
                    'px-3 py-1.5 text-xs font-medium transition-all flex items-center gap-1.5',
                    statusFilter === f
                      ? 'bg-white/10 text-white'
                      : 'text-white/60 hover:text-white/80 hover:bg-white/5'
                  )}
                >
                  {f === 'all'
                    ? '全部状态'
                    : f === 'unhandled'
                    ? '待处理'
                    : '已处理'}
                </button>
              ))}
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索预警内容、门店、顾客..."
              className="pl-9 pr-9 py-2 w-64 text-sm rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-primary-500/50 focus:bg-white/[0.07] transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center rounded text-white/40 hover:text-white/70 hover:bg-white/10 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t border-white/5">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-white/45">严重度:</span>
            {(Object.keys(severityConfig) as AlertSeverity[]).map((s) => (
              <button
                key={s}
                onClick={() =>
                  setSeverityFilter(severityFilter === s ? 'all' : s)
                }
                className={cn(
                  'badge border transition-all',
                  severityConfig[s].cls,
                  severityFilter === s && 'ring-2 ring-offset-1 ring-offset-dark-800 ring-white/30'
                )}
              >
                {severityConfig[s].label}
              </button>
            ))}
          </div>
          <div className="text-xs text-white/45 ml-auto">
            共找到 <span className="text-white/80 font-semibold">{filteredAlerts.length}</span> 条预警
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 max-h-[calc(100vh-440px)] overflow-y-auto pr-1 scrollbar-thin">
        {filteredAlerts.length === 0 ? (
          <div className="col-span-full glass-card py-20 flex flex-col items-center justify-center text-white/35">
            <CheckCircle2 className="w-14 h-14 mb-4 opacity-50" />
            <p className="text-base font-medium">暂无符合条件的预警</p>
            <p className="text-sm mt-1 opacity-70">尝试调整筛选条件</p>
          </div>
        ) : (
          filteredAlerts.map((alert) => (
            <AlertItem
              key={alert.id}
              alert={alert}
              isSelected={selectedAlertId === alert.id}
              onClick={() =>
                setSelectedAlertId(selectedAlertId === alert.id ? null : alert.id)
              }
            />
          ))
        )}
      </div>

      <AlertDetailPanel
        alert={selectedAlert}
        onClose={() => setSelectedAlertId(null)}
        onHandle={handleAlert}
      />
    </div>
  );
}


