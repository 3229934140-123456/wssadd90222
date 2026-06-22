import type {
  Store,
  Consultant,
  QueuingCustomer,
  Alert,
  WaitingAnalysis,
  CancelRecord,
  StoreRanking,
  ConsultantEfficiency,
  TrendDataPoint,
  ProjectType,
  CustomerStatus,
  ConsultantStatus,
  AlertType,
  AlertSeverity,
  TimeSlot
} from '../types'
import { generateId } from '../utils'

export const STORES: Store[] = [
  {
    id: 'store-sh-001',
    name: '上海南京西路旗舰店',
    city: '上海',
    address: '静安区南京西路1266号恒隆广场38F',
    currentWaiting: 18,
    maxWaiting: 30,
    longestWaitMinutes: 72,
    freeConsultants: 2,
    totalConsultants: 8,
    todayConsultations: 86,
    status: 'warning'
  },
  {
    id: 'store-bj-002',
    name: '北京国贸中心店',
    city: '北京',
    address: '朝阳区建国门外大街1号国贸商城3期L6',
    currentWaiting: 24,
    maxWaiting: 30,
    longestWaitMinutes: 95,
    freeConsultants: 1,
    totalConsultants: 8,
    todayConsultations: 92,
    status: 'critical'
  },
  {
    id: 'store-gz-003',
    name: '广州天河城店',
    city: '广州',
    address: '天河区天河路208号天河城购物中心5F',
    currentWaiting: 12,
    maxWaiting: 25,
    longestWaitMinutes: 45,
    freeConsultants: 3,
    totalConsultants: 7,
    todayConsultations: 68,
    status: 'normal'
  },
  {
    id: 'store-sz-004',
    name: '深圳万象城店',
    city: '深圳',
    address: '罗湖区宝安南路1881号万象城4F',
    currentWaiting: 15,
    maxWaiting: 25,
    longestWaitMinutes: 58,
    freeConsultants: 2,
    totalConsultants: 7,
    todayConsultations: 74,
    status: 'normal'
  },
  {
    id: 'store-hz-005',
    name: '杭州西湖银泰店',
    city: '杭州',
    address: '上城区延安路98号西湖银泰城3F',
    currentWaiting: 8,
    maxWaiting: 20,
    longestWaitMinutes: 32,
    freeConsultants: 4,
    totalConsultants: 6,
    todayConsultations: 52,
    status: 'normal'
  },
  {
    id: 'store-cd-006',
    name: '成都IFS国际金融中心店',
    city: '成都',
    address: '锦江区红星路三段1号IFS国际金融中心5F',
    currentWaiting: 22,
    maxWaiting: 25,
    longestWaitMinutes: 88,
    freeConsultants: 1,
    totalConsultants: 7,
    todayConsultations: 81,
    status: 'critical'
  },
  {
    id: 'store-nj-007',
    name: '南京德基广场店',
    city: '南京',
    address: '玄武区中山路18号德基广场二期L5',
    currentWaiting: 10,
    maxWaiting: 20,
    longestWaitMinutes: 38,
    freeConsultants: 3,
    totalConsultants: 6,
    todayConsultations: 58,
    status: 'normal'
  },
  {
    id: 'store-wh-008',
    name: '武汉楚河汉街店',
    city: '武汉',
    address: '武昌区中北路楚河汉街万达广场3F',
    currentWaiting: 14,
    maxWaiting: 25,
    longestWaitMinutes: 52,
    freeConsultants: 2,
    totalConsultants: 7,
    todayConsultations: 65,
    status: 'warning'
  }
]

const consultantNamesByStore: Record<string, string[]> = {
  'store-sh-001': ['陈思雨', '林雅婷', '王晓琳', '张梦琪', '刘诗涵', '周子萱', '吴佳怡', '郑雨晴'],
  'store-bj-002': ['李梦蝶', '赵欣悦', '刘若曦', '孙艺菲', '周雅琴', '吴梦瑶', '郑雅文', '冯紫涵'],
  'store-gz-003': ['黄雅琪', '陈美琳', '林婉清', '何诗涵', '罗静怡', '谢晓彤', '梁雅雯'],
  'store-sz-004': ['许丽娟', '蔡佩珊', '苏慧敏', '韩雪梅', '曾美玲', '彭晓琳', '唐婉君'],
  'store-hz-005': ['徐静蕾', '朱思颖', '沈佳妮', '蒋雨婷', '俞梦蝶', '汪清雅'],
  'store-cd-006': ['杨诗涵', '邓雅文', '刘思琪', '陈梦瑶', '罗紫萱', '谢佳颖', '曾雅琴'],
  'store-nj-007': ['陆佳慧', '钱雅婷', '孙婉清', '李诗琪', '周梦瑶', '吴佳颖'],
  'store-wh-008': ['胡雅婷', '桂美琪', '万思涵', '程梦瑶', '田雅琴', '秦紫萱', '任佳怡']
}

