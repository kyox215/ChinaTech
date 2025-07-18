'use client'

import React from 'react'
import { cn } from '@/lib/utils'

interface ChinaTechLogoProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'full' | 'icon'
}

export function ChinaTechLogo({ className, size = 'md', variant = 'full' }: ChinaTechLogoProps) {
  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl'
  }

  const iconSizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  }

  if (variant === 'icon') {
    return (
      <div className={cn(
        'relative flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg text-white font-bold',
        iconSizeClasses[size],
        className
      )}>
        <span className={cn(
          'font-black',
          size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : 'text-lg'
        )}>
          CT
        </span>
      </div>
    )
  }

  return (
    <div className={cn('flex items-center space-x-2', className)}>
      <div className={cn(
        'relative flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg text-white font-bold',
        iconSizeClasses[size]
      )}>
        <span className={cn(
          'font-black',
          size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : 'text-lg'
        )}>
          CT
        </span>
      </div>
      <span className={cn(
        'font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent',
        sizeClasses[size]
      )}>
        ChinaTech
      </span>
    </div>
  )
}