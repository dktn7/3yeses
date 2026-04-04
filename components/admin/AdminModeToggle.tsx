'use client'

import * as React from 'react'
import { Moon, Sun, Monitor } from 'lucide-react'
import { useTheme } from 'next-themes'

export function AdminModeToggle() {
  const { setTheme, theme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  // useEffect only runs on the client, so now we can safely show the UI
  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="h-9 w-9 flex items-center justify-center rounded-lg border border-gray-200 dark:border-white/10 bg-transparent">
        <Sun className="h-4 w-4 text-gray-500 dark:text-gray-400" />
      </div>
    )
  }

  const cycleTheme = () => {
    if (theme === 'light') {
      setTheme('dark')
    } else if (theme === 'dark') {
      setTheme('system')
    } else {
      setTheme('light')
    }
  }

  return (
    <button
      onClick={cycleTheme}
      className="h-9 w-9 flex items-center justify-center rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all relative group"
      title={`Current theme: ${theme}`}
    >
      <Sun className={`h-4 w-4 transition-all ${theme === 'light' ? 'rotate-0 scale-100' : 'rotate-90 scale-0 opacity-0'}`} />
      <Moon className={`absolute h-4 w-4 transition-all ${theme === 'dark' ? 'rotate-0 scale-100' : 'rotate-90 scale-0 opacity-0'}`} />
      <Monitor className={`absolute h-4 w-4 transition-all ${theme === 'system' ? 'rotate-0 scale-100' : 'rotate-90 scale-0 opacity-0'}`} />
      <span className="sr-only">Toggle theme</span>
      
      {/* Subtle glow effect for Admin Dashboard feel */}
      <div className="absolute inset-0 rounded-lg bg-red-500/0 group-hover:bg-red-500/5 transition-colors" />
    </button>
  )
}