const initials = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

function generateSchedule(storeId: string, idx: number): TimeSlot[] {
  const schedule: TimeSlot[] = []
  const baseHour = 9
  let currentHour = baseHour
  const servedCount = 4 + (idx % 4)
  let served = 0

  while (served < servedCount && currentHour < 18) {
    const startMin = (served * 17 + idx * 7) % 60
    const startH = currentHour + Math.floor(startMin / 60)
    const startM = startMin % 60
    const duration = 25 + (idx + served) % 35
    const endTotal = startH * 60 + startM + duration
    const endH = Math.floor(endTotal / 60)
    const endM = endTotal % 60

    if (endH >= 18) break

    schedule.push({
      start: `${startH.toString().padStart(2, '0')}:${startM.toString().padStart(2, '0')}`,
      end: `${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`,
      type: 'consultation',
      customerName: `顾${'客博文轩雅琪涵静婉'[(idx + served) % 8]}${'婷琳萱颖菲雯'[(idx * 2 + served) % 6]}`
    })

    served++
    currentHour = endH + (endM + 10 >= 60 ? 1 : 0)
  }

  const breakStart = 12
  schedule.push({
    start: `${breakStart.toString().padStart(2, '0')}:${(idx * 5 % 30).toString().padStart(2, '0')}`,
    end: `${(breakStart + 1).toString().padStart(2, '0')}:${(idx * 5 % 30).toString().padStart(2, '0')}`,
    type: 'break'
  })

  schedule.sort((a, b) => a.start.localeCompare(b.start))
  return schedule
}

export const CONSULTANTS: Consultant[] = STORES.flatMap((store) => {
  const names = consultantNamesByStore[store.id] || []
  return names.map((name, idx) => {
    const statuses: ConsultantStatus[] = ['busy', 'busy', 'busy', 'free', 'break']
    const status = statuses[(idx + store.currentWaiting) % statuses.length]
    const progress = status === 'busy' ? 20 + ((idx * 13) % 70) : status === 'free' ? 100 : 0
    const projects: ProjectType[] = ['hyaluronic', 'photoelectric', 'skincare', 'surgery']
    const currentProject = status === 'busy' ? projects[(idx + store.todayConsultations) % 4] : undefined

    return {
      id: `c-${store.id}-${idx + 1}`,
      storeId: store.id,
      name,
      avatarInitial: initials[(name.charCodeAt(0) + idx) % 26],
      status,
      currentCustomerName: status === 'busy' ? `顾客${'思雅静怡欣佳'[idx % 6]}${'琪涵婷琳萱菲'[(idx + 1) % 6]}` : undefined,
      currentProject,
      currentProgress: progress,
      todayServed: 5 + ((idx * 3 + store.todayConsultations) % 8),
      avgConsultMinutes: 28 + ((idx * 7) % 22),
      todaySchedule: generateSchedule(store.id, idx)
    }
  })
})

const customerFirstNames = ['王', '李', '张', '刘', '陈', '杨', '黄', '赵', '周', '吴', '徐', '孙', '马', '朱', '胡', '郭', '何', '高', '林', '罗']
const customerLastNames = ['思琪', '雅婷', '梦涵', '欣怡', '佳慧', '诗涵', '子萱', '雅文', '紫涵', '佳怡', '雨婷', '梦瑶', '静怡', '晓彤', '婉清', '雅雯', '雪梅', '美玲', '思颖', '雨晴']

const projectInfo: Record<ProjectType, string[]> = {
  hyaluronic: ['玻尿酸丰唇', '玻尿酸隆鼻', '玻尿酸丰下巴', '玻尿酸填充法令纹', '玻尿酸丰太阳穴', '玻尿酸填充泪沟', '玻尿酸丰苹果肌'],
  photoelectric: ['光子嫩肤', '皮秒激光', '热玛吉', '超声刀', '点阵激光', '射频紧肤', '水光针'],
  skincare: ['深层清洁护理', '补水保湿护理', '美白淡斑护理', '抗衰紧致护理', '祛痘护理', '敏感肌修复', '焕肤护理'],
  surgery: ['双眼皮手术', '隆鼻手术', '自体脂肪填充', '吸脂塑形', '隆胸手术', '面部提升', '祛眼袋']
}

