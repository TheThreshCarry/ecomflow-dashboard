"use client"

import { useInventory } from "./providers"
import { WelcomeStep } from "@/components/steps/WelcomeStep"
import { useRouter } from "next/navigation"
import { StepIndicator } from "@/components/steps/StepIndicator"
import { useEffect } from "react"
import { Logo } from "@/components/ui/logo"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { Footer } from "@/components/ui/footer"

export default function Home() {
  const router = useRouter()
  const { resetData } = useInventory()
  
  // Use useEffect to prevent infinite loop
  useEffect(() => {
    resetData()
  }, []) // Empty dependency array means this runs once on mount
  
  const handleNext = () => {
    router.push("/upload")
  }
  
  return (
    <div className="container mx-auto p-4 min-h-screen flex flex-col">
      <div className="flex items-center justify-between gap-3 mb-8">
        <div className="flex items-center gap-3" onClick={() => router.push("/")}>
          <Logo size="large" />
          <h1 className="text-3xl font-bold">Inventory Threshold Optimizer</h1>
        </div>
        <ThemeToggle />
      </div>
      
      {/* Progress indicator */}
      <StepIndicator />
      
      <div className="mx-auto w-full max-w-3xl">
        <WelcomeStep onNext={handleNext} />
      </div>
      
      <Footer />
    </div>
  )
}