export type ProjectType = 'hyaluronic' | 'photoelectric' | 'skincare' | 'surgery';

export type CustomerStatus = 'waiting' | 'calling' | 'consulting' | 'timeout';

export type ConsultantStatus = 'free' | 'busy' | 'break';

export type AlertType = 'timeout_wait' | 'long_occupation' | 'frequent_reassign';

export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical';

export type TimeSlotType = 'consultation' | 'free' | 'break';

export interface TimeSlot {
  start: string;
  end: string;
  type: TimeSlotType;
  customerName?: string;
}

export interface Store {
  id: string;
  name: string;
  city: string;
  address: string;
  currentWaiting: number;
  maxWaiting: number;
  longestWaitMinutes: number;
  freeConsultants: number;
  totalConsultants: number;
  todayConsultations: number;
  status: 'normal' | 'warning' | 'critical';
}

export interface QueuingCustomer {
  id: string;
  name: string;
  avatarInitial: string;
  projectType: ProjectType;
  projectName: string;
  isNewCustomer: boolean;
  appointmentTime: string;
  arrivalTime: string;
  waitMinutes: number;
  status: CustomerStatus;
  assignedConsultantId?: string;
}

export interface Consultant {
  id: string;
  storeId: string;
  name: string;
  avatarInitial: string;
  status: ConsultantStatus;
  currentCustomerName?: string;
  currentProject?: ProjectType;
  currentProgress: number;
  todayServed: number;
  avgConsultMinutes: number;
  todaySchedule: TimeSlot[];
}

export interface Alert {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  storeId: string;
  storeName: string;
  consultantId?: string;
  consultantName?: string;
  customerId?: string;
  customerName?: string;
  message: string;
  triggeredAt: string;
  isHandled: boolean;
  handledBy?: string;
  handledAt?: string;
  handleNote?: string;
  suggestion: string;
}

export interface WaitingAnalysis {
  hour: number;
  avgWaitMinutes: number;
  peakCount: number;
  newCustomerCount: number;
  oldCustomerCount: number;
  newCustomerAvgWait: number;
  oldCustomerAvgWait: number;
}

export interface CancelRecord {
  id: string;
  customerName: string;
  phone: string;
  projectType: ProjectType;
  waitMinutes: number;
  cancelTime: string;
  cancelReason: string;
  isNewCustomer: boolean;
}

export interface StoreRanking {
  rank: number;
  storeId: string;
  storeName: string;
  totalConsultations: number;
  avgWaitMinutes: number;
  cancelRate: number;
  efficiencyScore: number;
}

export interface ConsultantEfficiency {
  rank: number;
  consultantId: string;
  consultantName: string;
  storeName: string;
  servedCount: number;
  avgConsultMinutes: number;
  customerSatisfaction: number;
  efficiencyScore: number;
}

export interface TrendDataPoint {
  time: string;
  waiting: number;
  consultations: number;
}
