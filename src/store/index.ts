import { create } from 'zustand';
import { loadHandledAlerts, saveHandledAlert, loadExportHistory, saveExportHistoryEntry } from '../utils/storage';
import type { PersistedHandledAlert } from '../utils/storage';
import type { ExportHistoryEntry } from '../types';

export type AlertFilterType = 'all' | 'timeout_wait' | 'long_occupation' | 'frequent_reassign' | 'arrived_not_consulted';

export interface PendingAlertFilters {
  storeId: string;
  priorityOnly?: boolean;
  alertFilter?: AlertFilterType;
  statusFilter?: 'all' | 'unhandled' | 'handled';
}

export interface GlobalState {
  currentStoreId: string;
  setCurrentStoreId: (id: string) => void;
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  unhandledAlertsCount: number;
  setUnhandledAlertsCount: (n: number) => void;
  selectedAlertId: string | null;
  setSelectedAlertId: (id: string | null) => void;
  alertFilter: AlertFilterType;
  setAlertFilter: (f: AlertFilterType) => void;
  handledAlerts: PersistedHandledAlert[];
  setHandledAlerts: (alerts: PersistedHandledAlert[]) => void;
  addHandledAlert: (alert: PersistedHandledAlert) => void;
  pendingAlertFilters?: PendingAlertFilters;
  setPendingAlertFilters: (f: PendingAlertFilters | undefined) => void;
  clearPendingAlertFilters: () => void;
  handledAlertIds: Set<string>;
  markAlertHandled: (id: string) => void;
  exportHistory: ExportHistoryEntry[];
  setExportHistory: (list: ExportHistoryEntry[]) => void;
  addExportHistoryEntry: (entry: ExportHistoryEntry) => void;
}

export const useGlobalStore = create<GlobalState>((set) => ({
  currentStoreId: 'store-sh-001',
  setCurrentStoreId: (id: string) => set({ currentStoreId: id }),
  sidebarCollapsed: false,
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  unhandledAlertsCount: 0,
  setUnhandledAlertsCount: (n: number) => set({ unhandledAlertsCount: n }),
  selectedAlertId: null,
  setSelectedAlertId: (id: string | null) => set({ selectedAlertId: id }),
  alertFilter: 'all',
  setAlertFilter: (f: AlertFilterType) => set({ alertFilter: f }),
  handledAlerts: loadHandledAlerts(),
  setHandledAlerts: (alerts: PersistedHandledAlert[]) => set({ handledAlerts: alerts }),
  addHandledAlert: (alert: PersistedHandledAlert) => {
    saveHandledAlert(alert);
    set((state) => {
      const existingIndex = state.handledAlerts.findIndex((a) => a.id === alert.id);
      if (existingIndex >= 0) {
        const next = [...state.handledAlerts];
        next[existingIndex] = alert;
        return { handledAlerts: next, handledAlertIds: new Set([...state.handledAlertIds, alert.id]) };
      }
      return { handledAlerts: [...state.handledAlerts, alert], handledAlertIds: new Set([...state.handledAlertIds, alert.id]) };
    });
  },
  pendingAlertFilters: undefined,
  setPendingAlertFilters: (f: PendingAlertFilters | undefined) => set({ pendingAlertFilters: f }),
  clearPendingAlertFilters: () => set({ pendingAlertFilters: undefined }),
  handledAlertIds: new Set<string>(),
  markAlertHandled: (id: string) =>
    set((state) => {
      const next = new Set(state.handledAlertIds);
      next.add(id);
      return { handledAlertIds: next };
    }),
  exportHistory: loadExportHistory(),
  setExportHistory: (list: ExportHistoryEntry[]) => set({ exportHistory: list }),
  addExportHistoryEntry: (entry: ExportHistoryEntry) => {
    saveExportHistoryEntry(entry);
    set((state) => {
      const next = [entry, ...state.exportHistory].slice(0, 30);
      return { exportHistory: next };
    });
  },
}));
