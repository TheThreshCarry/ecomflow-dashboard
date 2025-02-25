"use client"

import { usePathname } from 'next/navigation'

export function StepIndicator() {
  const pathname = usePathname()
  
  let step1 = false
  let step2 = false 
  let step3 = false
  
  // Determine which step is active based on the current pathname
  if (pathname === '/upload') {
    step1 = true
  } else if (pathname === '/configure') {
    step1 = true
    step2 = true
  } else if (pathname === '/results') {
    step1 = true
    step2 = true
    step3 = true
  } else if (pathname === '/') {
    // On welcome page, first step is active
    step1 = false
  }
  
  return (
    <div className="flex items-center justify-center mb-8">
      <div className="flex items-center w-full max-w-3xl">
        <div 
          className={`flex-1 h-2 rounded-l-full ${
            step1 ? 'bg-primary' : 'bg-muted'
          }`}
        />
        <div 
          className={`flex-1 h-2 ${
            step2 ? 'bg-primary' : 'bg-muted'
          }`}
        />
        <div 
          className={`flex-1 h-2 rounded-r-full ${
            step3 ? 'bg-primary' : 'bg-muted'
          }`}
        />
      </div>
    </div>
  )
} 