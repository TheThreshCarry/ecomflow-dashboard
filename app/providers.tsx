"use client"

import { createContext, useContext, useState, ReactNode } from "react"
import type { InventoryData } from "@/lib/schemas"
import { ThresholdParams, Thresholds } from "@/lib/types"
import { InventoryThresholdCalculator } from "@/lib/inventory-calculator"

interface InventoryContextType {
  data: InventoryData[]
  params: ThresholdParams
  thresholds: Thresholds
  chartData: any[]
  ordersData: any[]
  error: string
  
  setData: (data: InventoryData[]) => void
  setParams: (params: ThresholdParams | ((prev: ThresholdParams) => ThresholdParams)) => void
  setThresholds: (thresholds: Thresholds) => void
  setChartData: (data: any[]) => void
  setOrdersData: (data: any[]) => void
  setError: (error: string) => void
  resetData: () => void
  calculateThresholds: () => void
}

const defaultParams: ThresholdParams = {
  leadTime: 5,
  safetyStock: 20,
  averageDailySales: 0,
  demandStdDev: 0,
  zScore: 1.64, // Default z-score for 95% service level
}

const defaultThresholds: Thresholds = {
  low: 0,
  medium: 0,
  high: 0,
  leadTimeDemand: 0,
  safetyStock: 0,
  reorderPoint: 0,
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined)

export function InventoryProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<InventoryData[]>([])
  const [params, setParams] = useState<ThresholdParams>(defaultParams)
  const [thresholds, setThresholds] = useState<Thresholds>(defaultThresholds)
  const [chartData, setChartData] = useState<any[]>([])
  const [ordersData, setOrdersData] = useState<any[]>([])
  const [error, setError] = useState<string>("")

  const resetData = () => {
    setData([])
    setParams(defaultParams)
    setThresholds(defaultThresholds)
    setChartData([])
    setOrdersData([])
    setError("")
  }
  
  const calculateThresholds = () => {
    if (data.length === 0) {
      setError("No data available for calculation")
      return
    }
    
    try {
      const calculator = new InventoryThresholdCalculator(
        data,
        params.leadTime,
        params.safetyStock,
        params.averageDailySales,
        params.demandStdDev,
        params.zScore
      )
      
      // Get threshold levels
      const thresholdLevels = calculator.getThresholdLevels()
      setThresholds(thresholdLevels)
      
      // Get chart data
      const formattedChartData = calculator.getChartData()
      setChartData(formattedChartData)
      
      // Create orders data
      setOrdersData(data.map(item => ({
        date: item.date,
        orders: item.orders
      })))
      
      // Update average daily sales and standard deviation if they weren't provided
      const metrics = calculator.getMetrics()
      setParams(prev => ({
        ...prev,
        averageDailySales: metrics.averageDemand,
        demandStdDev: metrics.demandStdDev
      }))
      
    } catch (error) {
      console.error("Error calculating thresholds:", error)
      setError("Error calculating thresholds")
    }
  }

  return (
    <InventoryContext.Provider 
      value={{
        data,
        params,
        thresholds,
        chartData,
        ordersData,
        error,
        setData,
        setParams,
        setThresholds,
        setChartData,
        setOrdersData,
        setError,
        resetData,
        calculateThresholds
      }}
    >
      {children}
    </InventoryContext.Provider>
  )
}

export function useInventory() {
  const context = useContext(InventoryContext)
  if (context === undefined) {
    throw new Error("useInventory must be used within an InventoryProvider")
  }
  return context
} 