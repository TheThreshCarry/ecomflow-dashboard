"use client"

import { useRouter } from "next/navigation"
import { ConfigureStep } from "@/components/steps/ConfigureStep"
import { useInventory } from "../providers"
import { StepIndicator } from "@/components/steps/StepIndicator"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { Logo } from "@/components/ui/logo"
import { Footer } from "@/components/ui/footer"
import { ThresholdParams } from "@/lib/types"

export default function ConfigurePage() {
  const router = useRouter()
  const { 
    data,
    params, 
    thresholds,
    setParams,
    calculateThresholds,
    error,
    setError,
  } = useInventory()
  
  // Redirect to upload if no data is available
  if (data.length === 0) {
    router.push("/")
    return null
  }
  
  const handleBack = () => {
    router.push("/upload")
  }
  
  const handleNext = () => {
    calculateThresholds()
    router.push("/results")
  }
  
  const handleParamChange = (key: keyof ThresholdParams, value: number) => {
    setParams((prev) => ({
      ...prev,
      [key]: value,
    }))
  }
  
  const handleCalculate = () => {
    calculateThresholds()
  }
  
  return (
    <div className="container mx-auto p-4 min-h-screen flex flex-col">
      <div className="flex items-center justify-between gap-3 mb-8">
        <div className="flex items-center gap-3">
          <Logo size="large" />
          <h1 className="text-3xl font-bold">Inventory Threshold Optimizer</h1>
        </div>
        <ThemeToggle />
      </div>
      
      {/* Progress indicator */}
      <StepIndicator />
      
      <div className="mx-auto w-full max-w-3xl">
        <ConfigureStep 
          onBack={handleBack}
          onNext={handleNext}
          params={params}
          thresholds={thresholds}
          onParamChange={handleParamChange}
          onCalculate={handleCalculate}
        />
      </div>
      
      <Footer />
    </div>
  )
} 