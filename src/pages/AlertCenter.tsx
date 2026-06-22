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
  CalendarDays,
} from 'lucide-react';
import AlertItem from '../components/alert/AlertItem';
import AlertDetailPanel from '../components/alert/AlertDetailPanel';
import KpiCard from '../components/common/KpiCard';
import { generateAlerts } from '../data/mockData';
import { useGlobalStore } from '../store';
import { cn } from '../utils';
import type { Alert, AlertType, AlertSeverity, HandleAction } from '../types';
import type { PersistedHandledAlert } from '../utils/storage';

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

const handleActionLabels: Record<HandleAction, string> = {
  arrange_consultant: '安排空闲咨询师',
  apologize_customer: '向顾客致歉补偿',
  open_room: '增开临时咨询室',
  adjust_schedule: '调整预约间隔',
  reassign: '改派其他咨询师',
  other: '其他',
};

function persistedToAlert(p: PersistedHandledAlert): Alert {
  return {
    id: p.id,
    type: p.alertType,
    severity: p.severity,
    storeId: p.storeId,
    storeName: p.storeName,
    customerName: p.customerName,
    consultantName: p.consultantName,
    message: p.message,
    triggeredAt: p.triggeredAt,
    isHandled: true,
    handledBy: p.handledBy,
    handledAt: p.handledAt,
    handleNote: p.handleNote,
    handleAction: p.handleAction,
    suggestion: p.suggestion,
  };
}

