import type { AlertType, AlertSeverity, HandleAction } from '../types';

const HANDLED_ALERTS_KEY = 'medical_aesthetic_handled_alerts_v1';

export interface PersistedHandledAlert {
  id: string;
  alertType: AlertType;
  severity: AlertSeverity;
  storeId: string;
  storeName: string;
  customerName?: string;
  consultantName?: string;
  message: string;
  suggestion: string;
  triggeredAt: string;
  handledAt: string;
  handledBy: string;
  handleAction: HandleAction;
  handleNote: string;
}

export function loadHandledAlerts(): PersistedHandledAlert[] {
  try {
    const raw = localStorage.getItem(HANDLED_ALERTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as PersistedHandledAlert[];
  } catch {
    return [];
  }
}

export function saveHandledAlert(alert: PersistedHandledAlert): void {
  try {
    const all = loadHandledAlerts();
    const existingIndex = all.findIndex((a) => a.id === alert.id);
    if (existingIndex >= 0) {
      all[existingIndex] = alert;
    } else {
      all.push(alert);
    }
    localStorage.setItem(HANDLED_ALERTS_KEY, JSON.stringify(all));
  } catch {
    // ignore
  }
}

export function clearHandledAlerts(): void {
  try {
    localStorage.removeItem(HANDLED_ALERTS_KEY);
  } catch {
    // ignore
  }
}
