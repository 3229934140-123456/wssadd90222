import type { StoreRanking, ConsultantEfficiency, TrendSummary } from '../types';

export interface ExportPayload {
  reportType: 'store' | 'consultant' | 'comprehensive';
  format: 'xlsx' | 'csv';
  storeIds: string[];
  storeNames: string[];
  dateRange: { start: string; end: string };
  generatedAt: string;
  storeRanking?: StoreRanking[];
  consultantEfficiency?: ConsultantEfficiency[];
  trend7?: TrendSummary;
  trend30?: TrendSummary;
}

export function toCSV(rows: (string | number)[][], headers: string[]): string {
  const escapeValue = (val: string | number): string => {
    const str = String(val);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const headerLine = headers.map(escapeValue).join(',');
  const bodyLines = rows.map((row) => row.map(escapeValue).join(','));
  const allLines = [headerLine, ...bodyLines];

  const BOM = '\uFEFF';
  return BOM + allLines.join('\r\n');
}

function xmlEscape(val: string | number): string {
  return String(val)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function cellValue(val: string | number): string {
  if (typeof val === 'number') {
    return `<Cell><Data ss:Type="Number">${val}</Data></Cell>`;
  }
  return `<Cell><Data ss:Type="String">${xmlEscape(val)}</Data></Cell>`;
}

function buildRow(cells: (string | number)[]): string {
  return `<Row>${cells.map(cellValue).join('')}</Row>`;
}

function buildSheet(name: string, headers: string[], rows: (string | number)[][]): string {
  const headerRow = buildRow(headers);
  const bodyRows = rows.map(buildRow).join('');
  return `
    <Worksheet ss:Name="${xmlEscape(name)}">
      <Table>
        ${headerRow}
        ${bodyRows}
      </Table>
    </Worksheet>
  `;
}

export function toExcelXML(sheets: { name: string; headers: string[]; rows: (string | number)[][] }[]): string {
  const sheetsXml = sheets.map((s) => buildSheet(s.name, s.headers, s.rows)).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
  xmlns:o="urn:schemas-microsoft-com:office:office"
  xmlns:x="urn:schemas-microsoft-com:office:excel"
  xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
  xmlns:html="http://www.w3.org/TR/REC-html40">
  <Styles>
    <Style ss:ID="Header">
      <Font ss:Bold="1"/>
      <Interior ss:Color="#E8F4FD" ss:Pattern="Solid"/>
    </Style>
  </Styles>
  ${sheetsXml}
</Workbook>`;
}

export function triggerDownload(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function formatTimestamp(isoStr: string): string {
  const d = new Date(isoStr);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}${pad(d.getHours())}${pad(d.getMinutes())}`;
}

function getReportTypeLabel(type: ExportPayload['reportType']): string {
  const map: Record<ExportPayload['reportType'], string> = {
    store: '门店排名报表',
    consultant: '咨询师效率报表',
    comprehensive: '综合运营报表',
  };
  return map[type];
}

function generateFilename(payload: ExportPayload): string {
  const label = getReportTypeLabel(payload.reportType);
  const { start, end } = payload.dateRange;
  const timestamp = formatTimestamp(payload.generatedAt);
  const ext = payload.format === 'csv' ? 'csv' : 'xls';
  return `${label}_${start}_${end}_${timestamp}.${ext}`;
}

function buildStoreReportData(payload: ExportPayload): { headers: string[]; rows: (string | number)[][] } {
  const headers = ['排名', '门店名称', '接诊总数', '平均等待(分钟)', '取消率(%)', '效率指数'];
  const rows: (string | number)[][] = [];

  const infoLine = `报表周期: ${payload.dateRange.start} ~ ${payload.dateRange.end} | 门店数: ${payload.storeNames.length} | 生成时间: ${new Date(payload.generatedAt).toLocaleString()}`;
  rows.push([infoLine, '', '', '', '', '']);
  rows.push([]);

  const data = payload.storeRanking || [];
  data.forEach((row) => {
    rows.push([row.rank, row.storeName, row.totalConsultations, row.avgWaitMinutes, row.cancelRate, row.efficiencyScore]);
  });

  if (data.length > 0) {
    const totalConsultations = data.reduce((sum, r) => sum + r.totalConsultations, 0);
    const avgWait = (data.reduce((sum, r) => sum + r.avgWaitMinutes, 0) / data.length).toFixed(1);
    const avgCancel = (data.reduce((sum, r) => sum + r.cancelRate, 0) / data.length).toFixed(1);
    const avgScore = (data.reduce((sum, r) => sum + r.efficiencyScore, 0) / data.length).toFixed(1);
    rows.push([]);
    rows.push(['合计/均值', '', totalConsultations, avgWait, avgCancel, avgScore]);
  }

  return { headers, rows };
}

function buildConsultantReportData(payload: ExportPayload): { headers: string[]; rows: (string | number)[][] } {
  const headers = ['排名', '咨询师', '所属门店', '接诊人次', '平均时长(分钟)', '满意度(%)', '效率指数'];
  const rows: (string | number)[][] = [];

  const infoLine = `报表周期: ${payload.dateRange.start} ~ ${payload.dateRange.end} | 咨询师数: ${(payload.consultantEfficiency || []).length} | 生成时间: ${new Date(payload.generatedAt).toLocaleString()}`;
  rows.push([infoLine, '', '', '', '', '', '']);
  rows.push([]);

  const data = payload.consultantEfficiency || [];
  data.forEach((row) => {
    rows.push([row.rank, row.consultantName, row.storeName, row.servedCount, row.avgConsultMinutes, row.customerSatisfaction, row.efficiencyScore]);
  });

  return { headers, rows };
}

function buildComprehensiveSheets(payload: ExportPayload): { name: string; headers: string[]; rows: (string | number)[][] }[] {
  const sheets: { name: string; headers: string[]; rows: (string | number)[][] }[] = [];

  const summaryHeaders = ['统计项', '近7天', '近7天环比(%)', '近30天', '近30天环比(%)'];
  const summaryRows: (string | number)[][] = [];
  const infoLine = `报表周期: ${payload.dateRange.start} ~ ${payload.dateRange.end} | 生成时间: ${new Date(payload.generatedAt).toLocaleString()}`;
  summaryRows.push([infoLine, '', '', '', '']);
  summaryRows.push([]);

  const t7 = payload.trend7;
  const t30 = payload.trend30;

  summaryRows.push([
    '接诊总数',
    t7?.totalConsultations ?? 0,
    t7?.compareToPrevPeriod.consultationsDeltaPct ?? 0,
    t30?.totalConsultations ?? 0,
    t30?.compareToPrevPeriod.consultationsDeltaPct ?? 0,
  ]);
  summaryRows.push([
    '平均等待(分钟)',
    t7?.avgWaitMinutes ?? 0,
    t7?.compareToPrevPeriod.waitDeltaPct ?? 0,
    t30?.avgWaitMinutes ?? 0,
    t30?.compareToPrevPeriod.waitDeltaPct ?? 0,
  ]);
  summaryRows.push([
    '取消率(%)',
    t7?.cancelRate ?? 0,
    t7?.compareToPrevPeriod.cancelRateDeltaPct ?? 0,
    t30?.cancelRate ?? 0,
    t30?.compareToPrevPeriod.cancelRateDeltaPct ?? 0,
  ]);
  sheets.push({ name: '汇总统计', headers: summaryHeaders, rows: summaryRows });

  const dayHeaders = ['日期', '接诊数', '平均等待(分钟)', '取消数'];
  const trend7Rows: (string | number)[][] = [];
  (t7?.byDay || []).forEach((d) => {
    trend7Rows.push([d.date, d.consultations, d.avgWait, d.cancels]);
  });
  sheets.push({ name: '近7天每日明细', headers: dayHeaders, rows: trend7Rows });

  const trend30Rows: (string | number)[][] = [];
  (t30?.byDay || []).forEach((d) => {
    trend30Rows.push([d.date, d.consultations, d.avgWait, d.cancels]);
  });
  sheets.push({ name: '近30天每日明细', headers: dayHeaders, rows: trend30Rows });

  const storeData = buildStoreReportData(payload);
  sheets.push({ name: '门店排名', headers: storeData.headers, rows: storeData.rows });

  return sheets;
}

export async function exportReport(payload: ExportPayload): Promise<void> {
  const filename = generateFilename(payload);

  if (payload.reportType === 'store') {
    const { headers, rows } = buildStoreReportData(payload);
    if (payload.format === 'csv') {
      const content = toCSV(rows, headers);
      triggerDownload(content, filename, 'text/csv;charset=utf-8');
    } else {
      const content = toExcelXML([{ name: '门店排名', headers, rows }]);
      triggerDownload(content, filename, 'application/vnd.ms-excel');
    }
  } else if (payload.reportType === 'consultant') {
    const { headers, rows } = buildConsultantReportData(payload);
    if (payload.format === 'csv') {
      const content = toCSV(rows, headers);
      triggerDownload(content, filename, 'text/csv;charset=utf-8');
    } else {
      const content = toExcelXML([{ name: '咨询师效率', headers, rows }]);
      triggerDownload(content, filename, 'application/vnd.ms-excel');
    }
  } else if (payload.reportType === 'comprehensive') {
    const sheets = buildComprehensiveSheets(payload);
    if (payload.format === 'csv') {
      const firstSheet = sheets[0];
      const content = toCSV(firstSheet.rows, firstSheet.headers);
      triggerDownload(content, filename, 'text/csv;charset=utf-8');
    } else {
      const content = toExcelXML(sheets);
      triggerDownload(content, filename, 'application/vnd.ms-excel');
    }
  }
}
