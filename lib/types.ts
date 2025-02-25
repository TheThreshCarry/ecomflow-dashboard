import type { InventoryData } from "./schemas"

export interface ThresholdParams {
  leadTime: number;
  safetyStock: number;
  averageDailySales: number;
  demandStdDev: number;
  zScore: number;
}

export interface Thresholds {
  low: number;
  medium: number;
  high: number;
  leadTimeDemand: number;
  safetyStock: number;
  reorderPoint: number;
}

export type WizardStep = 'welcome' | 'upload' | 'configure' | 'results'; 