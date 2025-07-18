'use client'

import { useState } from 'react'
import { ArrowLeft, FileText, Smartphone, AlertCircle, CheckCircle } from 'lucide-react'
import { ChinaTechLogo } from '@/components/ChinaTechLogo'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useLanguage } from '@/contexts/LanguageContext'
import { getTranslation } from '@/lib/translations'
import { formatPrice } from '@/lib/utils'
import Link from 'next/link'
import toast from 'react-hot-toast'

interface QuoteResult {
  deviceBrand: string
  deviceModel: string
  issueDescription: string
  estimatedPrice: number
  currency: string
  validUntil: string
  notes: string
  createdAt: string
}

export default function QuotePage() {
  const { language } = useLanguage()
  const [formData, setFormData] = useState({
    deviceBrand: '',
    deviceModel: '',
    issueDescription: '',
    customerEmail: ''
  })
  const [quote, setQuote] = useState<QuoteResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const deviceBrands = ['Apple', 'Samsung', 'Huawei', 'Xiaomi', 'OnePlus', 'Google', 'Sony', 'Oppo', 'Vivo', 'Altro']
  const commonIssues = [
    'Schermo rotto/danneggiato',
    'Batteria scarica rapidamente', 
    'Problemi di ricarica',
    'Dispositivo bagnato/danneggiato dall\'acqua',
    'Problemi audio/altoparlanti',
    'Fotocamera non funziona',
    'Pulsanti non funzionano',
    'Problemi software/sistema',
    'Altro problema'
  ]

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.deviceBrand || !formData.deviceModel || !formData.issueDescription) {
      toast.error('Compila tutti i campi obbligatori')
      return
    }

    setLoading(true)
    setError('')
    setQuote(null)

    try {
      const response = await fetch('/api/quote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        throw new Error('Errore durante la generazione del preventivo')
      }

      const data = await response.json()
      setQuote(data)
      toast.success('Preventivo generato con successo!')
    } catch (err) {
      console.error('Error generating quote:', err)
      setError('Errore durante la generazione del preventivo. Riprova più tardi.')
      toast.error('Errore durante la generazione del preventivo')
    } finally {
      setLoading(false)
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

          {!quote ? (
            /* Quote Form */
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="w-5 h-5" />
                  <span>Richiesta Preventivo Riparazione</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Device Information */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Marca Dispositivo *</label>
                      <select
                        value={formData.deviceBrand}
                        onChange={(e) => handleInputChange('deviceBrand', e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      >
                        <option value="">Seleziona marca</option>
                        {deviceBrands.map(brand => (
                          <option key={brand} value={brand}>{brand}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Modello Dispositivo *</label>
                      <Input
                        placeholder="es. iPhone 14, Galaxy S23, P50 Pro"
                        value={formData.deviceModel}
                        onChange={(e) => handleInputChange('deviceModel', e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  {/* Issue Description */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Descrizione del Problema *</label>
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {commonIssues.map(issue => (
                          <button
                            key={issue}
                            type="button"
                            onClick={() => handleInputChange('issueDescription', issue)}
                            className={`p-2 text-left text-sm border rounded-lg transition-colors ${
                              formData.issueDescription === issue
                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                : 'border-gray-300 hover:border-gray-400'
                            }`}
                          >
                            {issue}
                          </button>
                        ))}
                      </div>
                      <textarea
                        placeholder="Descrivi il problema in dettaglio..."
                        value={formData.issueDescription}
                        onChange={(e) => handleInputChange('issueDescription', e.target.value)}
                        rows={4}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>

                  {/* Customer Email */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Email (opzionale)</label>
                    <Input
                      type="email"
                      placeholder="tua@email.com"
                      value={formData.customerEmail}
                      onChange={(e) => handleInputChange('customerEmail', e.target.value)}
                    />
                    <p className="text-xs text-gray-500">Se fornisci l'email, riceverai una copia del preventivo</p>
                  </div>

                  {error && (
                    <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
                      <AlertCircle className="w-5 h-5 flex-shrink-0" />
                      <span className="text-sm">{error}</span>
                    </div>
                  )}

                  <Button 
                    type="submit" 
                    disabled={loading}
                    className="w-full md:w-auto min-w-[200px]"
                  >
                    {loading ? 'Generazione...' : 'Richiedi Preventivo'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          ) : (
            /* Quote Result */
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span>Preventivo Generato</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <div className="text-center space-y-4">
                    <div className="flex items-center justify-center space-x-2">
                      <Smartphone className="w-6 h-6 text-gray-600" />
                      <span className="font-medium">{quote.deviceBrand} {quote.deviceModel}</span>
                    </div>
                    
                    <div className="text-3xl font-bold text-green-600">
                      {formatPrice(quote.estimatedPrice, '€')}
                    </div>
                    
                    <p className="text-sm text-gray-600 italic">
                      {quote.notes}
                    </p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900">Dettagli Preventivo</h4>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">Dispositivo:</span> {quote.deviceBrand} {quote.deviceModel}</p>
                      <p><span className="font-medium">Problema:</span> {quote.issueDescription}</p>
                      <p><span className="font-medium">Prezzo stimato:</span> {formatPrice(quote.estimatedPrice, '€')}</p>
                      <p><span className="font-medium">Valido fino al:</span> {new Date(quote.validUntil).toLocaleDateString('it-IT')}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900">Prossimi Passi</h4>
                    <div className="space-y-2 text-sm text-gray-600">
                      <p>• Porta il dispositivo nel nostro centro per una diagnosi gratuita</p>
                      <p>• Confermeremo il prezzo finale dopo l'ispezione</p>
                      <p>• Tempo di riparazione stimato: 1-3 giorni lavorativi</p>
                      <p>• Garanzia di 6 mesi su tutti i lavori</p>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-4">
                  <Button 
                    onClick={() => {
                      setQuote(null)
                      setFormData({
                        deviceBrand: '',
                        deviceModel: '',
                        issueDescription: '',
                        customerEmail: ''
                      })
                    }}
                    variant="outline"
                  >
                    Nuovo Preventivo
                  </Button>
                  
                  <Link href="/">
                    <Button>
                      Torna alla Home
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}