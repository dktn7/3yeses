'use client'

import * as React from 'react'
import { Moon, Sun, Monitor } from 'lucide-react'
import { useTheme } from 'next-themes'

export function ModeToggle() {
  const { setTheme, theme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  // useEffect only runs on the client, so now we can safely show the UI
  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    // Return a placeholder with the same dimensions to avoid layout shift
    return (
      <div className="inline-flex items-center justify-center rounded-md h-10 w-10 border border-input bg-transparent">
        <Sun className="h-[1.2rem] w-[1.2rem] text-gray-700 dark:text-white" />
        <span className="sr-only">Toggle theme</span>
      </div>
    )
  }

  return (
    <div className="relative">
      <button
        className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-transparent hover:bg-accent hover:text-accent-foreground dark:hover:bg-blue-500 dark:hover:text-white h-10 w-10"
        onClick={() => {
          if (theme === 'light') {
            setTheme('dark')
          } else if (theme === 'dark') {
            setTheme('system')
          } else {
            setTheme('light')
          }
        }}
      >
        <Sun className={`h-[1.2rem] w-[1.2rem] transition-all text-gray-700 dark:text-white ${theme === 'light' ? 'rotate-0 scale-100' : 'rotate-90 scale-0'}`} />
        <Moon className={`absolute h-[1.2rem] w-[1.2rem] transition-all text-gray-700 dark:text-white ${theme === 'dark' ? 'rotate-0 scale-100' : 'rotate-90 scale-0'}`} />
        <Monitor className={`absolute h-[1.2rem] w-[1.2rem] transition-all text-gray-700 dark:text-white ${theme === 'system' ? 'rotate-0 scale-100' : 'rotate-90 scale-0'}`} />
        <span className="sr-only">Toggle theme</span>
      </button>
    </div>
  )
}
