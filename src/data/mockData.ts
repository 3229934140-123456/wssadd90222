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
  TrendSummary,
  StoreDailyTrend,
  ProjectType,
  CustomerStatus,
  ConsultantStatus,
  AlertType,
  AlertSeverity,
  TimeSlot,
  HandleAction
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
    status: 'warning',
    waitThresholdMin: 40,
    lateThresholdMin: 25
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
    status: 'critical',
    waitThresholdMin: 50,
    lateThresholdMin: 15
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
    status: 'normal',
    waitThresholdMin: 35,
    lateThresholdMin: 20
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
    status: 'normal',
    waitThresholdMin: 35,
    lateThresholdMin: 20
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
    status: 'normal',
    waitThresholdMin: 30,
    lateThresholdMin: 20
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
    status: 'critical',
    waitThresholdMin: 40,
    lateThresholdMin: 25
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
    status: 'normal',
    waitThresholdMin: 35,
    lateThresholdMin: 15
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
    status: 'warning',
    waitThresholdMin: 40,
    lateThresholdMin: 15
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
  const threshold = store.waitThresholdMin
  const warningThreshold = Math.floor(threshold * 0.7)
  const count = 15 + Math.floor(seededRandom(store.todayConsultations) * 10)
  const projectTypes: ProjectType[] = ['hyaluronic', 'photoelectric', 'skincare', 'surgery']

  for (let i = 0; i < count; i++) {
    const seed = i * 7 + store.todayConsultations
    const rand = seededRandom(seed)
    const isNew = rand < 0.4
    const projectType = randomFrom(projectTypes, seed)
    const projects = projectInfo[projectType]
    const projectName = randomFrom(projects, seed + 3)

    const isArrivedNotConsulted = seededRandom(seed + 99) < (isNew ? 0.3 : 0.2)

    let waitMinutes: number
    if (isArrivedNotConsulted) {
      const lateRange = threshold - store.lateThresholdMin
      waitMinutes = store.lateThresholdMin + Math.floor(seededRandom(seed + 88) * lateRange)
    } else {
      waitMinutes = isNew
        ? Math.floor(15 + rand * 85)
        : Math.floor(8 + rand * 55)
    }

    let status: CustomerStatus
    if (waitMinutes >= threshold) {
      status = 'timeout'
    } else if (waitMinutes >= warningThreshold) {
      status = i % 5 === 0 ? 'calling' : 'waiting'
    } else if (isArrivedNotConsulted) {
      status = 'waiting'
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
        : undefined,
      minutesLateAfterAppt: isArrivedNotConsulted ? waitMinutes : undefined
    })
  }

  return customers.sort((a, b) => b.waitMinutes - a.waitMinutes)
}

