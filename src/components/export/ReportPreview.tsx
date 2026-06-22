import {
  Trophy,
  Award,
  Medal,
  Store as StoreIcon,
  UserRound,
  TrendingUp,
  Clock,
  Users,
  BarChart3,
  ThumbsUp,
  ListOrdered,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import type { StoreRanking, ConsultantEfficiency } from '../../types';

interface ReportPreviewProps {
  type: 'store' | 'consultant' | 'comprehensive';
  data: StoreRanking[] | ConsultantEfficiency[];
}

function getRankStyle(rank: number): {
  badge: string;
  text: string;
  icon: typeof Trophy;
  rowBg: string;
} {
  switch (rank) {
    case 1:
      return {
        badge: 'bg-gradient-to-br from-yellow-400/30 to-yellow-600/15 border border-yellow-500/40 shadow-[0_0_0_1px_rgba(234,179,8,0.25),0_0_20px_rgba(234,179,8,0.1)]',
        text: 'text-yellow-400',
        icon: Trophy,
        rowBg: 'bg-yellow-500/[0.03]',
      };
    case 2:
      return {
        badge: 'bg-gradient-to-br from-slate-300/25 to-slate-500/10 border border-slate-400/35 shadow-[0_0_0_1px_rgba(148,163,184,0.2)]',
        text: 'text-slate-300',
        icon: Award,
        rowBg: 'bg-slate-400/[0.02]',
      };
    case 3:
      return {
        badge: 'bg-gradient-to-br from-orange-400/25 to-orange-700/10 border border-orange-500/35 shadow-[0_0_0_1px_rgba(249,115,22,0.2)]',
        text: 'text-orange-400',
        icon: Medal,
        rowBg: 'bg-orange-500/[0.02]',
      };
    default:
      return {
        badge: 'bg-white/[0.04] border border-white/10',
        text: 'text-white/50',
        icon: ListOrdered,
        rowBg: '',
      };
  }
}

interface BarCellProps {
  value: number;
  max: number;
  color?: 'primary' | 'success' | 'warning' | 'danger';
  suffix?: string;
}

function BarCell({ value, max, color = 'primary', suffix = '' }: BarCellProps) {
  const percent = Math.min((value / max) * 100, 100);
  const colorCls = {
    primary: 'from-primary-500/80 to-primary-400/60',
    success: 'from-status-success/80 to-emerald-400/60',
    warning: 'from-status-warning/80 to-amber-400/60',
    danger: 'from-status-critical/80 to-red-400/60',
  }[color];

  return (
    <div className="w-full min-w-[140px] max-w-[220px]">
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-semibold text-white/90 tabular-nums">
          {value}
          {suffix && <span className="text-xs text-white/40 font-normal ml-0.5">{suffix}</span>}
        </span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
        <div
          className={cn('h-full rounded-full bg-gradient-to-r transition-all duration-700 ease-out', colorCls)}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

interface HeaderCellProps {
  icon: typeof StoreIcon;
  label: string;
}

function HeaderCell({ icon: Icon, label }: HeaderCellProps) {
  return (
    <div className="flex items-center gap-1.5">
      <Icon className="w-3.5 h-3.5 opacity-60" />
      <span>{label}</span>
    </div>
  );
}

export default function ReportPreview({ type, data }: ReportPreviewProps) {
  const titleMap: Record<ReportPreviewProps['type'], {
    title: string;
    subtitle: string;
    accent: string;
  }> = {
    store: {
      title: '门店排名报表',
      subtitle: '按综合效率指数排名',
      accent: 'from-primary-500/25 to-primary-500/5',
    },
    consultant: {
      title: '咨询师效率报表',
      subtitle: '按接诊综合效率排名',
      accent: 'from-project-hyaluronic/25 to-project-hyaluronic/5',
    },
    comprehensive: {
      title: '综合运营报表',
      subtitle: '多维度综合数据分析',
      accent: 'from-project-skincare/25 to-project-skincare/5',
    },
  };
  const pageInfo = titleMap[type];

  const renderStoreHeaders = () => (
    <tr>
      <th className="w-14">
        <HeaderCell icon={Trophy} label="排名" />
      </th>
      <th>
        <HeaderCell icon={StoreIcon} label="门店名称" />
      </th>
      <th>
        <HeaderCell icon={Users} label="接诊总数" />
      </th>
      <th>
        <HeaderCell icon={Clock} label="平均等待" />
      </th>
      <th>
        <HeaderCell icon={TrendingUp} label="取消率" />
      </th>
      <th>
        <HeaderCell icon={BarChart3} label="效率指数" />
      </th>
    </tr>
  );

  const renderConsultantHeaders = () => (
    <tr>
      <th className="w-14">
        <HeaderCell icon={Trophy} label="排名" />
      </th>
      <th>
        <HeaderCell icon={UserRound} label="咨询师" />
      </th>
      <th>
        <HeaderCell icon={StoreIcon} label="所属门店" />
      </th>
      <th>
        <HeaderCell icon={Users} label="接诊人次" />
      </th>
      <th>
        <HeaderCell icon={Clock} label="平均时长" />
      </th>
      <th>
        <HeaderCell icon={ThumbsUp} label="满意度" />
      </th>
      <th>
        <HeaderCell icon={BarChart3} label="效率指数" />
      </th>
    </tr>
  );

  const renderStoreRows = (rows: StoreRanking[]) => {
    const maxConsultations = Math.max(...rows.map((r) => r.totalConsultations), 1);
    const maxScore = Math.max(...rows.map((r) => r.efficiencyScore), 1);
    const maxCancel = Math.max(...rows.map((r) => r.cancelRate), 1);

    return rows.map((row) => {
      const rankStyle = getRankStyle(row.rank);
      const RankIcon = rankStyle.icon;
      const cancelColor: BarCellProps['color'] =
        row.cancelRate > 15 ? 'danger' : row.cancelRate > 8 ? 'warning' : 'success';

      return (
        <tr key={row.storeId} className={cn(rankStyle.rowBg)}>
          <td>
            <div
              className={cn(
                'inline-flex items-center justify-center gap-1 px-2.5 py-1 rounded-lg border',
                'w-full max-w-[48px]',
                rankStyle.badge
              )}
            >
              {row.rank <= 3 ? (
                <RankIcon className={cn('w-3.5 h-3.5', rankStyle.text)} />
              ) : (
                <span className={cn('text-sm font-bold tabular-nums', rankStyle.text)}>
                  {row.rank}
                </span>
              )}
            </div>
          </td>
          <td>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-primary-500/15 flex items-center justify-center flex-shrink-0">
                <StoreIcon className="w-4 h-4 text-primary-400" />
              </div>
              <span className="font-medium text-white/90">{row.storeName}</span>
            </div>
          </td>
          <td>
            <BarCell
              value={row.totalConsultations}
              max={maxConsultations}
              color="primary"
              suffix="人"
            />
          </td>
          <td>
            <span className="text-sm font-medium text-white/85 tabular-nums">
              {row.avgWaitMinutes}
              <span className="text-xs text-white/40 font-normal ml-1">分钟</span>
            </span>
          </td>
          <td>
            <BarCell
              value={row.cancelRate}
              max={maxCancel}
              color={cancelColor}
              suffix="%"
            />
          </td>
          <td>
            <BarCell
              value={row.efficiencyScore}
              max={maxScore}
              color="success"
            />
          </td>
        </tr>
      );
    });
  };

  const renderConsultantRows = (rows: ConsultantEfficiency[]) => {
    const maxServed = Math.max(...rows.map((r) => r.servedCount), 1);
    const maxScore = Math.max(...rows.map((r) => r.efficiencyScore), 1);
    const maxSatisfaction = Math.max(...rows.map((r) => r.customerSatisfaction), 1);

    return rows.map((row) => {
      const rankStyle = getRankStyle(row.rank);
      const RankIcon = rankStyle.icon;
      const satColor: BarCellProps['color'] =
        row.customerSatisfaction >= 95
          ? 'success'
          : row.customerSatisfaction >= 85
          ? 'primary'
          : 'warning';

      return (
        <tr key={row.consultantId} className={cn(rankStyle.rowBg)}>
          <td>
            <div
              className={cn(
                'inline-flex items-center justify-center gap-1 px-2.5 py-1 rounded-lg border',
                'w-full max-w-[48px]',
                rankStyle.badge
              )}
            >
              {row.rank <= 3 ? (
                <RankIcon className={cn('w-3.5 h-3.5', rankStyle.text)} />
              ) : (
                <span className={cn('text-sm font-bold tabular-nums', rankStyle.text)}>
                  {row.rank}
                </span>
              )}
            </div>
          </td>
          <td>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-project-hyaluronic/25 to-project-hyaluronic/10 flex items-center justify-center flex-shrink-0">
                <UserRound className="w-4 h-4 text-project-hyaluronic" />
              </div>
              <span className="font-medium text-white/90">{row.consultantName}</span>
            </div>
          </td>
          <td>
            <span className="text-sm text-white/70">{row.storeName}</span>
          </td>
          <td>
            <BarCell
              value={row.servedCount}
              max={maxServed}
              color="primary"
              suffix="人"
            />
          </td>
          <td>
            <span className="text-sm font-medium text-white/85 tabular-nums">
              {row.avgConsultMinutes}
              <span className="text-xs text-white/40 font-normal ml-1">分钟</span>
            </span>
          </td>
          <td>
            <BarCell
              value={row.customerSatisfaction}
              max={maxSatisfaction}
              color={satColor}
              suffix="%"
            />
          </td>
          <td>
            <BarCell
              value={row.efficiencyScore}
              max={maxScore}
              color="success"
            />
          </td>
        </tr>
      );
    });
  };

  const isStoreData = type === 'store' || type === 'comprehensive';
  const typedData = data as (StoreRanking | ConsultantEfficiency)[];

  const storeRows = isStoreData ? (typedData as StoreRanking[]) : [];
  const consultantRows = type === 'consultant' ? (typedData as ConsultantEfficiency[]) : [];

  return (
    <div className="glass-card overflow-hidden">
      <header
        className={cn(
          'px-6 py-5 border-b border-white/10 bg-gradient-to-r',
          pageInfo.accent
        )}
      >
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center">
              <BarChart3 className="w-5.5 h-5.5 text-white/85" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white/95">{pageInfo.title}</h3>
              <p className="text-xs text-white/55 mt-0.5">{pageInfo.subtitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-white/55">
            <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10">
              共 <span className="font-semibold text-white/85 tabular-nums">{data.length}</span> 条记录
            </span>
          </div>
        </div>
      </header>

      <div className="overflow-x-auto scrollbar-thin max-h-[520px] overflow-y-auto">
        {type === 'store' && (
          <table className="data-table">
            <thead className="sticky top-0 z-10 backdrop-blur-md bg-dark-900/85">
              {renderStoreHeaders()}
            </thead>
            <tbody>{renderStoreRows(storeRows)}</tbody>
          </table>
        )}

        {type === 'consultant' && (
          <table className="data-table">
            <thead className="sticky top-0 z-10 backdrop-blur-md bg-dark-900/85">
              {renderConsultantHeaders()}
            </thead>
            <tbody>{renderConsultantRows(consultantRows)}</tbody>
          </table>
        )}

        {type === 'comprehensive' && (
          <div className="space-y-8 p-1">
            <div>
              <h4 className="text-sm font-semibold text-white/70 px-4 py-3 flex items-center gap-2">
                <StoreIcon className="w-4 h-4 text-primary-400" />
                门店排名 TOP
              </h4>
              <div className="overflow-x-auto scrollbar-thin">
                <table className="data-table">
                  <thead className="bg-white/[0.02]">{renderStoreHeaders()}</thead>
                  <tbody>{renderStoreRows(storeRows)}</tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {data.length === 0 && (
        <div className="py-20 flex flex-col items-center justify-center text-white/35">
          <BarChart3 className="w-12 h-12 mb-3 opacity-50" />
          <p className="text-sm font-medium">暂无报表数据</p>
          <p className="text-xs mt-1 opacity-70">请稍后再试或调整筛选条件</p>
        </div>
      )}
    </div>
  );
}
