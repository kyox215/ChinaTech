import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// 生成订单号
export function generateOrderNumber(): string {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const letter1 = letters[Math.floor(Math.random() * letters.length)]
  const letter2 = letters[Math.floor(Math.random() * letters.length)]
  const numbers = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
  return `${letter1}${letter2}${numbers}`
}

// 格式化价格
export function formatPrice(amount: number, currency: string = '€'): string {
  return `${currency}${amount.toFixed(2)}`
}

// 格式化日期时间
export function formatDateTime(date: Date | string, locale: string = 'it-IT'): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleString(locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 格式化日期
export function formatDate(date: Date | string, locale: string = 'it-IT'): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString(locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

// WhatsApp消息发送（预留接口）
export async function sendWhatsAppMessage(phoneNumber: string, message: string): Promise<boolean> {
  // TODO: 实现WhatsApp Business API集成
  // 这里是预留接口，等待用户配置WhatsApp Business API后实现
  console.log('WhatsApp message would be sent:', { phoneNumber, message })
  return true
}

// Google Maps地址链接生成
export function generateGoogleMapsLink(address: string): string {
  const encodedAddress = encodeURIComponent(address)
  return `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`
}

// WhatsApp链接生成
export function generateWhatsAppLink(phoneNumber: string, message?: string): string {
  const cleanPhone = phoneNumber.replace(/[^\d+]/g, '')
  const encodedMessage = message ? encodeURIComponent(message) : ''
  return `https://wa.me/${cleanPhone}${encodedMessage ? `?text=${encodedMessage}` : ''}`
}

// 电话链接生成
export function generatePhoneLink(phoneNumber: string): string {
  return `tel:${phoneNumber}`
}