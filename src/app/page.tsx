'use client'

import { useState } from 'react'
import { Search, FileText, LogIn, MapPin, Phone, Clock } from 'lucide-react'
import { ChinaTechLogo } from '@/components/ChinaTechLogo'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useLanguage } from '@/contexts/LanguageContext'
import { getTranslation } from '@/lib/translations'
import { generateGoogleMapsLink, generateWhatsAppLink, generatePhoneLink } from '@/lib/utils'
import Link from 'next/link'

export default function HomePage() {
  const { language } = useLanguage()
  const [orderNumber, setOrderNumber] = useState('')

  const companyInfo = {
    name: process.env.NEXT_PUBLIC_COMPANY_NAME || 'ChinaTech',
    phone: process.env.NEXT_PUBLIC_COMPANY_PHONE || '+39 123 456 7890',
    address: process.env.NEXT_PUBLIC_COMPANY_ADDRESS || 'Via Roma 123, 20100 Milano, Italy',
    businessHours: process.env.NEXT_PUBLIC_BUSINESS_HOURS || 'Lunedì - Sabato: 9:00 - 19:00'
  }

  const handleOrderLookup = () => {
    if (orderNumber.trim()) {
      window.location.href = `/order-lookup?orderNumber=${orderNumber.trim().toUpperCase()}`
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleOrderLookup()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <header className="flex justify-between items-center p-6 max-w-6xl mx-auto">
        <ChinaTechLogo size="lg" />
        <LanguageSwitcher />
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-6 pb-20">
        <div className="max-w-4xl w-full space-y-12">
          {/* Hero Section */}
          <div className="text-center space-y-6">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900">
              {getTranslation(language, 'homepage.title')}
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {getTranslation(language, 'homepage.subtitle')}
            </p>
          </div>

          {/* Action Cards */}
          <div className="grid md:grid-cols-3 gap-6">
            {/* Order Lookup */}
            <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
              <CardContent className="p-6 text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                  <Search className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {getTranslation(language, 'homepage.orderLookup')}
                </h3>
                <div className="space-y-3">
                  <Input
                    placeholder={getTranslation(language, 'homepage.orderNumber')}
                    value={orderNumber}
                    onChange={(e) => setOrderNumber(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="text-center uppercase"
                    maxLength={10}
                  />
                  <Button 
                    onClick={handleOrderLookup}
                    className="w-full"
                    disabled={!orderNumber.trim()}
                  >
                    {getTranslation(language, 'homepage.lookupOrder')}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Repair Quote */}
            <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
              <CardContent className="p-6 text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center group-hover:bg-green-200 transition-colors">
                  <FileText className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {getTranslation(language, 'homepage.repairQuote')}
                </h3>
                <div className="space-y-3">
                  <p className="text-gray-600 text-sm">
                    Ricevi un preventivo gratuito per la riparazione del tuo dispositivo
                  </p>
                  <Link href="/quote">
                    <Button className="w-full" variant="outline">
                      {getTranslation(language, 'homepage.getQuote')}
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Login */}
            <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
              <CardContent className="p-6 text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-purple-100 rounded-full flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                  <LogIn className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {getTranslation(language, 'homepage.login')}
                </h3>
                <div className="space-y-3">
                  <p className="text-gray-600 text-sm">
                    Accesso per tecnici e amministratori
                  </p>
                  <Link href="/auth/signin">
                    <Button className="w-full" variant="outline">
                      {getTranslation(language, 'homepage.login')}
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-6 text-center md:text-left">
            {/* Business Hours */}
            <div className="flex items-center justify-center md:justify-start space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">
                  {getTranslation(language, 'homepage.businessHours')}
                </p>
                <p className="text-gray-600 text-sm">{companyInfo.businessHours}</p>
              </div>
            </div>

            {/* Address */}
            <div className="flex items-center justify-center md:justify-start space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <MapPin className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">
                  {getTranslation(language, 'homepage.address')}
                </p>
                <a 
                  href={generateGoogleMapsLink(companyInfo.address)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 text-sm hover:text-blue-600 transition-colors"
                >
                  {companyInfo.address}
                </a>
              </div>
            </div>

            {/* Phone */}
            <div className="flex items-center justify-center md:justify-start space-x-3">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <Phone className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">
                  {getTranslation(language, 'homepage.phone')}
                </p>
                <div className="flex space-x-3">
                  <a 
                    href={generatePhoneLink(companyInfo.phone)}
                    className="text-gray-600 text-sm hover:text-blue-600 transition-colors"
                  >
                    {companyInfo.phone}
                  </a>
                  <a 
                    href={generateWhatsAppLink(companyInfo.phone)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-600 text-sm hover:text-green-700 transition-colors"
                  >
                    WhatsApp
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
