import type { InventoryData } from "./schemas";

export type ThresholdData = InventoryData & {
  lead_time_demand: number;
  safety_stock: number;
  reorder_point: number;
  low_threshold: number;
  medium_threshold: number;
  high_threshold: number;
};

export class InventoryThresholdCalculator {
  private data: InventoryData[];
  private leadTime: number;
  private safetyStockPercentage: number;
  private avgDailySales: number;
  private demandStdDev: number;
  private zScore: number;

  constructor(
    data: InventoryData[],
    leadTime: number,
    safetyStockPercentage: number,
    avgDailySales: number = 0,
    demandStdDev: number = 0,
    zScore: number = 1.64
  ) {
    this.data = data;
    this.leadTime = leadTime;
    this.safetyStockPercentage = safetyStockPercentage;
    this.zScore = zScore;
    
    // Calculate metrics if not provided
    if (avgDailySales === 0 || demandStdDev === 0) {
      const metrics = this.calculateMetrics();
      this.avgDailySales = metrics.avgDemand;
      this.demandStdDev = metrics.demandStdDev;
    } else {
      this.avgDailySales = avgDailySales;
      this.demandStdDev = demandStdDev;
    }
  }

  private calculateMetrics() {
    // Calculate average daily demand and standard deviation
    const orders = this.data.map(item => item.orders);
    const sum = orders.reduce((acc, value) => acc + value, 0);
    const avgDemand = sum / orders.length;
    
    // Calculate standard deviation
    const squaredDifferences = orders.map(value => {
      const diff = value - avgDemand;
      return diff * diff;
    });
    const avgSquaredDiff = squaredDifferences.reduce((acc, value) => acc + value, 0) / orders.length;
    const demandStdDev = Math.sqrt(avgSquaredDiff);

    return {
      avgDemand,
      demandStdDev,
      serviceLevel: 0.95, // Corresponds to zScore of 1.64
      stockoutRisk: 0.05
    };
  }

  private calculateLeadTimeDemand(): number {
    return this.avgDailySales * this.leadTime;
  }

  private calculateSafetyStock(): number {
    // Calculate standard safety stock
    const baseStock = this.zScore * this.demandStdDev * Math.sqrt(this.leadTime);
    
    // Apply safety stock percentage adjustment
    // The higher the percentage, the more safety stock will be added
    const safetySockAdjustment = (this.safetyStockPercentage / 100);
    
    // Return the adjusted safety stock
    return baseStock * (1 + safetySockAdjustment);
  }

  private calculateReorderPoint(leadTimeDemand: number, safetyStock: number): number {
    return leadTimeDemand + safetyStock;
  }

  public calculateThresholds(): ThresholdData[] {
    return this.data.map((product) => {
      const leadTimeDemand = this.calculateLeadTimeDemand();
      const safetyStock = this.calculateSafetyStock();
      const reorderPoint = this.calculateReorderPoint(leadTimeDemand, safetyStock);

      const lowThreshold = reorderPoint;
      const mediumThreshold = lowThreshold + 0.1 * lowThreshold; // 10% buffer above low threshold
      const highThreshold = lowThreshold + 0.2 * lowThreshold; // 20% buffer above low threshold

      return {
        ...product,
        lead_time_demand: leadTimeDemand,
        safety_stock: safetyStock,
        reorder_point: reorderPoint,
        low_threshold: lowThreshold,
        medium_threshold: mediumThreshold,
        high_threshold: highThreshold,
      };
    });
  }

  public getThresholdData(): ThresholdData[] {
    return this.calculateThresholds();
  }
  
  public getThresholdLevels() {
    const leadTimeDemand = this.calculateLeadTimeDemand();
    const safetyStock = this.calculateSafetyStock();
    const reorderPoint = this.calculateReorderPoint(leadTimeDemand, safetyStock);

    const lowThreshold = reorderPoint;
    const mediumThreshold = lowThreshold + 0.1 * lowThreshold; // 10% buffer above low threshold
    const highThreshold = lowThreshold + 0.2 * lowThreshold; // 20% buffer above low threshold
    
    return {
      leadTimeDemand,
      safetyStock,
      reorderPoint,
      low: lowThreshold,
      medium: mediumThreshold,
      high: highThreshold
    };
  }
  
  // Helper method to format chart data with threshold zones
  public getChartData() {
    const thresholds = this.getThresholdLevels();
    
    return this.data.map(item => {
      return {
        ...item,
        date: item.date,
        inventory_level: item.inventory_level,
        lowThreshold: thresholds.low,
        mediumThreshold: thresholds.medium,
        highThreshold: thresholds.high,
        dangerZone: item.inventory_level < thresholds.low,
        warningZone: item.inventory_level >= thresholds.low && item.inventory_level < thresholds.medium,
        cautionZone: item.inventory_level >= thresholds.medium && item.inventory_level < thresholds.high
      };
    });
  }
  
  public getMetrics() {
    return {
      averageDemand: this.avgDailySales,
      demandStdDev: this.demandStdDev,
      serviceLevel: this.getServiceLevelFromZScore(this.zScore),
      stockoutRisk: 1 - this.getServiceLevelFromZScore(this.zScore)
    };
  }
  
  private getServiceLevelFromZScore(zScore: number): number {
    // This is a simplified mapping of z-scores to service levels
    // For a more accurate calculation, you would use a normal distribution function
    if (zScore === 1.28) return 0.90;
    if (zScore === 1.64) return 0.95;
    if (zScore === 1.96) return 0.975;
    if (zScore === 2.33) return 0.99;
    if (zScore === 2.58) return 0.995;
    return 0.95; // Default to 95% service level
  }
} 