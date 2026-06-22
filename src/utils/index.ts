import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { ProjectType, AlertSeverity } from '../types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}min`
  }
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return mins > 0 ? `${hours}h${mins}m` : `${hours}h`
}

export function formatTime(dateStr: string): string {
  const date = new Date(dateStr)
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  return `${hours}:${minutes}`
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  return `${month}-${day}`
}

export function formatDateTime(dateStr: string): string {
  const d = new Date(dateStr);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

export function getProjectTypeName(type: ProjectType): string {
  const nameMap: Record<ProjectType, string> = {
    hyaluronic: '玻尿酸注射',
    photoelectric: '光电项目',
    skincare: '皮肤护理',
    surgery: '医美手术'
  }
  return nameMap[type]
}

export function getProjectTypeColor(type: ProjectType): string {
  const colorMap: Record<ProjectType, string> = {
    hyaluronic: 'bg-pink-100 text-pink-700 border-pink-200',
    photoelectric: 'bg-purple-100 text-purple-700 border-purple-200',
    skincare: 'bg-teal-100 text-teal-700 border-teal-200',
    surgery: 'bg-orange-100 text-orange-700 border-orange-200'
  }
  return colorMap[type]
}

export function getSeverityColor(severity: AlertSeverity): string {
  const colorMap: Record<AlertSeverity, string> = {
    low: 'bg-blue-100 text-blue-700 border-blue-200',
    medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    high: 'bg-orange-100 text-orange-700 border-orange-200',
    critical: 'bg-red-100 text-red-700 border-red-200'
  }
  return colorMap[severity]
}

export function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
