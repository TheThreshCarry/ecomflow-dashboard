import Image from 'next/image'
import { cn } from '@/lib/utils'

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export function Logo({ 
  size = 'medium', 
  className 
}: LogoProps) {
  // Size mapping
  const sizeMap = {
    small: 24,
    medium: 32,
    large: 48
  }
  
  const dimensions = sizeMap[size]
  
  return (
    <div className={cn("relative flex items-center", className)}>
      {/* Placeholder for actual logo - will be replaced with real URL later */}
      <div 
        className="bg-[#01A20E] rounded-md flex items-center justify-center text-white font-bold"
        style={{ width: dimensions, height: dimensions }}
      >
        ITO
      </div>
    </div>
  )
} 