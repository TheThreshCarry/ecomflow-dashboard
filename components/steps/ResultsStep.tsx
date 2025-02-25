import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ThresholdSummary } from "@/components/dashboard/ThresholdSummary"
import { ParameterAdjustment } from "@/components/dashboard/ParameterAdjustment"
import { OrdersChart } from "@/components/charts/OrdersChart"
import { InventoryChart } from "@/components/charts/InventoryChart"
import { useMemo } from "react"
import { ThresholdParams, Thresholds } from "@/lib/types"

interface ResultsStepProps {
  params: ThresholdParams;
  thresholds: Thresholds;
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
  // Get the current inventory level from the most recent data point
  const currentInventoryLevel = useMemo(() => {
    if (chartData && chartData.length > 0) {
      // Sort the data by date to get the most recent entry
      const sortedData = [...chartData].sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      // Return the inventory level of the most recent entry
      return sortedData[0].inventory_level;
    }
    return undefined;
  }, [chartData]);
  
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
            <ThresholdSummary 
              thresholds={thresholds} 
              currentLevel={currentInventoryLevel} 
            />
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