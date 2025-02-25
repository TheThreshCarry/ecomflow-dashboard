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
        className="overflow-hidden rounded-md flex items-center justify-center text-white font-bold"
        style={{ width: dimensions, height: dimensions }}
      >
        <Image
          src="https://media.licdn.com/dms/image/v2/D560BAQF1Nom5iwfD_A/company-logo_200_200/company-logo_200_200/0/1731818635764/ecomflowhq_logo?e=2147483647&v=beta&t=PSvA40PxX8CO07WkEeRqrXzEQEyYTL-kI5oJsffwL1k"
          alt="Logo"
          width={dimensions}
          height={dimensions}
        />
      </div>
    </div>
  );
} 