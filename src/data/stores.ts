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

export const STORES: Store[] = [
  {
    id: 'store-sh-01',
    name: '上海旗舰总店',
    city: '上海',
    address: '上海市静安区南京西路1266号恒隆广场3楼',
    currentWaiting: 12,
    maxWaiting: 20,
    longestWaitMinutes: 38,
    freeConsultants: 3,
    totalConsultants: 15,
    todayConsultations: 86,
    status: 'warning',
  },
  {
    id: 'store-sh-02',
    name: '上海浦东分店',
    city: '上海',
    address: '上海市浦东新区陆家嘴环路1000号恒生银行大厦2楼',
    currentWaiting: 8,
    maxWaiting: 15,
    longestWaitMinutes: 25,
    freeConsultants: 5,
    totalConsultants: 12,
    todayConsultations: 64,
    status: 'normal',
  },
  {
    id: 'store-bj-01',
    name: '北京国贸店',
    city: '北京',
    address: '北京市朝阳区建国门外大街1号国贸商城3期B1层',
    currentWaiting: 18,
    maxWaiting: 25,
    longestWaitMinutes: 52,
    freeConsultants: 2,
    totalConsultants: 18,
    todayConsultations: 102,
    status: 'critical',
  },
  {
    id: 'store-gz-01',
    name: '广州天河店',
    city: '广州',
    address: '广州市天河区天河路385号太古汇L2层',
    currentWaiting: 6,
    maxWaiting: 18,
    longestWaitMinutes: 18,
    freeConsultants: 6,
    totalConsultants: 10,
    todayConsultations: 48,
    status: 'normal',
  },
  {
    id: 'store-sz-01',
    name: '深圳万象城店',
    city: '深圳',
    address: '深圳市罗湖区宝安南路1881号万象城3楼',
    currentWaiting: 14,
    maxWaiting: 20,
    longestWaitMinutes: 42,
    freeConsultants: 2,
    totalConsultants: 14,
    todayConsultations: 78,
    status: 'warning',
  },
  {
    id: 'store-hz-01',
    name: '杭州西湖店',
    city: '杭州',
    address: '杭州市西湖区延安路530号武林银泰百货4楼',
    currentWaiting: 9,
    maxWaiting: 16,
    longestWaitMinutes: 28,
    freeConsultants: 4,
    totalConsultants: 11,
    todayConsultations: 56,
    status: 'normal',
  },
];
