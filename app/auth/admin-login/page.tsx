'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, Shield, Loader2, AlertCircle } from 'lucide-react'
import { AdminThemeProvider } from '@/components/admin/AdminThemeProvider'
import { AdminModeToggle } from '@/components/admin/AdminModeToggle'

export default function AdminLoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  
  const emailRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  useEffect(() => {
    // Focus email on mount
    if (emailRef.current) {
      emailRef.current.focus()
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setSuccess(false)

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.success) {
        if (data.user.role !== 'ADMIN') {
          setError('Access denied. Administrator privileges required.')
          return
        }
        
        setSuccess(true)
        // Delay redirect slightly
        setTimeout(() => {
            router.push('/admin')
        }, 500)
      } else {
        setError(data.message || 'Authentication failed. Please check your credentials.')
      }
    } catch {
      setError('Connection failed. Please check your network.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    if (error) setError('')
  }

  return (
    <AdminThemeProvider>
    <div className="min-h-screen bg-gray-50 dark:bg-[#09090b] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden transition-colors duration-300">
      
      {/* Theme Toggle */}
      <div className="absolute top-4 right-4 z-50">
        <AdminModeToggle />
      </div>

      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
              <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-[var(--admin-primary)]/10 rounded-full blur-[120px] transition-colors duration-500"></div>
              <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-[var(--admin-accent)]/10 rounded-full blur-[100px] transition-colors duration-500"></div>
            </div>
      
            <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
              <div className="flex justify-center mb-8">
                  <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-[var(--admin-primary)] to-[var(--admin-accent)] flex items-center justify-center text-white shadow-2xl shadow-[var(--admin-primary)]/20 ring-1 ring-white/20">
                      <Shield className="h-8 w-8" />
                  </div>
              </div>
              <h2 className="mt-2 text-center text-4xl font-black tracking-tighter text-transparent bg-clip-text admin-gradient-text">
                3YESES
              </h2>
              <p className="mt-2 text-center text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                Admin Portal
              </p>
            </div>
      
            <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
              <div className="bg-white/80 dark:bg-white/5 backdrop-blur-xl py-8 px-4 shadow-2xl sm:rounded-2xl sm:px-10 border border-gray-200 dark:border-white/10 transition-colors duration-300">
                <form className="space-y-6" onSubmit={handleSubmit}>
                  <div>
                    <label htmlFor="email" className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
                      Email Address
                    </label>
                    <div className="mt-1">
                      <input
                        ref={emailRef}
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        className="appearance-none block w-full px-4 py-3 bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-lg text-[var(--admin-text)] placeholder-[var(--admin-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--admin-primary)]/50 focus:border-[var(--admin-primary)] transition-all"
                        placeholder="admin@3yeses.online"
                      />
                    </div>
                  </div>
      
                  <div>
                    <label htmlFor="password" className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
                      Password
                    </label>
                    <div className="mt-1 relative">
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="current-password"
                        required
                        value={formData.password}
                        onChange={handleInputChange}
                        className="appearance-none block w-full px-4 py-3 bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-lg text-[var(--admin-text)] placeholder-[var(--admin-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--admin-primary)]/50 focus:border-[var(--admin-primary)] transition-all pr-10"
                        placeholder="••••••••"
                      />
                       <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-[var(--admin-primary)] transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                                  id="rememberMe"
                                  name="rememberMe"
                                  type="checkbox"
                                  checked={formData.rememberMe}
                                  onChange={handleInputChange}
                                  className="h-4 w-4 text-[var(--admin-primary)] focus:ring-[var(--admin-primary)] border-gray-600 rounded bg-black/20"
                                />
                                <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                                  Remember me
                                </label>
                              </div>
                
                              <div className="text-sm">
                                <a href="#" className="font-medium text-[var(--admin-primary)] hover:text-[var(--admin-accent)] transition-colors">
                                  Forgot password?
                                </a>
                              </div>
            </div>

            {error && (
                <div className="rounded-md bg-red-50 p-4 border border-red-200">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <AlertCircle className="h-5 w-5 text-red-500" aria-hidden="true" />
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800">{error}</h3>
                        </div>
                    </div>
                </div>
            )}

            {success && (
                <div className="rounded-md bg-green-50 p-4 border border-green-200">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <Loader2 className="h-5 w-5 text-green-500 animate-spin" aria-hidden="true" />
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-green-800">Login successful. Redirecting...</h3>
                        </div>
                    </div>
                </div>
            )}

            <div>
                          <button
                            type="submit"
                            disabled={isLoading || success}
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent rounded-lg text-sm font-bold text-white overflow-hidden transition-all hover:scale-[1.02]"
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-[var(--admin-primary)] to-[var(--admin-accent)] group-hover:opacity-90 transition-all"></div>
                            <div className="relative flex items-center">
                                {isLoading ? (
                                    <>
                                        <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                                        AUTHENTICATING...
                                    </>
                                ) : (
                                    'SIGN IN'
                                )}
                            </div>
                          </button>
                        </div>
          </form>
        </div>
        
        <div className="mt-8 text-center">
             <Link href="/" className="text-xs font-medium text-gray-500 hover:text-[var(--admin-primary)] transition-colors uppercase tracking-widest">
                &larr; Return to Main Site
            </Link>
        </div>

      </div>
    </div>
    </AdminThemeProvider>
  )
}
