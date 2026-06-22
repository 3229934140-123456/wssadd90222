import { create } from 'zustand';

export type AlertFilterType = 'all' | 'timeout_wait' | 'long_occupation' | 'frequent_reassign';

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
}

export const useGlobalStore = create<GlobalState>((set) => ({
  currentStoreId: 'store-sh-01',
  setCurrentStoreId: (id: string) => set({ currentStoreId: id }),
  sidebarCollapsed: false,
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  unhandledAlertsCount: 0,
  setUnhandledAlertsCount: (n: number) => set({ unhandledAlertsCount: n }),
  selectedAlertId: null,
  setSelectedAlertId: (id: string | null) => set({ selectedAlertId: id }),
  alertFilter: 'all',
  setAlertFilter: (f: AlertFilterType) => set({ alertFilter: f }),
}));
