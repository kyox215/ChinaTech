'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { useLanguage } from '@/contexts/LanguageContext'
import { getTranslation } from '@/lib/translations'
import { 
  CheckCircle, 
  Clock, 
  Search, 
  Wrench, 
  TestTube, 
  Package, 
  Truck 
} from 'lucide-react'

type OrderStatus = 
  | 'RECEIVED'
  | 'DIAGNOSING'
  | 'REPAIRING'
  | 'TESTING'
  | 'COMPLETED'
  | 'READY_PICKUP'
  | 'DELIVERED'

interface OrderStatusTrackerProps {
  currentStatus: OrderStatus
  className?: string
  size?: 'sm' | 'md'
}

const statusFlow: OrderStatus[] = [
  'RECEIVED',
  'DIAGNOSING',
  'REPAIRING',
  'TESTING',
  'COMPLETED',
  'READY_PICKUP'
]

const statusIcons = {
  RECEIVED: CheckCircle,
  DIAGNOSING: Search,
  REPAIRING: Wrench,
  TESTING: TestTube,
  COMPLETED: CheckCircle,
  READY_PICKUP: Package,
  DELIVERED: Truck
}

const statusColors = {
  completed: 'text-green-600 border-green-600 bg-green-50',
  current: 'text-blue-600 border-blue-600 bg-blue-50',
  pending: 'text-gray-400 border-gray-300 bg-gray-50'
}

export function OrderStatusTracker({ currentStatus, className, size = 'md' }: OrderStatusTrackerProps) {
  const { language } = useLanguage()
  const currentIndex = statusFlow.indexOf(currentStatus)

  const getStatusState = (index: number) => {
    if (index < currentIndex) return 'completed'
    if (index === currentIndex) return 'current'
    return 'pending'
  }

  const iconSize = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'
  const containerPadding = size === 'sm' ? 'p-2' : 'p-3'
  const textSize = size === 'sm' ? 'text-xs' : 'text-sm'

  return (
    <div className={cn('bg-white rounded-lg border', containerPadding, className)}>
      <div className="flex items-center justify-between">
        {statusFlow.map((status, index) => {
          const state = getStatusState(index)
          const Icon = statusIcons[status]
          const isLast = index === statusFlow.length - 1

          return (
            <div key={status} className="flex items-center">
              <div className="flex flex-col items-center">
                <div className={cn(
                  'flex items-center justify-center rounded-full border-2 transition-colors',
                  size === 'sm' ? 'w-8 h-8' : 'w-10 h-10',
                  statusColors[state]
                )}>
                  <Icon className={iconSize} />
                </div>
                <span className={cn(
                  'mt-1 font-medium text-center max-w-20 leading-tight',
                  textSize,
                  state === 'completed' ? 'text-green-600' :
                  state === 'current' ? 'text-blue-600' : 'text-gray-400'
                )}>
                  {getTranslation(language, `orderStatus.${status}`)}
                </span>
              </div>
              
              {!isLast && (
                <div className={cn(
                  'flex-1 h-0.5 mx-2 min-w-4',
                  index < currentIndex ? 'bg-green-600' : 'bg-gray-300'
                )} />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}