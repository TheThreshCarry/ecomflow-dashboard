"use client"

import { useRouter } from "next/navigation"
import { useInventory } from "../providers"
import { ResultsStep } from "@/components/steps/ResultsStep"
import { ThresholdParams } from "@/lib/types"
import { StepIndicator } from "@/components/steps/StepIndicator"
import { Logo } from "@/components/ui/logo"

export default function ResultsPage() {
  const router = useRouter()
  const { 
    data, 
    params, 
    thresholds, 
    chartData, 
    ordersData, 
    setParams,
    calculateThresholds
  } = useInventory()
  
  // Redirect to upload page if no data is available
  if (data.length === 0) {
    router.push("/upload")
    return null
  }
  
  // Function to get dynamic background color based on lead time
  const getLeadTimeColor = (leadTime: number) => {
    if (leadTime <= 2) return "rgba(0, 255, 0, 0.1)" // Fast lead time (green)
    if (leadTime <= 5) return "rgba(255, 255, 0, 0.1)" // Medium lead time (yellow)
    if (leadTime <= 10) return "rgba(255, 165, 0, 0.1)" // Longer lead time (orange)
    return "rgba(255, 0, 0, 0.1)" // Very long lead time (red)
  }
  
  // Function to get bar color based on lead time
  const getBarColor = (leadTime: number) => {
    if (leadTime <= 2) return "hsl(var(--success))" // Fast lead time 
    if (leadTime <= 5) return "hsl(var(--warning))" // Medium lead time
    if (leadTime <= 10) return "hsl(var(--amber))" // Longer lead time
    return "hsl(var(--destructive))" // Very long lead time
  }
  
  const handleParamChange = (key: keyof ThresholdParams, value: number) => {
    setParams((prev) => ({
      ...prev,
      [key]: value,
    }))

    // Recalculate thresholds with the new parameters
    calculateThresholds()
  }
  
  const exportThresholds = () => {
    // Format the service level string
    const getServiceLevel = (zScore: number): string => {
      if (zScore === 1.28) return "90%";
      if (zScore === 1.64) return "95%";
      if (zScore === 1.96) return "97.5%";
      if (zScore === 2.33) return "99%";
      if (zScore === 2.58) return "99.5%";
      return "95%";
    };
    
    const formatNumber = (num: number) => num.toFixed(2);
    
    // Create a more detailed export with the new parameters
    const content = `Inventory Threshold Analysis Results

Threshold Levels:
Low Threshold: ${formatNumber(thresholds.low)}
Medium Threshold: ${formatNumber(thresholds.medium)} 
High Threshold: ${formatNumber(thresholds.high)}

Calculated Values:
Lead Time Demand: ${formatNumber(thresholds.leadTimeDemand)}
Safety Stock: ${formatNumber(thresholds.safetyStock)}
Reorder Point: ${formatNumber(thresholds.reorderPoint)}

Parameters:
Lead Time: ${params.leadTime} days
Safety Stock: ${params.safetyStock}%
Average Daily Sales: ${formatNumber(params.averageDailySales)}
Demand Standard Deviation: ${formatNumber(params.demandStdDev)}
Service Level: ${getServiceLevel(params.zScore)} (Z-Score: ${params.zScore})
Stockout Risk: ${(1 - params.zScore * 0.1).toFixed(1)}%

Export Date: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}
`

    const blob = new Blob([content], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "inventory-thresholds.txt"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }
  
  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex items-center gap-3 mb-8">
        <Logo size="large" />
        <h1 className="text-3xl font-bold">Inventory Threshold Optimizer</h1>
      </div>
      
      {/* Progress indicator */}
      <StepIndicator />
      
      <ResultsStep 
        params={params}
        thresholds={thresholds}
        chartData={chartData}
        ordersData={ordersData}
        onParamChange={handleParamChange}
        exportThresholds={exportThresholds}
        getBarColor={getBarColor}
        getLeadTimeColor={getLeadTimeColor}
      />
    </div>
  )
} 