function randomFrom<T>(arr: T[], seed: number): T {
  return arr[seed % arr.length]
}

function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9999) * 10000
  return x - Math.floor(x)
}

export function generateQueuingCustomers(storeId: string): QueuingCustomer[] {
  const customers: QueuingCustomer[] = []
  const store = STORES.find((s) => s.id === storeId) || STORES[0]
  const count = 15 + Math.floor(seededRandom(store.todayConsultations) * 10)
  const projectTypes: ProjectType[] = ['hyaluronic', 'photoelectric', 'skincare', 'surgery']

  for (let i = 0; i < count; i++) {
    const seed = i * 7 + store.todayConsultations
    const rand = seededRandom(seed)
    const isNew = rand < 0.4
    const projectType = randomFrom(projectTypes, seed)
    const projects = projectInfo[projectType]
    const projectName = randomFrom(projects, seed + 3)
    const waitMinutes = isNew
      ? Math.floor(15 + rand * 85)
      : Math.floor(8 + rand * 55)

    let status: CustomerStatus
    if (waitMinutes >= 60) {
      status = 'timeout'
    } else if (waitMinutes >= 45) {
      status = i % 5 === 0 ? 'calling' : 'waiting'
    } else if (i < 3) {
      status = 'consulting'
    } else if (i % 7 === 0) {
      status = 'calling'
    } else {
      status = 'waiting'
    }

    const arrivalHour = 9 + Math.floor(seededRandom(seed + 1) * 8)
    const arrivalMin = Math.floor(seededRandom(seed + 2) * 60)
    const arrivalDate = new Date()
    arrivalDate.setHours(arrivalHour, arrivalMin, 0, 0)
    const arrivalTime = arrivalDate.toISOString()

    const apptOffset = isNew ? 30 : 15
    const apptDate = new Date(arrivalDate.getTime() - apptOffset * 60 * 1000)
    const appointmentTime = apptDate.toISOString()

    const firstName = randomFrom(customerFirstNames, seed)
    const lastName = randomFrom(customerLastNames, seed + 5)
    const name = firstName + lastName

    customers.push({
      id: `q-${storeId}-${i + 1}`,
      name,
      avatarInitial: initials[(name.charCodeAt(0) + i) % 26],
      projectType,
      projectName,
      isNewCustomer: isNew,
      appointmentTime,
      arrivalTime,
      waitMinutes,
      status,
      assignedConsultantId: status === 'consulting' || status === 'calling'
        ? CONSULTANTS.filter((c) => c.storeId === storeId)[i % Math.max(1, CONSULTANTS.filter((c) => c.storeId === storeId).length)]?.id
        : undefined
    })
  }

  return customers.sort((a, b) => b.waitMinutes - a.waitMinutes)
}

