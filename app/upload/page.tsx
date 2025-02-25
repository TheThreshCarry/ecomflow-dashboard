"use client"

import { useRouter } from "next/navigation"
import { useInventory } from "../providers"
import { UploadStep } from "@/components/steps/UploadStep"
import type { InventoryData } from "@/lib/schemas"
import { StepIndicator } from "@/components/steps/StepIndicator"
import { Logo } from "@/components/ui/logo"

export default function UploadPage() {
  const router = useRouter()
  const { 
    setData, 
    setError, 
    error,
    calculateThresholds
  } = useInventory()
  
  const handleBack = () => {
    router.push("/")
  }
  
  // This is called when the file is validated but without navigation
  const handleFileValidated = (parsedData: InventoryData[]) => {
    // Set the data in context
    setData(parsedData)
  }
  
  // This is called when the Continue button is clicked
  const handleContinueClick = (parsedData: InventoryData[]) => {
    // Calculate thresholds and chart data using the calculator
    calculateThresholds()
    
    // Navigate to the configure page
    router.push("/configure")
  }
  
  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex items-center gap-3 mb-8">
        <Logo size="large" />
        <h1 className="text-3xl font-bold">Inventory Threshold Optimizer</h1>
      </div>
      
      {/* Progress indicator */}
      <StepIndicator />
      
      <UploadStep 
        onBack={handleBack}
        onNext={handleContinueClick}
        onFileValidated={handleFileValidated}
        setError={setError}
        error={error}
      />
    </div>
  )
} 