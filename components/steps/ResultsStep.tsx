import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ThresholdSummary } from "@/components/dashboard/ThresholdSummary"
import { ParameterAdjustment } from "@/components/dashboard/ParameterAdjustment"
import { OrdersChart } from "@/components/charts/OrdersChart"
import { InventoryChart } from "@/components/charts/InventoryChart"
import { InventoryAlgorithm } from "@/lib/algorithm"

interface ThresholdParams {
  leadTime: number;
  safetyStock: number;
  averageDailySales: number;
}

interface ResultsStepProps {
  params: ThresholdParams;
  thresholds: {
    low: number;
    medium: number;
    high: number;
  };
  chartData: any[];
  ordersData: any[];
  onParamChange: (key: keyof ThresholdParams, value: number) => void;
  exportThresholds: () => void;
  getBarColor: (leadTime: number) => string;
  getLeadTimeColor: (leadTime: number) => string;
}

export function ResultsStep({ 
  params, 
  thresholds, 
  chartData, 
  ordersData,
  onParamChange,
  exportThresholds,
  getBarColor,
  getLeadTimeColor
}: ResultsStepProps) {
  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Analysis Results</h2>
        <div className="space-x-2">
          <Button onClick={exportThresholds}>
            Export Thresholds
          </Button>
        </div>
      </div>
      
      {/* Summary Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Threshold Summary</CardTitle>
          <CardDescription>Calculated inventory thresholds based on your data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ThresholdSummary thresholds={thresholds} />
            <ParameterAdjustment params={params} onParamChange={onParamChange} />
          </div>
        </CardContent>
      </Card>
      
      {/* Chart Row - 2 columns on desktop, 1 column on mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <OrdersChart 
          data={ordersData} 
          getBarColor={getBarColor} 
          defaultLeadTime={params.leadTime} 
        />
        <InventoryChart 
          data={chartData} 
          getBarColor={getBarColor}
          getLeadTimeColor={getLeadTimeColor}
        />
      </div>
    </>
  )
} 