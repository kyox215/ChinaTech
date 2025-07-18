'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { useSearchParams } from 'next/navigation'
import { ArrowLeft, Search, AlertCircle } from 'lucide-react'
import { ChinaTechLogo } from '@/components/ChinaTechLogo'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { OrderStatusTracker } from '@/components/OrderStatusTracker'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useLanguage } from '@/contexts/LanguageContext'
import { getTranslation } from '@/lib/translations'
import { formatDateTime, formatPrice } from '@/lib/utils'
import Link from 'next/link'
import toast from 'react-hot-toast'

interface OrderInfo {
  id: string
  orderNumber: string
  deviceBrand: string
  deviceModel: string
  status: string
  estimatedCompletion: string | null
  actualCompletion: string | null
  createdAt: string
  updatedAt: string
  customerName: string
  technicianName?: string
  statusHistory: Array<{
    status: string
    notes: string | null
    createdAt: string
  }>
}

export default function OrderLookupPage() {
  const { language } = useLanguage()
  const searchParams = useSearchParams()
  const [orderNumber, setOrderNumber] = useState('')
  const [orderInfo, setOrderInfo] = useState<OrderInfo | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlOrderNumber = searchParams.get('orderNumber')
      if (urlOrderNumber) {
        setOrderNumber(urlOrderNumber)
        handleLookup(urlOrderNumber)
      }
    }
  }, [searchParams])

  const handleLookup = async (orderNum?: string) => {
    const searchOrderNumber = orderNum || orderNumber.trim().toUpperCase()
    
    if (!searchOrderNumber) {
      toast.error('Inserisci un numero d\'ordine valido')
      return
    }

    setLoading(true)
    setError('')
    setOrderInfo(null)

    try {
      const response = await fetch(`/api/orders/lookup?orderNumber=${encodeURIComponent(searchOrderNumber)}`)
      
      if (!response.ok) {
        if (response.status === 404) {
          setError('Ordine non trovato. Verifica il numero d\'ordine e riprova.')
        } else {
          setError('Errore durante la ricerca. Riprova più tardi.')
        }
        return
      }

      const data = await response.json()
      setOrderInfo(data)
    } catch (err) {
      console.error('Error looking up order:', err)
      setError('Errore di connessione. Verifica la tua connessione internet e riprova.')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLookup()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <header className="flex justify-between items-center p-6 max-w-6xl mx-auto">
        <Link href="/">
          <ChinaTechLogo size="md" />
        </Link>
        <LanguageSwitcher />
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="space-y-8">
          {/* Back Button */}
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Torna alla Home
            </Button>
          </Link>

          {/* Search Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Search className="w-5 h-5" />
                <span>Cerca Ordine</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-4">
                <Input
                  placeholder="Inserisci numero ordine (es. CT001)"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value.toUpperCase())}
                  onKeyPress={handleKeyPress}
                  className="flex-1"
                  maxLength={10}
                />
                <Button 
                  onClick={() => handleLookup()}
                  disabled={loading || !orderNumber.trim()}
                  className="min-w-[120px]"
                >
                  {loading ? 'Ricerca...' : 'Cerca'}
                </Button>
              </div>
              
              {error && (
                <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm">{error}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Order Information */}
          {orderInfo && (
            <div className="space-y-6">
              {/* Order Status Tracker */}
              <Card>
                <CardHeader>
                  <CardTitle>Stato Ordine: {orderInfo.orderNumber}</CardTitle>
                </CardHeader>
                <CardContent>
                  <OrderStatusTracker 
                    currentStatus={orderInfo.status as any} 
                    className="mb-6"
                  />
                  
                  <div className="grid md:grid-cols-2 gap-6 mt-6">
                    <div className="space-y-3">
                      <h4 className="font-semibold text-gray-900">Informazioni Dispositivo</h4>
                      <div className="space-y-2 text-sm">
                        <p><span className="font-medium">Marca:</span> {orderInfo.deviceBrand}</p>
                        <p><span className="font-medium">Modello:</span> {orderInfo.deviceModel}</p>
                        <p><span className="font-medium">Cliente:</span> {orderInfo.customerName}</p>
                        {orderInfo.technicianName && (
                          <p><span className="font-medium">Tecnico:</span> {orderInfo.technicianName}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <h4 className="font-semibold text-gray-900">Tempistiche</h4>
                      <div className="space-y-2 text-sm">
                        <p><span className="font-medium">Ricevuto:</span> {formatDateTime(orderInfo.createdAt, 'it-IT')}</p>
                        <p><span className="font-medium">Ultimo aggiornamento:</span> {formatDateTime(orderInfo.updatedAt, 'it-IT')}</p>
                        {orderInfo.estimatedCompletion && (
                          <p><span className="font-medium">Completamento previsto:</span> {formatDateTime(orderInfo.estimatedCompletion, 'it-IT')}</p>
                        )}
                        {orderInfo.actualCompletion && (
                          <p><span className="font-medium">Completato:</span> {formatDateTime(orderInfo.actualCompletion, 'it-IT')}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Status History */}
              {orderInfo.statusHistory.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Cronologia Stato</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {orderInfo.statusHistory.map((history, index) => (
                        <div key={index} className="flex items-start space-x-3 border-l-2 border-blue-200 pl-4 py-2">
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-blue-600">
                                {getTranslation(language, `orderStatus.${history.status}`)}
                              </span>
                              <span className="text-sm text-gray-500">
                                {formatDateTime(history.createdAt, 'it-IT')}
                              </span>
                            </div>
                            {history.notes && (
                              <p className="text-sm text-gray-600 mt-1">{history.notes}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}