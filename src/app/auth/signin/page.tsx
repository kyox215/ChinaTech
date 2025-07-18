'use client'

import { useState } from 'react'
import { signIn, getSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, LogIn, Eye, EyeOff } from 'lucide-react'
import { ChinaTechLogo } from '@/components/ChinaTechLogo'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function SignInPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.email || !formData.password) {
      toast.error('Inserisci email e password')
      return
    }

    setLoading(true)

    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false
      })

      if (result?.error) {
        toast.error('Credenziali non valide')
        return
      }

      // Get user session to determine redirect
      const session = await getSession()
      if (session?.user) {
        toast.success('Accesso effettuato con successo!')
        
        // Redirect based on user role
        switch (session.user.role) {
          case 'ADMIN':
            router.push('/admin/dashboard')
            break
          case 'TECHNICIAN':
            router.push('/technician/dashboard')
            break
          default:
            router.push('/customer/dashboard')
        }
      }
    } catch (error) {
      console.error('Sign in error:', error)
      toast.error('Errore durante l\'accesso')
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
      <main className="flex items-center justify-center px-6 py-8">
        <div className="w-full max-w-md space-y-8">
          {/* Back Button */}
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Torna alla Home
            </Button>
          </Link>

          {/* Sign In Card */}
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center space-x-2">
                <LogIn className="w-5 h-5" />
                <span>Accedi al Sistema</span>
              </CardTitle>
              <p className="text-sm text-gray-600 mt-2">
                Accesso riservato a tecnici e amministratori
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Email</label>
                  <Input
                    type="email"
                    placeholder="tua@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Password</label>
                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="La tua password"
                      value={formData.password}
                      onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                      required
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? 'Accesso in corso...' : 'Accedi'}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Non hai un account?{' '}
                  <Link href="/auth/signup" className="text-blue-600 hover:text-blue-800 font-medium">
                    Registrati qui
                  </Link>
                </p>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="text-xs text-gray-500 space-y-1">
                  <p><strong>Account Demo:</strong></p>
                  <p>Admin: admin@chinatech.com / admin123</p>
                  <p>Tecnico: tech@chinatech.com / tech123</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}