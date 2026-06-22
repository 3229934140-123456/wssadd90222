import { useState } from 'react';
import {
  X,
  Sparkles,
  Send,
  Store,
  UserRound,
  Users,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Info,
  MessageSquareText,
  UserCheck,
} from 'lucide-react';
import { cn, formatDateTime } from '../../utils';
import type { Alert, AlertType, HandleAction } from '../../types';

interface AlertDetailPanelProps {
  alert: Alert | null;
  onClose: () => void;
  onHandle: (action: HandleAction, note: string) => void;
}

const handleActionConfig: Record<HandleAction, { label: string; applicableTypes: AlertType[] }> = {
  arrange_consultant: {
    label: '立即安排空闲咨询师',
    applicableTypes: ['timeout_wait', 'arrived_not_consulted'],
  },
  apologize_customer: {
    label: '向顾客致歉并提供补偿',
    applicableTypes: ['timeout_wait', 'arrived_not_consulted'],
  },
  open_room: {
    label: '增开临时咨询室',
    applicableTypes: ['timeout_wait', 'frequent_reassign'],
  },
  adjust_schedule: {
    label: '调整后续预约间隔',
    applicableTypes: ['long_occupation', 'frequent_reassign'],
  },
  reassign: {
    label: '改派其他咨询师',
    applicableTypes: ['long_occupation', 'frequent_reassign'],
  },
  other: {
    label: '其他',
    applicableTypes: ['timeout_wait', 'long_occupation', 'frequent_reassign', 'arrived_not_consulted'],
  },
};

const handleActionLabels: Record<HandleAction, string> = {
  arrange_consultant: '立即安排空闲咨询师',
  apologize_customer: '向顾客致歉并提供补偿',
  open_room: '增开临时咨询室',
  adjust_schedule: '调整后续预约间隔',
  reassign: '改派其他咨询师',
  other: '其他',
};

const severityConfig: Record<Alert['severity'], {
  gradient: string;
  badgeBg: string;
  badgeText: string;
  dot: string;
  icon: typeof AlertTriangle;
  label: string;
}> = {
  critical: {
    gradient: 'from-status-critical/30 via-status-critical/10 to-transparent',
    badgeBg: 'bg-status-critical/20 border-status-critical/40',
    badgeText: 'text-status-critical',
    dot: 'bg-status-critical',
    icon: AlertTriangle,
    label: '紧急',
  },
  high: {
    gradient: 'from-status-warning/25 via-status-warning/8 to-transparent',
    badgeBg: 'bg-status-warning/20 border-status-warning/40',
    badgeText: 'text-status-warning',
    dot: 'bg-status-warning',
    icon: AlertTriangle,
    label: '高',
  },
  medium: {
    gradient: 'from-status-info/25 via-status-info/8 to-transparent',
    badgeBg: 'bg-status-info/20 border-status-info/40',
    badgeText: 'text-status-info',
    dot: 'bg-status-info',
    icon: Info,
    label: '中',
  },
  low: {
    gradient: 'from-white/15 via-white/5 to-transparent',
    badgeBg: 'bg-white/5 border-white/15',
    badgeText: 'text-white/60',
    dot: 'bg-white/40',
    icon: Info,
    label: '低',
  },
};

const typeLabels: Record<Alert['type'], string> = {
  timeout_wait: '等待超时',
  long_occupation: '占用过长',
  frequent_reassign: '频繁改派',
  arrived_not_consulted: '到店未接诊',
};