export function generateAlerts(storeId?: string): Alert[] {
  const alerts: Alert[] = []
  const stores = storeId ? STORES.filter((s) => s.id === storeId) : STORES
  const alertTypes: AlertType[] = ['timeout_wait', 'long_occupation', 'frequent_reassign']
  const severities: AlertSeverity[] = ['low', 'medium', 'high', 'critical']

  let seed = 1000
  for (const store of stores) {
    const alertCount = store.status === 'critical' ? 5 : store.status === 'warning' ? 3 : 2

    for (let i = 0; i < alertCount; i++) {
      seed++
      const type = randomFrom(alertTypes, seed)
      const isHandled = seededRandom(seed + 1) < 0.25

      let severity: AlertSeverity
      let message: string
      let suggestion: string
      const storeConsultants = CONSULTANTS.filter((c) => c.storeId === store.id)
      const consultant = randomFrom(storeConsultants, seed + 2)
      const queuing = generateQueuingCustomers(store.id)
      const customer = randomFrom(queuing, seed + 3)

      if (type === 'timeout_wait') {
        const waitTime = 45 + Math.floor(seededRandom(seed + 4) * 75)
        severity = waitTime >= 90 ? 'critical' : waitTime >= 70 ? 'high' : waitTime >= 55 ? 'medium' : 'low'
        message = `顾客${customer?.name || 'XXX'}等待已超过${waitTime}分钟，请尽快安排接诊`
        suggestion = '建议增派空闲咨询师，或主动联系顾客提供等候区饮品服务'
      } else if (type === 'long_occupation') {
        const occMinutes = 60 + Math.floor(seededRandom(seed + 5) * 60)
        severity = occMinutes >= 100 ? 'high' : occMinutes >= 80 ? 'medium' : 'low'
        message = `咨询师${consultant?.name || 'XXX'}接诊时间已达${occMinutes}分钟，超出平均时长`
        suggestion = '建议确认是否遇到复杂情况，必要时安排资深咨询师协助'
      } else {
        const reassignCount = 2 + Math.floor(seededRandom(seed + 6) * 3)
        severity = reassignCount >= 4 ? 'high' : reassignCount >= 3 ? 'medium' : 'low'
        message = `顾客${customer?.name || 'XXX'}已被${reassignCount}次转派咨询师，顾客体验可能受影响`
        suggestion = '建议直接安排资深咨询师接诊，同时了解顾客需求避免再次转派'
      }

      const triggeredHour = 9 + Math.floor(seededRandom(seed + 7) * 8)
      const triggeredMin = Math.floor(seededRandom(seed + 8) * 60)
      const triggeredDate = new Date()
      triggeredDate.setHours(triggeredHour, triggeredMin, 0, 0)

      alerts.push({
        id: `alert-${store.id}-${i + 1}`,
        type,
        severity,
        storeId: store.id,
        storeName: store.name,
        consultantId: type !== 'timeout_wait' ? consultant?.id : undefined,
        consultantName: type !== 'timeout_wait' ? consultant?.name : undefined,
        customerId: type !== 'long_occupation' ? customer?.id : undefined,
        customerName: type !== 'long_occupation' ? customer?.name : undefined,
        message,
        triggeredAt: triggeredDate.toISOString(),
        isHandled,
        handledBy: isHandled ? '店长王经理' : undefined,
        handledAt: isHandled ? new Date(triggeredDate.getTime() + 15 * 60 * 1000).toISOString() : undefined,
        handleNote: isHandled ? '已协调安排，问题解决' : undefined,
        suggestion
      })
    }
  }

  return alerts.sort((a, b) => {
    const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
    if (a.isHandled !== b.isHandled) return a.isHandled ? 1 : -1
    return severityOrder[a.severity] - severityOrder[b.severity]
  })
}

export function generateWaitingAnalysis(): WaitingAnalysis[] {
  const analysis: WaitingAnalysis[] = []

  for (let hour = 0; hour < 24; hour++) {
    const isBusiness = hour >= 9 && hour <= 20
    const isPeak = (hour >= 10 && hour <= 12) || (hour >= 14 && hour <= 17)

    let avgWaitMinutes: number
    let peakCount: number
    let newCustomerCount: number
    let oldCustomerCount: number

    if (!isBusiness) {
      avgWaitMinutes = 0
      peakCount = 0
      newCustomerCount = 0
      oldCustomerCount = 0
    } else if (isPeak) {
      avgWaitMinutes = 35 + Math.floor(seededRandom(hour * 11) * 30)
      peakCount = 18 + Math.floor(seededRandom(hour * 13) * 15)
      newCustomerCount = 8 + Math.floor(seededRandom(hour * 17) * 8)
      oldCustomerCount = 10 + Math.floor(seededRandom(hour * 19) * 10)
    } else {
      avgWaitMinutes = 12 + Math.floor(seededRandom(hour * 23) * 20)
      peakCount = 6 + Math.floor(seededRandom(hour * 29) * 10)
      newCustomerCount = 2 + Math.floor(seededRandom(hour * 31) * 5)
      oldCustomerCount = 4 + Math.floor(seededRandom(hour * 37) * 7)
    }

    const newCustomerAvgWait = isBusiness ? avgWaitMinutes + 8 + Math.floor(seededRandom(hour * 41) * 10) : 0
    const oldCustomerAvgWait = isBusiness ? Math.max(5, avgWaitMinutes - 5 - Math.floor(seededRandom(hour * 43) * 8)) : 0

    analysis.push({
      hour,
      avgWaitMinutes,
      peakCount,
      newCustomerCount,
      oldCustomerCount,
      newCustomerAvgWait,
      oldCustomerAvgWait
    })
  }

  return analysis
}

const cancelReasons = [
  '等待时间过长，失去耐心',
  '临时有事无法等候',
  '对咨询师安排不满意',
  '价格咨询后觉得偏高',
  '朋友推荐了其他机构',
  '身体突然不适',
  '项目需要改期进行',
  '与其他行程冲突'
]