export function generateAlerts(storeId?: string): Alert[] {
  const alerts: Alert[] = []
  const stores = storeId ? STORES.filter((s) => s.id === storeId) : STORES

  let globalIdx = 0
  for (const store of stores) {
    const threshold = store.waitThresholdMin
    const lateThreshold = store.lateThresholdMin
    const queuedCustomers = generateQueuingCustomers(store.id)
    const timeoutWaitCustomers = queuedCustomers.filter((c) => c.status === 'timeout')
    const arrivedNotConsultedCustomers = queuedCustomers.filter(
      (c) => c.status === 'waiting' && c.waitMinutes >= lateThreshold
    )

    const baseAlertCount = store.status === 'critical' ? 5 : store.status === 'warning' ? 3 : 2
    const timeoutWaitCount = Math.min(timeoutWaitCustomers.length, 8)
    const arrivedNotConsultedCount = Math.min(arrivedNotConsultedCustomers.length, 8)
    const otherAlertCount = Math.max(0, baseAlertCount - timeoutWaitCount - arrivedNotConsultedCount)

    let seed = 1000
    const storeConsultants = CONSULTANTS.filter((c) => c.storeId === store.id)

    for (let i = 0; i < timeoutWaitCount; i++) {
      globalIdx++
      seed++
      const customer = timeoutWaitCustomers[i]
      const waitMinutes = customer.waitMinutes

      let severity: AlertSeverity
      if (waitMinutes >= threshold * 2) {
        severity = 'critical'
      } else if (waitMinutes >= threshold * 1.5) {
        severity = 'high'
      } else if (waitMinutes >= threshold) {
        severity = 'medium'
      } else {
        severity = 'low'
      }

      let isPriorityFollowUp = false
      let escalationLevel: 1 | 2 | 3 = 1
      let escalationReason: string | undefined = undefined

      if (waitMinutes >= threshold * 3) {
        escalationLevel = 3
        isPriorityFollowUp = true
        escalationReason = `等待时间已超门店标准3倍(${waitMinutes}分钟)，需立即处理`
      } else if (waitMinutes >= threshold * 2) {
        escalationLevel = 2
        isPriorityFollowUp = true
        escalationReason = `等待时间已超门店标准2倍(${waitMinutes}分钟)，请尽快处理`
      } else if (waitMinutes >= threshold * 1.5 && seededRandom(seed + 500) < 0.4) {
        escalationLevel = 1
        isPriorityFollowUp = true
        escalationReason = '等待超时未处理超过30分钟，升级关注'
      }

      const isHandled = seededRandom(seed + 1) < 0.15
      const message = `顾客${customer.name}已等待${waitMinutes}分钟（门店标准${threshold}分钟），请尽快安排接诊`
      const suggestion = '建议增派空闲咨询师，或主动联系顾客提供等候区饮品服务'

      const triggeredHour = 9 + Math.floor(seededRandom(seed + 7) * 8)
      const triggeredMin = Math.floor(seededRandom(seed + 8) * 60)
      const triggeredDate = new Date()
      triggeredDate.setHours(triggeredHour, triggeredMin, 0, 0)

      alerts.push({
        id: `alert-${store.id}-${globalIdx}`,
        type: 'timeout_wait',
        severity,
        storeId: store.id,
        storeName: store.name,
        customerId: customer.id,
        customerName: customer.name,
        message,
        triggeredAt: triggeredDate.toISOString(),
        isHandled,
        handledBy: isHandled ? '店长王经理' : undefined,
        handledAt: isHandled ? new Date(triggeredDate.getTime() + 15 * 60 * 1000).toISOString() : undefined,
        handleNote: isHandled ? '已协调安排，问题解决' : undefined,
        handleAction: isHandled ? ('arrange_consultant' as HandleAction) : undefined,
        suggestion,
        isPriorityFollowUp,
        escalationLevel,
        escalationReason
      })
    }

    for (let i = 0; i < arrivedNotConsultedCount; i++) {
      globalIdx++
      seed++
      const customer = arrivedNotConsultedCustomers[i]
      const lateMin = customer.waitMinutes

      let severity: AlertSeverity
      if (lateMin >= lateThreshold + 20) {
        severity = 'high'
      } else if (lateMin >= lateThreshold + 10) {
        severity = 'medium'
      } else {
        severity = 'low'
      }

      let isPriorityFollowUp = false
      let escalationLevel: 1 | 2 | 3 = 1
      let escalationReason: string | undefined = undefined

      if (lateMin >= 45) {
        escalationLevel = 3
        isPriorityFollowUp = true
        escalationReason = `到店未接诊已达${lateMin}分钟，超过45分钟严重超时，需立即处理`
      } else if (lateMin >= lateThreshold + 25) {
        escalationLevel = 2
        isPriorityFollowUp = true
        escalationReason = `到店未接诊已达${lateMin}分钟，请尽快安排接诊`
      } else if (lateMin >= lateThreshold + 15 && seededRandom(seed + 600) < 0.45) {
        escalationLevel = 1
        isPriorityFollowUp = true
        escalationReason = '到店未接诊时间过长，升级关注'
      }

      const isHandled = seededRandom(seed + 1) < 0.2
      const message = `顾客${customer.name}已到店超过${lateMin}分钟未接诊，预约时间已过，请优先安排`
      const suggestion = '建议立即安排空闲咨询师接诊，同时向顾客致歉说明情况'

      const triggeredHour = 9 + Math.floor(seededRandom(seed + 7) * 8)
      const triggeredMin = Math.floor(seededRandom(seed + 8) * 60)
      const triggeredDate = new Date()
      triggeredDate.setHours(triggeredHour, triggeredMin, 0, 0)

      alerts.push({
        id: `alert-${store.id}-${globalIdx}`,
        type: 'arrived_not_consulted',
        severity,
        storeId: store.id,
        storeName: store.name,
        customerId: customer.id,
        customerName: customer.name,
        message,
        triggeredAt: triggeredDate.toISOString(),
        isHandled,
        handledBy: isHandled ? '店长王经理' : undefined,
        handledAt: isHandled ? new Date(triggeredDate.getTime() + 15 * 60 * 1000).toISOString() : undefined,
        handleNote: isHandled ? '已协调安排，问题解决' : undefined,
        handleAction: isHandled ? ('apologize_customer' as HandleAction) : undefined,
        suggestion,
        isPriorityFollowUp,
        escalationLevel,
        escalationReason
      })
    }

    const otherTypes: Array<'long_occupation' | 'frequent_reassign'> = ['long_occupation', 'frequent_reassign']
    for (let i = 0; i < otherAlertCount; i++) {
      globalIdx++
      seed++
      const type = randomFrom(otherTypes, seed)
      const isHandled = seededRandom(seed + 1) < 0.3

      let severity: AlertSeverity
      let message: string
      let suggestion: string
      let alertConsultantId: string | undefined
      let alertConsultantName: string | undefined
      let alertCustomerId: string | undefined
      let alertCustomerName: string | undefined
      const consultant = randomFrom(storeConsultants, seed + 2)
      const customer = randomFrom(queuedCustomers, seed + 3)

      if (type === 'long_occupation') {
        const occMinutes = 60 + Math.floor(seededRandom(seed + 5) * 60)
        severity = occMinutes >= 100 ? 'high' : occMinutes >= 80 ? 'medium' : 'low'
        message = `咨询师${consultant?.name || 'XXX'}接诊时间已达${occMinutes}分钟，超出平均时长`
        suggestion = '建议确认是否遇到复杂情况，必要时安排资深咨询师协助'
        alertConsultantId = consultant?.id
        alertConsultantName = consultant?.name
      } else {
        const reassignCount = 2 + Math.floor(seededRandom(seed + 6) * 3)
        severity = reassignCount >= 4 ? 'high' : reassignCount >= 3 ? 'medium' : 'low'
        message = `顾客${customer?.name || 'XXX'}已被${reassignCount}次转派咨询师，顾客体验可能受影响`
        suggestion = '建议直接安排资深咨询师接诊，同时了解顾客需求避免再次转派'
        alertConsultantId = consultant?.id
        alertConsultantName = consultant?.name
        alertCustomerId = customer?.id
        alertCustomerName = customer?.name
      }

      const triggeredHour = 9 + Math.floor(seededRandom(seed + 7) * 8)
      const triggeredMin = Math.floor(seededRandom(seed + 8) * 60)
      const triggeredDate = new Date()
      triggeredDate.setHours(triggeredHour, triggeredMin, 0, 0)

      alerts.push({
        id: `alert-${store.id}-${globalIdx}`,
        type,
        severity,
        storeId: store.id,
        storeName: store.name,
        consultantId: alertConsultantId,
        consultantName: alertConsultantName,
        customerId: alertCustomerId,
        customerName: alertCustomerName,
        message,
        triggeredAt: triggeredDate.toISOString(),
        isHandled,
        handledBy: isHandled ? '店长王经理' : undefined,
        handledAt: isHandled ? new Date(triggeredDate.getTime() + 15 * 60 * 1000).toISOString() : undefined,
        handleNote: isHandled ? '已协调安排，问题解决' : undefined,
        handleAction: isHandled ? (type === 'long_occupation' ? 'adjust_schedule' as HandleAction : 'reassign' as HandleAction) : undefined,
        suggestion,
        isPriorityFollowUp: false,
        escalationLevel: 1,
        escalationReason: undefined
      })
    }
  }

  return alerts.sort((a, b) => {
    const severityOrder: Record<AlertSeverity, number> = { critical: 0, high: 1, medium: 2, low: 3 }
    if (a.isHandled !== b.isHandled) return a.isHandled ? 1 : -1
    if (a.isPriorityFollowUp && !b.isPriorityFollowUp) return -1
    if (!a.isPriorityFollowUp && b.isPriorityFollowUp) return 1
    if (a.isPriorityFollowUp && b.isPriorityFollowUp) {
      const levelDiff = (b.escalationLevel || 1) - (a.escalationLevel || 1)
      if (levelDiff !== 0) return levelDiff
    }
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

export function generateStoreRanking(storeIds?: string[], dateRange?: { start: string; end: string }): StoreRanking[] {
  const sourceStores = storeIds ? STORES.filter((s) => storeIds.includes(s.id)) : STORES
  const days = dateRange
    ? Math.max(1, Math.floor((new Date(dateRange.end).getTime() - new Date(dateRange.start).getTime()) / 86400000) + 1)
    : 7
  const scaleFactor = days / 7

  const rankings: StoreRanking[] = sourceStores.map((store, idx) => {
    const baseScore = 95 - idx * 4
    const baseConsultations = store.todayConsultations + Math.floor(seededRandom(idx + 10) * 20)
    const baseWaitMinutes = 15 + idx * 5 + Math.floor(seededRandom(idx + 20) * 10)
    const baseCancelRate = 1.5 + idx * 0.8 + seededRandom(idx + 30) * 2

    const totalConsultations = Math.round(baseConsultations * scaleFactor)
    const avgWaitMinutes = Math.round(baseWaitMinutes * scaleFactor)
    const cancelCount = Math.round(baseCancelRate * baseConsultations * scaleFactor / 100)
    const cancelRate = Number(((cancelCount / Math.max(1, totalConsultations)) * 100).toFixed(1))

    return {
      rank: 0,
      storeId: store.id,
      storeName: store.name,
      totalConsultations,
      avgWaitMinutes,
      cancelRate,
      efficiencyScore: Number((baseScore - cancelRate * 2 - avgWaitMinutes * 0.3).toFixed(1))
    }
  })

  rankings.sort((a, b) => b.efficiencyScore - a.efficiencyScore)
  rankings.forEach((r, i) => (r.rank = i + 1))

  return rankings
}

export function generateConsultantEfficiency(storeIds?: string[], dateRange?: { start: string; end: string }): ConsultantEfficiency[] {
  const sourceConsultants = storeIds
    ? CONSULTANTS.filter((c) => storeIds.includes(c.storeId))
    : CONSULTANTS.slice(0, 20)
  const days = dateRange
    ? Math.max(1, Math.floor((new Date(dateRange.end).getTime() - new Date(dateRange.start).getTime()) / 86400000) + 1)
    : 7
  const scaleFactor = days / 7

  const efficiencies: ConsultantEfficiency[] = sourceConsultants.map((c, idx) => {
    const store = STORES.find((s) => s.id === c.storeId) || STORES[0]
    const baseScore = 95 - idx * 2.5
    const baseServedCount = c.todayServed + Math.floor(seededRandom(idx + 50) * 4)
    const baseAvgConsultMinutes = 22 + (idx % 6) * 4 + Math.floor(seededRandom(idx + 60) * 6)
    const satisfaction = 98 - (idx % 8) - seededRandom(idx + 70) * 3

    const servedCount = Math.round(baseServedCount * scaleFactor)
    const avgConsultMinutes = Math.round(baseAvgConsultMinutes * scaleFactor)

    return {
      rank: 0,
      consultantId: c.id,
      consultantName: c.name,
      storeName: store.name,
      servedCount,
      avgConsultMinutes,
      customerSatisfaction: Number(satisfaction.toFixed(1)),
      efficiencyScore: Number((baseScore + servedCount * 0.5 - avgConsultMinutes * 0.2 + satisfaction * 0.1).toFixed(1))
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

export function generateTrendSummary(days: 7 | 30, storeIds?: string[], dateRange?: { start: string; end: string }): TrendSummary {
  const byDay: StoreDailyTrend[] = []
  const storeMultiplier = storeIds ? Math.max(0.3, storeIds.length / STORES.length) : 1

  let actualDays: number
  let startDate: Date
  let endDate: Date

  if (dateRange) {
    startDate = new Date(dateRange.start)
    endDate = new Date(dateRange.end)
    actualDays = Math.max(1, Math.floor((endDate.getTime() - startDate.getTime()) / 86400000) + 1)
  } else {
    endDate = new Date()
    startDate = new Date(endDate)
    startDate.setDate(endDate.getDate() - days + 1)
    actualDays = days
  }

  const normalizedDays: 7 | 30 = actualDays <= 7 ? 7 : actualDays <= 30 ? 30 : 30

  for (let i = 0; i < actualDays; i++) {
    const date = new Date(startDate)
    date.setDate(startDate.getDate() + i)
    const dateStr = `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}`
    const dayOfWeek = date.getDay()
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6

    const seedBase = actualDays * 1000 + i * 31
    const baseConsultations = isWeekend ? 35 : 65
    const dayFluctuation = (seededRandom(seedBase + 1) - 0.5) * (normalizedDays === 30 ? 40 : 20)
    const consultations = Math.max(10, Math.floor((baseConsultations + dayFluctuation) * storeMultiplier))

    const baseWait = isWeekend ? 22 : 30
    const waitFluctuation = (seededRandom(seedBase + 2) - 0.5) * 15
    const avgWait = Math.max(8, Math.floor(baseWait + waitFluctuation))

    const baseCancels = Math.floor(consultations * (0.05 + seededRandom(seedBase + 3) * 0.05))
    const cancels = Math.max(0, baseCancels)

    byDay.push({ date: dateStr, consultations, avgWait, cancels })
  }

  const totalConsultations = byDay.reduce((sum, d) => sum + d.consultations, 0)
  const totalCancels = byDay.reduce((sum, d) => sum + d.cancels, 0)
  const avgWaitMinutes = Math.round(byDay.reduce((sum, d) => sum + d.avgWait, 0) / byDay.length)
  const cancelRate = Number(((totalCancels / Math.max(1, totalConsultations)) * 100).toFixed(1))

  return {
    days: normalizedDays,
    totalConsultations,
    avgWaitMinutes,
    cancelCount: totalCancels,
    cancelRate,
    peakHours: '10:00-12:00, 14:00-17:00',
    compareToPrevPeriod: {
      consultationsDeltaPct: Number(((seededRandom(actualDays * 99) - 0.4) * 20).toFixed(1)),
      waitDeltaPct: Number(((seededRandom(actualDays * 97) - 0.6) * 15).toFixed(1)),
      cancelRateDeltaPct: Number(((seededRandom(actualDays * 95) - 0.5) * 10).toFixed(1))
    },
    byDay
  }
}

export function generateStoreDailyTrend(storeId: string, days: 7 | 30, dateRange?: { start: string; end: string }): StoreDailyTrend[] {
  const byDay: StoreDailyTrend[] = []
  const store = STORES.find((s) => s.id === storeId) || STORES[0]

  let cityMultiplier: number
  if (store.city === '上海' || store.city === '北京') {
    cityMultiplier = 1.3
  } else if (store.city === '杭州' || store.city === '南京') {
    cityMultiplier = 0.75
  } else {
    cityMultiplier = 1.0
  }

  let actualDays: number
  let startDate: Date
  let endDate: Date

  if (dateRange) {
    startDate = new Date(dateRange.start)
    endDate = new Date(dateRange.end)
    actualDays = Math.max(1, Math.floor((endDate.getTime() - startDate.getTime()) / 86400000) + 1)
  } else {
    endDate = new Date()
    startDate = new Date(endDate)
    startDate.setDate(endDate.getDate() - days + 1)
    actualDays = days
  }

  const normalizedDays: 7 | 30 = actualDays <= 7 ? 7 : actualDays <= 30 ? 30 : 30

  for (let i = 0; i < actualDays; i++) {
    const date = new Date(startDate)
    date.setDate(startDate.getDate() + i)
    const dateStr = `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}`
    const dayOfWeek = date.getDay()
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6

    const seedBase = store.id.charCodeAt(6) * 100 + normalizedDays * 10 + i * 37
    const baseConsultations = isWeekend ? 28 : 58
    const dayFluctuation = (seededRandom(seedBase + 1) - 0.5) * (normalizedDays === 30 ? 30 : 16)
    const consultations = Math.max(6, Math.floor((baseConsultations + dayFluctuation) * cityMultiplier))

    const baseWait = isWeekend ? 20 : (store.city === '上海' || store.city === '北京' ? 34 : 26)
    const waitFluctuation = (seededRandom(seedBase + 2) - 0.5) * 14
    const avgWait = Math.max(6, Math.floor(baseWait + waitFluctuation))

    const baseCancels = Math.floor(consultations * (0.045 + seededRandom(seedBase + 3) * 0.06))
    const cancels = Math.max(0, baseCancels)

    byDay.push({
      date: dateStr,
      consultations,
      avgWait,
      cancels,
      storeId: store.id,
      storeName: store.name
    })
  }

  return byDay
}