export default function AlertCenter() {
  const {
    currentStoreId,
    selectedAlertId,
    setSelectedAlertId,
    alertFilter,
    setAlertFilter,
    unhandledAlertsCount,
    setUnhandledAlertsCount,
    handledAlerts,
  } = useGlobalStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState<'all' | AlertSeverity>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'unhandled' | 'handled'>('all');
  const [viewMode, setViewMode] = useState<'alert' | 'record'>('alert');
  const [priorityOnly, setPriorityOnly] = useState(false);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [handledByFilter, setHandledByFilter] = useState<string>('all');
  const [handleActionFilter, setHandleActionFilter] = useState<'all' | HandleAction>('all');
  const [dateStart, setDateStart] = useState<string>('');
  const [dateEnd, setDateEnd] = useState<string>('');

  useEffect(() => {
    const generated = generateAlerts(currentStoreId);
    setAlerts(generated);
    const count = generated.filter((a) => !a.isHandled).length;
    setUnhandledAlertsCount(count);
  }, [currentStoreId, setUnhandledAlertsCount]);

  const handledByOptions = useMemo(() => {
    const set = new Set<string>();
    handledAlerts.forEach((a) => a.handledBy && set.add(a.handledBy));
    return Array.from(set);
  }, [handledAlerts]);

  const sourceList = useMemo<Alert[]>(() => {
    if (viewMode === 'record') {
      return handledAlerts.map(persistedToAlert);
    }
    return alerts;
  }, [viewMode, handledAlerts, alerts]);

  const filteredAlerts = useMemo(() => {
    return sourceList.filter((alert) => {
      if (viewMode !== 'record') {
        if (statusFilter === 'unhandled' && alert.isHandled) return false;
        if (statusFilter === 'handled' && !alert.isHandled) return false;
      }
      if (priorityOnly && !alert.isPriorityFollowUp) return false;
      if (alertFilter !== 'all' && alert.type !== alertFilter) return false;
      if (severityFilter !== 'all' && alert.severity !== severityFilter) return false;

      if (viewMode === 'record') {
        if (handledByFilter !== 'all' && alert.handledBy !== handledByFilter) return false;
        if (handleActionFilter !== 'all' && alert.handleAction !== handleActionFilter) return false;
        if (dateStart && alert.handledAt) {
          const start = new Date(dateStart + 'T00:00:00').getTime();
          const h = new Date(alert.handledAt).getTime();
          if (h < start) return false;
        }
        if (dateEnd && alert.handledAt) {
          const end = new Date(dateEnd + 'T23:59:59').getTime();
          const h = new Date(alert.handledAt).getTime();
          if (h > end) return false;
        }
      }

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
  }, [sourceList, viewMode, alertFilter, severityFilter, statusFilter, searchQuery, handledByFilter, handleActionFilter, dateStart, dateEnd, priorityOnly]);

  const selectedAlert = useMemo(() => {
    return sourceList.find((a) => a.id === selectedAlertId) || null;
  }, [sourceList, selectedAlertId]);

  const stats = useMemo(() => {
    if (viewMode === 'record') {
      return {
        total: handledAlerts.length,
        unhandled: 0,
        critical: handledAlerts.filter((a) => a.severity === 'critical').length,
        timeout: handledAlerts.filter((a) => a.alertType === 'timeout_wait').length,
        arrived: handledAlerts.filter((a) => a.alertType === 'arrived_not_consulted').length,
        priorityFollowUp: 0,
      };
    }
    return {
      total: alerts.length,
      unhandled: alerts.filter((a) => !a.isHandled).length,
      critical: alerts.filter((a) => a.severity === 'critical' && !a.isHandled).length,
      timeout: alerts.filter((a) => a.type === 'timeout_wait' && !a.isHandled).length,
      arrived: alerts.filter((a) => a.type === 'arrived_not_consulted' && !a.isHandled).length,
      priorityFollowUp: alerts.filter((a) => a.isPriorityFollowUp && !a.isHandled).length,
    };
  }, [viewMode, alerts, handledAlerts]);

  const handleAlert = (action: HandleAction, note: string) => {
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
              handleAction: action,
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

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
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
          title="重点跟进"
          value={stats.priorityFollowUp}
          unit="条"
          icon={AlertTriangle}
          gradientClass="bg-gradient-kpi3"
          colorClass="text-status-critical"
          delay={120}
        />
        <KpiCard
          title="紧急预警"
          value={stats.critical}
          unit="条"
          icon={AlertTriangle}
          gradientClass="bg-gradient-kpi3"
          colorClass="text-status-critical"
          delay={180}
        />
        <KpiCard
          title="等待超时"
          value={stats.timeout}
          unit="条"
          icon={Clock}
          gradientClass="bg-gradient-kpi4"
          colorClass="text-project-hyaluronic"
          delay={240}
        />
        <KpiCard
          title="到店未接诊"
          value={stats.arrived}
          unit="条"
          icon={AlertCircle}
          gradientClass="bg-gradient-kpi1"
          colorClass="text-rosegold-400"
          delay={300}
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
            <div className="flex rounded-lg border border-status-success/30 overflow-hidden ml-2">
              {(['alert', 'record'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setViewMode(m)}
                  className={cn(
                    'px-3 py-1.5 text-xs font-medium transition-all flex items-center gap-1.5',
                    viewMode === m
                      ? m === 'record'
                        ? 'bg-status-success/20 text-status-success'
                        : 'bg-primary-500/20 text-primary-300'
                      : 'text-white/60 hover:text-white/80 hover:bg-white/5'
                  )}
                >
                  {m === 'alert' ? '预警列表' : '处理记录'}
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
          <button
            type="button"
            onClick={() => setPriorityOnly(!priorityOnly)}
            className={cn(
              'badge border transition-all text-xs inline-flex items-center gap-1.5',
              priorityOnly
                ? 'bg-status-critical/20 text-status-critical border-status-critical/40'
                : 'bg-white/5 text-white/60 border-white/15 hover:bg-white/10 hover:text-white/80'
            )}
          >
            🔥 仅看重点跟进
          </button>
          <div className="text-xs text-white/45 ml-auto">
            共找到 <span className="text-white/80 font-semibold">{filteredAlerts.length}</span> {viewMode === 'record' ? '条记录' : '条预警'}
          </div>
        </div>

        {viewMode === 'record' && (
          <div className="flex flex-wrap items-center gap-3 mt-4 pt-4 border-t border-white/5">
            <div className="flex items-center gap-2">
              <span className="text-xs text-white/45">处理人:</span>
              <select
                value={handledByFilter}
                onChange={(e) => setHandledByFilter(e.target.value)}
                className="input-field !py-1.5 !px-2 text-xs w-auto min-w-[120px]"
              >
                <option value="all">全部</option>
                {handledByOptions.map((name) => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-white/45">处理动作:</span>
              <select
                value={handleActionFilter}
                onChange={(e) => setHandleActionFilter(e.target.value as 'all' | HandleAction)}
                className="input-field !py-1.5 !px-2 text-xs w-auto min-w-[150px]"
              >
                <option value="all">全部</option>
                {(Object.keys(handleActionLabels) as HandleAction[]).map((a) => (
                  <option key={a} value={a}>{handleActionLabels[a]}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <CalendarDays className="w-3.5 h-3.5 text-white/40" />
              <input
                type="date"
                value={dateStart}
                onChange={(e) => setDateStart(e.target.value)}
                className="input-field !py-1.5 !px-2 text-xs w-auto"
              />
              <span className="text-xs text-white/30">至</span>
              <input
                type="date"
                value={dateEnd}
                onChange={(e) => setDateEnd(e.target.value)}
                className="input-field !py-1.5 !px-2 text-xs w-auto"
              />
            </div>

            <div className="flex items-center gap-1.5 ml-2">
              {(['today', '7d', '30d'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => {
                    const now = new Date();
                    const fmt = (d: Date) => d.toISOString().slice(0, 10);
                    if (p === 'today') {
                      setDateStart(fmt(now));
                      setDateEnd(fmt(now));
                    } else if (p === '7d') {
                      const s = new Date();
                      s.setDate(s.getDate() - 6);
                      setDateStart(fmt(s));
                      setDateEnd(fmt(now));
                    } else {
                      const s = new Date();
                      s.setDate(s.getDate() - 29);
                      setDateStart(fmt(s));
                      setDateEnd(fmt(now));
                    }
                  }}
                  className={cn(
                    'px-2.5 py-1 text-xs rounded-md border transition-all',
                    'border-white/10 text-white/55 hover:text-white/80 hover:border-white/20 hover:bg-white/5'
                  )}
                >
                  {p === 'today' ? '今日' : p === '7d' ? '近7天' : '近30天'}
                </button>
              ))}
            </div>

            {(dateStart || dateEnd || handledByFilter !== 'all' || handleActionFilter !== 'all') && (
              <button
                onClick={() => {
                  setHandledByFilter('all');
                  setHandleActionFilter('all');
                  setDateStart('');
                  setDateEnd('');
                }}
                className="ml-auto text-xs text-white/45 hover:text-white/75 transition-colors inline-flex items-center gap-1"
              >
                <X className="w-3 h-3" />
                清除筛选
              </button>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 max-h-[calc(100vh-440px)] overflow-y-auto pr-1 scrollbar-thin">
        {filteredAlerts.length === 0 ? (
          <div className="col-span-full glass-card py-20 flex flex-col items-center justify-center text-white/35">
            <CheckCircle2 className="w-14 h-14 mb-4 opacity-50" />
            <p className="text-base font-medium">
              {viewMode === 'record' ? '暂无处理记录' : '暂无符合条件的预警'}
            </p>
            <p className="text-sm mt-1 opacity-70">尝试调整筛选条件</p>
          </div>
        ) : (
          filteredAlerts.map((alert) => (
            <AlertItem
              key={alert.id}
              alert={alert}
              mode={viewMode}
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