export default function AlertDetailPanel({ alert, onClose, onHandle }: AlertDetailPanelProps) {
  const [note, setNote] = useState('');
  const [action, setAction] = useState<HandleAction | ''>('');
  const [submitting, setSubmitting] = useState(false);

  if (!alert) return null;

  const severity = severityConfig[alert.severity];
  const SeverityIcon = severity.icon;

  const applicableActions = (Object.keys(handleActionConfig) as HandleAction[]).filter(
    (a) => handleActionConfig[a].applicableTypes.includes(alert.type)
  );

  const canSubmit = action !== '' && !submitting && !alert.isHandled;

  const handleSubmit = () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setTimeout(() => {
      onHandle(action, note.trim());
      setSubmitting(false);
      setNote('');
      setAction('');
    }, 400);
  };

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />
      <aside
        className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md flex flex-col
                   bg-dark-900 border-l border-white/10 shadow-2xl
                   animate-slide-in-right overflow-hidden"
      >
        <header
          className={cn(
            'relative overflow-hidden px-6 pt-6 pb-5 border-b border-white/10',
            'bg-gradient-to-b',
            severity.gradient
          )}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div
                className={cn(
                  'w-12 h-12 rounded-2xl flex-shrink-0 flex items-center justify-center',
                  severity.badgeBg
                )}
              >
                <SeverityIcon className={cn('w-6 h-6', severity.badgeText)} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h3 className="text-lg font-bold text-white">
                    {typeLabels[alert.type]}
                  </h3>
                  <span
                    className={cn(
                      'badge border',
                      severity.badgeBg,
                      severity.badgeText
                    )}
                  >
                    {severity.label}
                  </span>
                  {alert.isHandled && (
                    <span className="badge bg-status-success/20 text-status-success border border-status-success/30">
                      <CheckCircle2 className="w-3 h-3" />
                      已处理
                    </span>
                  )}
                </div>
                <p className="text-xs text-white/50 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  {formatDateTime(alert.triggeredAt)}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center
                         text-white/60 hover:text-white hover:bg-white/10
                         transition-all duration-200"
              aria-label="关闭"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <p className="mt-4 text-sm text-white/80 leading-relaxed">
            {alert.message}
          </p>
        </header>

        <div className="flex-1 overflow-y-auto scrollbar-thin">
          <div className="p-6 space-y-5">
            <section>
              <h4 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-3">
                相关信息
              </h4>
              <div className="space-y-2.5">
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.03] border border-white/5">
                  <div className="w-9 h-9 rounded-lg bg-primary-500/15 flex items-center justify-center flex-shrink-0">
                    <Store className="w-4 h-4 text-primary-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] text-white/45 leading-tight">门店</p>
                    <p className="text-sm font-medium text-white/90 truncate leading-tight mt-0.5">
                      {alert.storeName}
                    </p>
                  </div>
                </div>

                {alert.consultantName && (
                  <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.03] border border-white/5">
                    <div className="w-9 h-9 rounded-lg bg-project-hyaluronic/15 flex items-center justify-center flex-shrink-0">
                      <UserRound className="w-4 h-4 text-project-hyaluronic" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] text-white/45 leading-tight">咨询师</p>
                      <p className="text-sm font-medium text-white/90 truncate leading-tight mt-0.5">
                        {alert.consultantName}
                      </p>
                    </div>
                  </div>
                )}

                {alert.customerName && (
                  <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.03] border border-white/5">
                    <div className="w-9 h-9 rounded-lg bg-project-skincare/15 flex items-center justify-center flex-shrink-0">
                      <Users className="w-4 h-4 text-project-skincare" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] text-white/45 leading-tight">顾客</p>
                      <p className="text-sm font-medium text-white/90 truncate leading-tight mt-0.5">
                        {alert.customerName}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </section>

            <section>
              <h4 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-3">
                事件时间线
              </h4>
              <div className="relative pl-6">
                <div className="absolute left-1.5 top-1 bottom-1 w-px bg-white/10" />
                <div className="space-y-4">
                  <div className="relative">
                    <div
                      className={cn(
                        'absolute -left-[22px] top-1 w-3 h-3 rounded-full border-2 border-dark-900',
                        severity.dot
                      )}
                    />
                    <p className="text-xs text-white/50 tabular-nums">
                      {formatDateTime(alert.triggeredAt)}
                    </p>
                    <p className="text-sm text-white/85 mt-0.5">系统检测到异常，触发预警</p>
                  </div>

                  {alert.isHandled && alert.handledAt && (
                    <div className="relative">
                      <div className="absolute -left-[22px] top-1 w-3 h-3 rounded-full border-2 border-dark-900 bg-status-success" />
                      <p className="text-xs text-white/50 tabular-nums">
                        {formatDateTime(alert.handledAt)}
                      </p>
                      <p className="text-sm text-white/85 mt-0.5">
                        <span className="text-status-success font-medium">{alert.handledBy || '系统'}</span> 标记已处理
                      </p>
                      {alert.handleAction && (
                        <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-status-success/15 border border-status-success/30">
                          <CheckCircle2 className="w-3 h-3 text-status-success" />
                          <span className="text-xs text-status-success font-medium">
                            {handleActionLabels[alert.handleAction]}
                          </span>
                        </div>
                      )}
                      {alert.handleNote && (
                        <div className="mt-2 p-3 rounded-xl bg-white/[0.03] border border-white/5">
                          <p className="text-[11px] text-white/45 mb-1">处理备注</p>
                          <p className="text-sm text-white/75">{alert.handleNote}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </section>

            <section>
              <div className="rounded-2xl overflow-hidden border border-primary-500/20 bg-gradient-to-br from-primary-500/15 via-primary-500/5 to-transparent">
                <div className="px-4 py-3 flex items-center gap-2 border-b border-primary-500/15">
                  <div className="w-8 h-8 rounded-lg bg-primary-500/20 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-primary-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white/95">AI 智能建议</p>
                    <p className="text-[11px] text-primary-300/80">基于历史数据推荐</p>
                  </div>
                </div>
                <div className="px-4 py-4">
                  <p className="text-sm text-white/85 leading-relaxed">
                    {alert.suggestion}
                  </p>
                </div>
              </div>
            </section>
          </div>
        </div>

        <footer className="px-6 py-5 border-t border-white/10 bg-dark-900/80 backdrop-blur-xl">
          {!alert.isHandled ? (
            <div className="space-y-3.5">
              <div>
                <label className="flex items-center gap-1.5 text-xs font-medium text-white/60 mb-2">
                  <UserCheck className="w-3.5 h-3.5" />
                  处理动作 <span className="text-status-critical">*</span>
                </label>
                <select
                  value={action}
                  onChange={(e) => setAction(e.target.value as HandleAction | '')}
                  className="input-field"
                  required
                >
                  <option value="">请选择处理动作</option>
                  {applicableActions.map((a) => (
                    <option key={a} value={a}>
                      {handleActionConfig[a].label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="flex items-center gap-1.5 text-xs font-medium text-white/60 mb-2">
                  <MessageSquareText className="w-3.5 h-3.5" />
                  处理备注
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={3}
                  placeholder="请填写处理说明或备注..."
                  className="input-field resize-none"
                />
              </div>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!canSubmit}
                className="w-full btn-primary inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <UserCheck className="w-4 h-4" />
                <span>{submitting ? '提交中...' : '标记已处理'}</span>
                <Send className="w-4 h-4 opacity-80" />
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-status-success/10 border border-status-success/20">
              <CheckCircle2 className="w-5 h-5 text-status-success" />
              <span className="text-sm font-medium text-status-success">
                此预警已处理完毕
              </span>
            </div>
          )}
        </footer>
      </aside>
    </>
  );
}
