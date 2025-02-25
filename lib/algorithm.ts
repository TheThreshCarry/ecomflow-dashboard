interface ThresholdLevels {
  low: number
  medium: number
  high: number
}

interface StockoutZone {
  startDate: string
  endDate: string
  level: "low" | "medium" | "high"
  inventoryLevel: number
  threshold: number
}

interface InventoryMetrics {
  averageDemand: number
  demandStdDev: number
  serviceLevel: number
  stockoutRisk: number
}

export class InventoryAlgorithm {
  private static readonly SERVICE_LEVEL_FACTOR = 1.645 // 95% service level (z-score)
  private static readonly SAFETY_STOCK_MULTIPLIER = 1.5

  static calculateMetrics(data: any[]): InventoryMetrics {
    // Calculate average daily demand
    const demands = data.map((row) => row.orders)
    const averageDemand = demands.reduce((sum, val) => sum + val, 0) / demands.length

    // Calculate standard deviation of demand
    const squaredDiffs = demands.map((value) => Math.pow(value - averageDemand, 2))
    const demandStdDev = Math.sqrt(squaredDiffs.reduce((sum, val) => sum + val, 0) / demands.length)

    // Calculate stockout risk based on current inventory levels vs demand
    const inventoryLevels = data.map((row) => row.inventory_level)
    const stockoutRisk = inventoryLevels.filter((level) => level < averageDemand).length / inventoryLevels.length

    return {
      averageDemand,
      demandStdDev,
      serviceLevel: 0.95, // 95% service level
      stockoutRisk,
    }
  }

  static calculateThresholds(data: any[], leadTime: number, safetyStockPercentage: number): ThresholdLevels {
    const metrics = this.calculateMetrics(data)

    // Calculate base stock level using demand during lead time
    const leadTimeDemand = metrics.averageDemand * leadTime

    // Calculate safety stock using statistical approach
    const safetyStock =
      this.SERVICE_LEVEL_FACTOR * Math.sqrt(leadTime) * metrics.demandStdDev * (safetyStockPercentage / 100)

    // Calculate threshold levels
    const baseStock = leadTimeDemand
    const mediumThreshold = baseStock + safetyStock / 2
    const highThreshold = baseStock + safetyStock

    return {
      low: Math.round(baseStock),
      medium: Math.round(mediumThreshold),
      high: Math.round(highThreshold),
    }
  }

  static identifyStockoutZones(data: any[], thresholds: ThresholdLevels): StockoutZone[] {
    const zones: StockoutZone[] = []
    let currentZone: StockoutZone | null = null

    // Sort data chronologically
    const sortedData = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    sortedData.forEach((row, index) => {
      const level = row.inventory_level
      let thresholdBreached: "low" | "medium" | "high" | null = null

      if (level <= thresholds.low) {
        thresholdBreached = "low"
      } else if (level <= thresholds.medium) {
        thresholdBreached = "medium"
      } else if (level <= thresholds.high) {
        thresholdBreached = "high"
      }

      if (thresholdBreached) {
        if (!currentZone || currentZone.level !== thresholdBreached) {
          // Start new zone
          if (currentZone) {
            zones.push(currentZone)
          }
          currentZone = {
            startDate: row.date,
            endDate: row.date,
            level: thresholdBreached,
            inventoryLevel: level,
            threshold: thresholds[thresholdBreached],
          }
        } else {
          // Update end date of current zone
          currentZone.endDate = row.date
          currentZone.inventoryLevel = Math.min(currentZone.inventoryLevel, level)
        }
      } else if (currentZone) {
        // End current zone
        zones.push(currentZone)
        currentZone = null
      }
    })

    // Add final zone if exists
    if (currentZone) {
      zones.push(currentZone)
    }

    return zones
  }

  static getChartData(data: any[], thresholds: ThresholdLevels) {
    // Sort data chronologically
    const sortedData = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    // Add threshold information to each data point
    return sortedData.map((row) => ({
      ...row,
      lowThreshold: thresholds.low,
      mediumThreshold: thresholds.medium,
      highThreshold: thresholds.high,
      // Add danger zone indicators
      dangerZone: row.inventory_level <= thresholds.low,
      warningZone: row.inventory_level <= thresholds.medium && row.inventory_level > thresholds.low,
      cautionZone: row.inventory_level <= thresholds.high && row.inventory_level > thresholds.medium,
    }))
  }
}

