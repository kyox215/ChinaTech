'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/contexts/LanguageContext'
import { Globe } from 'lucide-react'

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage()

  const languages = [
    { code: 'it', label: 'IT', flag: '🇮🇹' },
    { code: 'en', label: 'EN', flag: '🇬🇧' },
    { code: 'zh', label: '中', flag: '🇨🇳' }
  ]

  return (
    <div className="flex items-center space-x-1">
      <Globe className="w-4 h-4 text-gray-500" />
      {languages.map((lang) => (
        <Button
          key={lang.code}
          variant={language === lang.code ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setLanguage(lang.code as any)}
          className="h-8 px-2"
        >
          <span className="mr-1">{lang.flag}</span>
          <span className="text-xs">{lang.label}</span>
        </Button>
      ))}
    </div>
  )
}