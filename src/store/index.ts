import { create } from 'zustand';
import { loadHandledAlerts, saveHandledAlert } from '../utils/storage';
import type { PersistedHandledAlert } from '../utils/storage';

export type AlertFilterType = 'all' | 'timeout_wait' | 'long_occupation' | 'frequent_reassign' | 'arrived_not_consulted';

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
        return { handledAlerts: next };
      }
      return { handledAlerts: [...state.handledAlerts, alert] };
    });
  },
}));
