import { useMemo, useState } from 'react';
import {
  FileSpreadsheet,
  FileText,
  Download,
  Calendar,
  Store,
  UserRound,
  BarChart3,
  CheckCircle2,
  Clock,
  File,
  Settings2,
  ChevronDown,
  Sparkles,
  History,
  Trash2,
  Inbox,
} from 'lucide-react';
import ReportPreview from '../components/export/ReportPreview';
import KpiCard from '../components/common/KpiCard';
import {
  STORES,
  CONSULTANTS,
  generateStoreRanking,
  generateConsultantEfficiency,
  generateTrendSummary,
} from '../data/mockData';
import { cn, wait } from '../utils';
import { exportReport, redownloadExport } from '../utils/export';
import { clearExportHistory } from '../utils/storage';
import { useGlobalStore } from '../store';
import type { StoreRanking, ConsultantEfficiency, TrendSummary, ExportHistoryEntry } from '../types';

type ReportType = 'store' | 'consultant' | 'comprehensive';
type ExportFormat = 'xlsx' | 'csv' | 'pdf';

interface ExportConfig {
  reportType: ReportType;
  format: ExportFormat;
  stores: string[];
  dateRange: { start: string; end: string };
  includeCharts: boolean;
  includeRawData: boolean;
}

const formatLabels: Record<ExportFormat, { label: string; icon: typeof File; cls: string }> = {
  xlsx: { label: 'Excel', icon: FileSpreadsheet, cls: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30' },
  csv: { label: 'CSV', icon: FileText, cls: 'text-blue-400 bg-blue-500/15 border-blue-500/30' },
  pdf: { label: 'PDF', icon: FileText, cls: 'text-red-400 bg-red-500/15 border-red-500/30' },
};

const today = new Date();
const defaultStart = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
const formatDate = (d: Date) => d.toISOString().slice(0, 10);

function formatGeneratedAt(isoStr: string): string {
  const d = new Date(isoStr);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function getFormatLabel(format: ExportHistoryEntry['format']): string {
  const map: Record<ExportHistoryEntry['format'], string> = {
    xlsx: 'Excel',
    csv: 'CSV',
    pdf: 'PDF',
  };
  return map[format];
}

export default function ExportReport() {
  const [config, setConfig] = useState<ExportConfig>({
    reportType: 'store',
    format: 'xlsx',
    stores: ['all'],
    dateRange: {
      start: formatDate(defaultStart),
      end: formatDate(today),
    },
    includeCharts: true,
    includeRawData: true,
  });
  const [exporting, setExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [storeDropdownOpen, setStoreDropdownOpen] = useState(false);
  const [clearing, setClearing] = useState(false);

  const { exportHistory, addExportHistoryEntry, setExportHistory } = useGlobalStore();

  const filteredStores = useMemo(() => {
    if (config.stores.includes('all')) return STORES;
    return STORES.filter((s) => config.stores.includes(s.id));
  }, [config.stores]);

  const filteredStoreIds = useMemo(() => {
    if (config.stores.includes('all')) return undefined;
    return filteredStores.map((s) => s.id);
  }, [config.stores, filteredStores]);

  const daysSpan = useMemo(() => {
    const diff = Math.max(
      1,
      Math.floor(
        (new Date(config.dateRange.end).getTime() - new Date(config.dateRange.start).getTime()) /
          86400000
      ) + 1
    );
    return diff <= 7 ? 7 : diff <= 30 ? 30 : 30;
  }, [config.dateRange]);

  const storeRanking = useMemo(
    () => generateStoreRanking(filteredStoreIds, config.dateRange),
    [filteredStoreIds, config.dateRange]
  );
  const consultantEfficiency = useMemo(
    () => generateConsultantEfficiency(filteredStoreIds, config.dateRange),
    [filteredStoreIds, config.dateRange]
  );

  const trend7 = useMemo<TrendSummary>(
    () => generateTrendSummary(7, filteredStoreIds, config.dateRange),
    [filteredStoreIds, config.dateRange]
  );
  const trend30 = useMemo<TrendSummary>(
    () => generateTrendSummary(30, filteredStoreIds, config.dateRange),
    [filteredStoreIds, config.dateRange]
  );

  const filteredStoreConsultants = useMemo(() => {
    if (config.stores.includes('all')) return CONSULTANTS;
    return CONSULTANTS.filter((c) => config.stores.includes(c.storeId));
  }, [config.stores]);

  const previewData = useMemo(() => {
    if (config.reportType === 'consultant') return consultantEfficiency as any;
    return storeRanking as any;
  }, [config.reportType, storeRanking, consultantEfficiency]);

  const recentHistory = useMemo(() => exportHistory.slice(0, 10), [exportHistory]);

  const toggleStore = (storeId: string) => {
    if (storeId === 'all') {
      setConfig((prev) => ({
        ...prev,
        stores: prev.stores.includes('all') ? [] : ['all'],
      }));
      return;
    }
    setConfig((prev) => {
      let newStores = prev.stores.filter((s) => s !== 'all');
      if (newStores.includes(storeId)) {
        newStores = newStores.filter((s) => s !== storeId);
      } else {
        newStores.push(storeId);
      }
      if (newStores.length === STORES.length) {
        newStores = ['all'];
      }
      return { ...prev, stores: newStores };
    });
  };

  const handleExport = async () => {
    setExporting(true);
    setExportSuccess(false);
    await wait(400);
    try {
      const entry = await exportReport({
        reportType: config.reportType,
        format: config.format,
        storeIds: config.stores.includes('all') ? [] : config.stores,
        storeNames: filteredStores.map((s) => s.name),
        dateRange: config.dateRange,
        generatedAt: new Date().toISOString(),
        storeRanking,
        consultantEfficiency,
        trend7,
        trend30,
      });
      addExportHistoryEntry(entry);
      setExportSuccess(true);
    } catch {
      setExportSuccess(false);
    } finally {
      setExporting(false);
      setTimeout(() => setExportSuccess(false), 3000);
    }
  };

  const handleRedownload = async (entry: ExportHistoryEntry) => {
    try {
      await redownloadExport(entry);
    } catch {
      // ignore
    }
  };

  const handleClearHistory = () => {
    if (!window.confirm('确定要清空所有导出历史记录吗？此操作不可撤销。')) {
      return;
    }
    setClearing(true);
    try {
      clearExportHistory();
      setExportHistory([]);
    } finally {
      setClearing(false);
    }
  };

  const reportTypeOptions: {
    value: ReportType;
    label: string;
    icon: typeof BarChart3;
    desc: string;
  }[] = [
    {
      value: 'store',
      label: '门店排名报表',
      icon: Store,
      desc: '各门店综合效率排名与对比分析',
    },
    {
      value: 'consultant',
      label: '咨询师效率报表',
      icon: UserRound,
      desc: '咨询师接诊效率与满意度统计',
    },
    {
      value: 'comprehensive',
      label: '综合运营报表',
      icon: BarChart3,
      desc: '多维度综合数据分析汇总',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">导出报表</h2>
          <p className="mt-1 text-sm text-white/50">
            自定义生成运营报表，支持多种格式导出下载
          </p>
        </div>
        <button
          onClick={handleExport}
          disabled={exporting || config.stores.length === 0}
          className={cn(
            'inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300',
            exportSuccess
              ? 'bg-status-success/20 text-status-success border border-status-success/40'
              : exporting
              ? 'bg-white/10 text-white/60 cursor-wait border border-white/15'
              : config.stores.length === 0
              ? 'bg-white/5 text-white/40 cursor-not-allowed border border-white/10'
              : 'btn-primary shadow-lg hover:scale-[1.02] active:scale-[0.98]'
          )}
        >
          {exportSuccess ? (
            <>
              <CheckCircle2 className="w-5 h-5" />
              <span>导出成功</span>
            </>
          ) : exporting ? (
            <>
              <Clock className="w-5 h-5 animate-spin" />
              <span>生成中...</span>
            </>
          ) : (
            <>
              <Download className="w-5 h-5" />
              <span>{config.format === 'pdf' ? '导出(Excel)' : '导出报表'}</span>
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard
          title="门店总数"
          value={filteredStores.length}
          unit="家"
          icon={Store}
          gradientClass="bg-gradient-kpi1"
          colorClass="text-primary-400"
          delay={0}
        />
        <KpiCard
          title="咨询师总数"
          value={filteredStoreConsultants.length}
          unit="人"
          icon={UserRound}
          gradientClass="bg-gradient-kpi2"
          colorClass="text-project-hyaluronic"
          delay={60}
        />
        <KpiCard
          title="报表周期"
          value={`${daysSpan}天`}
          icon={Calendar}
          gradientClass="bg-gradient-kpi3"
          colorClass="text-project-photoelectric"
          delay={120}
        />
        <KpiCard
          title="导出格式"
          value={formatLabels[config.format].label}
          icon={formatLabels[config.format].icon}
          gradientClass="bg-gradient-kpi4"
          colorClass="text-project-skincare"
          delay={180}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="space-y-6 xl:col-span-1">
          <div className="glass-card p-6 space-y-6">
            <div className="flex items-center gap-2">
              <Settings2 className="w-5 h-5 text-primary-400" />
              <h3 className="text-lg font-semibold text-white">导出配置</h3>
            </div>

            <div>
              <label className="block text-xs font-medium text-white/60 mb-3">
                报表类型
              </label>
              <div className="space-y-2.5">
                {reportTypeOptions.map((opt) => {
                  const Icon = opt.icon;
                  const selected = config.reportType === opt.value;
                  return (
                    <button
                      key={opt.value}
                      onClick={() =>
                        setConfig((prev) => ({ ...prev, reportType: opt.value }))
                      }
                      className={cn(
                        'w-full p-4 rounded-xl border text-left transition-all duration-200',
                        selected
                          ? 'bg-primary-500/10 border-primary-500/40 ring-1 ring-primary-500/20'
                          : 'bg-white/[0.02] border-white/10 hover:border-white/20 hover:bg-white/[0.04]'
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={cn(
                            'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
                            selected
                              ? 'bg-primary-500/20 text-primary-300'
                              : 'bg-white/5 text-white/50'
                          )}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p
                            className={cn(
                              'text-sm font-semibold',
                              selected ? 'text-white' : 'text-white/85'
                            )}
                          >
                            {opt.label}
                          </p>
                          <p className="mt-0.5 text-xs text-white/45">{opt.desc}</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-white/60 mb-3">
                导出格式
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                {(Object.keys(formatLabels) as ExportFormat[]).map((f) => {
                  const fmt = formatLabels[f];
                  const Icon = fmt.icon;
                  const selected = config.format === f;
                  return (
                    <button
                      key={f}
                      onClick={() => setConfig((prev) => ({ ...prev, format: f }))}
                      className={cn(
                        'py-3 px-2 rounded-xl border flex flex-col items-center gap-1.5 transition-all duration-200',
                        selected
                          ? `${fmt.cls} border`
                          : 'bg-white/[0.02] border-white/10 text-white/50 hover:border-white/20 hover:bg-white/[0.04]'
                      )}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-xs font-semibold">{fmt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-white/60 mb-3">
                选择门店 ({config.stores.includes('all') ? '全部门店' : `${config.stores.length}家`})
              </label>
              <div className="relative">
                <button
                  onClick={() => setStoreDropdownOpen(!storeDropdownOpen)}
                  className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-left hover:border-white/20 transition-all"
                >
                  <span className="text-sm text-white/80 truncate">
                    {config.stores.includes('all')
                      ? '全部门店'
                      : filteredStores.length === 0
                      ? '请选择门店'
                      : filteredStores.length <= 2
                      ? filteredStores.map((s) => s.name.slice(0, 4)).join('、')
                      : `${filteredStores.slice(0, 2).map((s) => s.name.slice(0, 4)).join('、')}等${filteredStores.length}家`}
                  </span>
                  <ChevronDown
                    className={cn(
                      'w-4 h-4 text-white/40 flex-shrink-0 transition-transform',
                      storeDropdownOpen && 'rotate-180'
                    )}
                  />
                </button>
                {storeDropdownOpen && (
                  <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-72 overflow-y-auto rounded-xl border border-white/10 bg-dark-800/95 backdrop-blur-xl shadow-xl animate-fade-in-up scrollbar-thin">
                    <div className="p-1">
                      <button
                        onClick={() => toggleStore('all')}
                        className={cn(
                          'w-full px-3 py-2.5 rounded-lg flex items-center gap-2.5 text-left transition-colors',
                          config.stores.includes('all')
                            ? 'bg-primary-500/10'
                            : 'hover:bg-white/5'
                        )}
                      >
                        <div
                          className={cn(
                            'w-4 h-4 rounded border flex items-center justify-center',
                            config.stores.includes('all')
                              ? 'bg-primary-500 border-primary-500'
                              : 'border-white/20'
                          )}
                        >
                          {config.stores.includes('all') && (
                            <CheckCircle2 className="w-3 h-3 text-white" />
                          )}
                        </div>
                        <span className="text-sm text-white/85 font-medium">
                          全部门店
                        </span>
                        <span className="ml-auto text-xs text-white/40">
                          {STORES.length}家
                        </span>
                      </button>
                      <div className="my-1 h-px bg-white/5" />
                      {STORES.map((store) => {
                        const checked =
                          config.stores.includes('all') ||
                          config.stores.includes(store.id);
                        return (
                          <button
                            key={store.id}
                            onClick={() => toggleStore(store.id)}
                            className={cn(
                              'w-full px-3 py-2.5 rounded-lg flex items-center gap-2.5 text-left transition-colors',
                              checked ? 'bg-white/[0.03]' : 'hover:bg-white/5'
                            )}
                          >
                            <div
                              className={cn(
                                'w-4 h-4 rounded border flex items-center justify-center',
                                checked
                                  ? 'bg-primary-500 border-primary-500'
                                  : 'border-white/20'
                              )}
                            >
                              {checked && <CheckCircle2 className="w-3 h-3 text-white" />}
                            </div>
                            <Store className="w-4 h-4 text-primary-400 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-white/85 truncate">
                                {store.name}
                              </p>
                              <p className="text-[10px] text-white/40">{store.city}</p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-white/60 mb-3">
                日期范围
              </label>
              <div className="space-y-2.5">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-white/40 flex-shrink-0" />
                  <input
                    type="date"
                    value={config.dateRange.start}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        dateRange: { ...prev.dateRange, start: e.target.value },
                      }))
                    }
                    className="flex-1 px-3 py-2 text-sm rounded-lg bg-white/5 border border-white/10 text-white/80 focus:outline-none focus:border-primary-500/50 transition-all"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-white/40 flex-shrink-0" />
                  <input
                    type="date"
                    value={config.dateRange.end}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        dateRange: { ...prev.dateRange, end: e.target.value },
                      }))
                    }
                    className="flex-1 px-3 py-2 text-sm rounded-lg bg-white/5 border border-white/10 text-white/80 focus:outline-none focus:border-primary-500/50 transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <label className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/10 cursor-pointer hover:border-white/20 transition-all">
                <div className="flex items-center gap-2.5">
                  <Sparkles className="w-4 h-4 text-primary-400" />
                  <span className="text-sm text-white/80">包含图表</span>
                </div>
                <div
                  onClick={() =>
                    setConfig((prev) => ({ ...prev, includeCharts: !prev.includeCharts }))
                  }
                  className={cn(
                    'w-10 h-6 rounded-full relative transition-colors duration-200 cursor-pointer',
                    config.includeCharts ? 'bg-primary-500' : 'bg-white/15'
                  )}
                >
                  <div
                    className={cn(
                      'absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-200',
                      config.includeCharts ? 'translate-x-[18px]' : 'translate-x-0.5'
                    )}
                  />
                </div>
              </label>
              <label className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/10 cursor-pointer hover:border-white/20 transition-all">
                <div className="flex items-center gap-2.5">
                  <FileText className="w-4 h-4 text-project-photoelectric" />
                  <span className="text-sm text-white/80">包含原始数据</span>
                </div>
                <div
                  onClick={() =>
                    setConfig((prev) => ({ ...prev, includeRawData: !prev.includeRawData }))
                  }
                  className={cn(
                    'w-10 h-6 rounded-full relative transition-colors duration-200 cursor-pointer',
                    config.includeRawData ? 'bg-primary-500' : 'bg-white/15'
                  )}
                >
                  <div
                    className={cn(
                      'absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-200',
                      config.includeRawData ? 'translate-x-[18px]' : 'translate-x-0.5'
                    )}
                  />
                </div>
              </label>
            </div>
          </div>
        </div>

        <div className="xl:col-span-2 space-y-4">
          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-white">报表预览</h3>
                <p className="mt-1 text-xs text-white/50">
                  以下为报表内容预览，实际导出将包含完整数据
                </p>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                <File className="w-4 h-4 text-white/50" />
                <span className="text-xs text-white/60">
                  周期: {config.dateRange.start} ~ {config.dateRange.end}
                </span>
              </div>
            </div>
            <ReportPreview
              type={config.reportType}
              data={previewData}
              trend7={trend7}
              trend30={trend30}
              storeCount={filteredStores.length}
              consultantCount={filteredStoreConsultants.length}
              selectedStoreIds={config.stores.includes('all') ? STORES.map((s) => s.id) : config.stores}
              dateRange={config.dateRange}
            />
          </div>

          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-primary-400" />
                <div>
                  <h3 className="text-lg font-semibold text-white">最近导出记录</h3>
                  <p className="mt-0.5 text-xs text-white/50">
                    点击文件名可重新下载，最多保留 30 条历史记录
                  </p>
                </div>
              </div>
              {recentHistory.length > 0 && (
                <button
                  onClick={handleClearHistory}
                  disabled={clearing}
                  className={cn(
                    'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200',
                    clearing
                      ? 'bg-white/10 text-white/40 cursor-wait'
                      : 'text-white/60 hover:text-status-error hover:bg-status-error/10'
                  )}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>清空历史</span>
                </button>
              )}
            </div>

            {recentHistory.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-white/40">
                <Inbox className="w-12 h-12 mb-3 opacity-50" />
                <p className="text-sm">暂无导出记录</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-white/5">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-white/[0.02]">
                      <th className="px-4 py-3 text-left text-xs font-medium text-white/60">文件名</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-white/60">报表类型</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-white/60">门店范围</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-white/60">日期范围</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-white/60">格式</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-white/60">生成时间</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {recentHistory.map((entry) => (
                      <tr key={entry.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleRedownload(entry)}
                            className="text-primary-400 hover:text-primary-300 underline decoration-dotted underline-offset-2 text-left max-w-[220px] truncate block"
                            title={entry.filename}
                          >
                            {entry.filename}
                          </button>
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-primary-500/10 text-primary-300 text-xs font-medium">
                            {entry.reportTypeLabel}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-white/70">
                          {entry.storeIds.length === 0
                            ? '全部门店'
                            : `${entry.storeNames.length}家门店`}
                        </td>
                        <td className="px-4 py-3 text-white/70 whitespace-nowrap">
                          {entry.dateRange.start} ~ {entry.dateRange.end}
                        </td>
                        <td className="px-4 py-3 text-white/70">
                          {getFormatLabel(entry.format)}
                        </td>
                        <td className="px-4 py-3 text-white/50 whitespace-nowrap">
                          {formatGeneratedAt(entry.generatedAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