export function generateCancelRecords(): CancelRecord[] {
  const records: CancelRecord[] = []
  const projectTypes: ProjectType[] = ['hyaluronic', 'photoelectric', 'skincare', 'surgery']

  for (let i = 0; i < 20; i++) {
    const seed = i * 53 + 7
    const isNew = seededRandom(seed) < 0.55
    const projectType = randomFrom(projectTypes, seed + 1)
    const firstName = randomFrom(customerFirstNames, seed + 2)
    const lastName = randomFrom(customerLastNames, seed + 3)

    const cancelHour = 10 + Math.floor(seededRandom(seed + 4) * 10)
    const cancelMin = Math.floor(seededRandom(seed + 5) * 60)
    const cancelDate = new Date()
    cancelDate.setHours(cancelHour, cancelMin, 0, 0)

    records.push({
      id: `cancel-${i + 1}`,
      customerName: firstName + lastName,
      phone: `138${(10000000 + Math.floor(seededRandom(seed + 6) * 89999999)).toString().slice(0, 8)}`,
      projectType,
      waitMinutes: isNew ? 25 + Math.floor(seededRandom(seed + 7) * 60) : 15 + Math.floor(seededRandom(seed + 8) * 45),
      cancelTime: cancelDate.toISOString(),
      cancelReason: randomFrom(cancelReasons, seed + 9),
      isNewCustomer: isNew
    })
  }

  return records
}

export function generateStoreRanking(): StoreRanking[] {
  const rankings: StoreRanking[] = STORES.map((store, idx) => {
    const baseScore = 95 - idx * 4
    const totalConsultations = store.todayConsultations + Math.floor(seededRandom(idx + 10) * 20)
    const avgWaitMinutes = 15 + idx * 5 + Math.floor(seededRandom(idx + 20) * 10)
    const cancelRate = 1.5 + idx * 0.8 + seededRandom(idx + 30) * 2

    return {
      rank: 0,
      storeId: store.id,
      storeName: store.name,
      totalConsultations,
      avgWaitMinutes,
      cancelRate: Number(cancelRate.toFixed(1)),
      efficiencyScore: baseScore - cancelRate * 2 - avgWaitMinutes * 0.3
    }
  })

  rankings.sort((a, b) => b.efficiencyScore - a.efficiencyScore)
  rankings.forEach((r, i) => (r.rank = i + 1))

  return rankings
}

export function generateConsultantEfficiency(): ConsultantEfficiency[] {
  const efficiencies: ConsultantEfficiency[] = CONSULTANTS.slice(0, 20).map((c, idx) => {
    const store = STORES.find((s) => s.id === c.storeId) || STORES[0]
    const baseScore = 95 - idx * 2.5
    const servedCount = c.todayServed + Math.floor(seededRandom(idx + 50) * 4)
    const avgConsultMinutes = 22 + (idx % 6) * 4 + Math.floor(seededRandom(idx + 60) * 6)
    const satisfaction = 98 - (idx % 8) - seededRandom(idx + 70) * 3

    return {
      rank: 0,
      consultantId: c.id,
      consultantName: c.name,
      storeName: store.name,
      servedCount,
      avgConsultMinutes,
      customerSatisfaction: Number(satisfaction.toFixed(1)),
      efficiencyScore: baseScore + servedCount * 0.5 - avgConsultMinutes * 0.2 + satisfaction * 0.1
    }
  })

  efficiencies.sort((a, b) => b.efficiencyScore - a.efficiencyScore)
  efficiencies.forEach((e, i) => (e.rank = i + 1))

  return efficiencies
}

export function generateTrendData(): TrendDataPoint[] {
  const data: TrendDataPoint[] = []

  for (let hour = 0; hour < 24; hour++) {
    const isBusiness = hour >= 9 && hour <= 20
    const isPeak = (hour >= 10 && hour <= 12) || (hour >= 14 && hour <= 17)

    let waiting: number
    let consultations: number

    if (!isBusiness) {
      waiting = 0
      consultations = 0
    } else if (isPeak) {
      waiting = 16 + Math.floor(seededRandom(hour * 101) * 12)
      consultations = 8 + Math.floor(seededRandom(hour * 103) * 6)
    } else {
      waiting = 5 + Math.floor(seededRandom(hour * 107) * 10)
      consultations = 3 + Math.floor(seededRandom(hour * 109) * 5)
    }

    data.push({
      time: `${hour.toString().padStart(2, '0')}:00`,
      waiting,
      consultations
    })
  }

  return data
}
