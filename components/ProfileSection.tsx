'use client'

import { useState, useEffect } from 'react'
import { User } from 'lucide-react'
import NotificationDropdown from './NotificationDropdown'
import LanguageDropdown from './LanguageDropdown'
import ProfileDropdown from './ProfileDropdown'

interface ProfileSectionProps {
  className?: string
  showSignInModal?: boolean
  user?: {
    userId: string
    email: string
    role: string
    name: string
    profileComplete: boolean
    avatarUrl?: string
  } | null
  onLogout?: () => void
}

export default function ProfileSection({ className = "", showSignInModal = false, user: propUser, onLogout }: ProfileSectionProps) {
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

  const handleProfileClick = () => {
    if (!isAuthenticated && showSignInModal) {
      setShowModal(true)
    }
  }

  return (
    <>
      <div className={`flex items-center space-x-4 ${className}`}>
        {isAuthenticated ? (
          <>
            {/* Language Switcher */}
            <LanguageDropdown />
            
            {/* Notifications */}
            <NotificationDropdown />

            {/* Profile Dropdown */}
            <ProfileDropdown 
              user={{
                id: user.userId,
                name: user.name,
                email: user.email,
                role: user.role?.toUpperCase() as 'TALENT' | 'ADMIN',
                avatarUrl: ('avatarUrl' in user ? user.avatarUrl : undefined)
              }}
              onLogout={() => {
                if (onLogout) {
                  onLogout()
                }
              }}
            />
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
