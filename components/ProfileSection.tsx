'use client'

import { useState, useEffect } from 'react'
import { User, Bell, Settings, LogOut, Crown, ChevronDown } from 'lucide-react'

interface ProfileSectionProps {
  className?: string
  showSignInModal?: boolean
  user?: {
    userId: string
    email: string
    role: string
    name: string
    profileComplete: boolean
  } | null
  onLogout?: () => void
}

export default function ProfileSection({ className = "", showSignInModal = false, user: propUser, onLogout }: ProfileSectionProps) {
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isNotificationOpen, setIsNotificationOpen] = useState(false)
  const [showModal, setShowModal] = useState(false)

  // Use prop user if provided, otherwise use mock data
  const user = propUser || {
    userId: '',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'talent',
    profileComplete: false,
    isAuthenticated: false // Set to true to show authenticated state
  }

  const isAuthenticated = propUser !== null && propUser !== undefined

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (!target.closest('.profile-dropdown-container')) {
        setIsProfileOpen(false)
        setIsNotificationOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleProfileClick = () => {
    if (!isAuthenticated && showSignInModal) {
      setShowModal(true)
    } else if (isAuthenticated) {
      setIsProfileOpen(!isProfileOpen)
    }
  }

  const handleLogout = () => {
    if (onLogout) {
      onLogout()
    }
    setIsProfileOpen(false)
  }

  return (
    <>
      <div className={`flex items-center space-x-4 ${className}`}>
        {isAuthenticated ? (
          <>
            {/* Notifications */}
            <div className="relative profile-dropdown-container">
              <button
                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                className="p-2 rounded-full bg-white/10 dark:bg-gray-800/50 backdrop-blur-sm hover:bg-white/20 dark:hover:bg-gray-700/50 transition-colors relative"
              >
                <Bell className="h-5 w-5 text-gray-700 dark:text-white" />
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-accent-red rounded-full flex items-center justify-center text-xs text-white">3</span>
              </button>
              
              {isNotificationOpen && (
                <div className="absolute right-0 top-12 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-50 max-h-96 overflow-y-auto">
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="font-semibold text-gray-900 dark:text-white">Notifications</h3>
                  </div>
                  <div className="p-2">
                    <div className="p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg cursor-pointer">
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-accent-red rounded-full mt-2"></div>
                        <div>
                          <p className="text-sm text-gray-900 dark:text-white">New project match found</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">2 minutes ago</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg cursor-pointer">
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-primary-blue rounded-full mt-2"></div>
                        <div>
                          <p className="text-sm text-gray-900 dark:text-white">Application status updated</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">1 hour ago</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg cursor-pointer">
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                        <div>
                          <p className="text-sm text-gray-900 dark:text-white">Profile view from client</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">3 hours ago</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="relative profile-dropdown-container">
              <button
                onClick={handleProfileClick}
                className="flex items-center space-x-3 p-2 rounded-full bg-white/10 dark:bg-gray-800/50 backdrop-blur-sm hover:bg-white/20 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-primary-blue to-accent-blue rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-300 flex items-center">
                    {user.role === 'talent' && <Crown className="h-3 w-3 mr-1" />}
                    {user.role}
                  </p>
                </div>
                <ChevronDown className="h-4 w-4 text-gray-700 dark:text-white" />
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 top-12 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-50">
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-primary-blue to-accent-blue rounded-full flex items-center justify-center">
                        <User className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">{user.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-2">
                    <a href="/dashboard/talent" className="flex items-center space-x-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg">
                      <User className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                      <span className="text-sm text-gray-900 dark:text-white">View Profile</span>
                    </a>
                    <a href="/dashboard/talent" className="flex items-center space-x-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg">
                      <Crown className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                      <span className="text-sm text-gray-900 dark:text-white">Dashboard</span>
                    </a>
                    <a href="/settings" className="flex items-center space-x-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg">
                      <Settings className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                      <span className="text-sm text-gray-900 dark:text-white">Settings</span>
                    </a>
                    <div className="border-t border-gray-200 dark:border-gray-700 mt-2 pt-2">
                      <button 
                        onClick={handleLogout}
                        className="flex items-center space-x-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg w-full text-left"
                      >
                        <LogOut className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                        <span className="text-sm text-gray-900 dark:text-white">Sign Out</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex items-center space-x-3">
            <button
              onClick={handleProfileClick}
              className="flex items-center space-x-2 p-2 rounded-full bg-white/10 dark:bg-gray-800/50 backdrop-blur-sm hover:bg-white/20 dark:hover:bg-gray-700/50 transition-colors"
            >
              <div className="w-8 h-8 bg-gradient-to-r from-primary-blue to-accent-blue rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-white" />
              </div>
              <span className="hidden md:inline text-sm text-gray-700 dark:text-white">Account</span>
            </button>
          </div>
        )}
      </div>

      {/* Sign In Modal */}
      {showModal && !isAuthenticated && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full mx-4 transform transition-all">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome to 3YESES</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-4">
                <a
                  href="/auth/signin"
                  className="w-full bg-gradient-to-r from-primary-blue to-accent-blue hover:from-primary-blueHover hover:to-primary-blue text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 text-center block"
                >
                  Sign In
                </a>
                
                <div className="text-center text-gray-500 dark:text-gray-400">or</div>
                
                <a
                  href="/auth/signup"
                  className="w-full border-2 border-primary-blue text-primary-blue dark:text-primary-blue hover:bg-primary-blue hover:text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 text-center block"
                >
                  Create Account
                </a>
              </div>
              
              <p className="text-sm text-gray-600 dark:text-gray-400 text-center mt-6">
                Join thousands of talented professionals and discover your next opportunity.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
