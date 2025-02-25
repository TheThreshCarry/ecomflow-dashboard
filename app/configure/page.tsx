"use client"

import { useRouter } from "next/navigation"
import { useInventory } from "../providers"
import { ConfigureStep } from "@/components/steps/ConfigureStep"
import { ThresholdParams } from "@/lib/types"
import { StepIndicator } from "@/components/steps/StepIndicator"
import { Logo } from "@/components/ui/logo"
import { ThemeToggle } from "@/components/ui/theme-toggle"

export default function ConfigurePage() {
  const router = useRouter()
  const { 
    data, 
    params, 
    thresholds, 
    setParams, 
    calculateThresholds
  } = useInventory()
  
  // Redirect to upload page if no data is available
  if (data.length === 0) {
    router.push("/upload")
    return null
  }
  
  const handleBack = () => {
    router.push("/upload")
  }
  
  const handleNext = () => {
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
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between gap-3 mb-8">
        <div className="flex items-center gap-3">
          <Logo size="large" />
          <h1 className="text-3xl font-bold">Inventory Threshold Optimizer</h1>
        </div>
        <ThemeToggle />
      </div>
      
      {/* Progress indicator */}
      <StepIndicator />
      
      <ConfigureStep 
        onBack={handleBack}
        onNext={handleNext}
        params={params}
        thresholds={thresholds}
        onParamChange={handleParamChange}
        onCalculate={handleCalculate}
      />
    </div>
  )
} 