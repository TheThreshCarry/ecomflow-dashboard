import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ThresholdSummary } from "@/components/dashboard/ThresholdSummary"
import { ParameterAdjustment } from "@/components/dashboard/ParameterAdjustment"
import { OrdersChart } from "@/components/charts/OrdersChart"
import { InventoryChart } from "@/components/charts/InventoryChart"
import { ProductOrdersPieChart } from "@/components/charts/ProductOrdersPieChart"
import { ProductOrdersBarChart } from "@/components/charts/ProductOrdersBarChart"
import { MetricCard } from "@/components/dashboard/MetricCard"
import { useMemo, useState, useEffect } from "react"
import { ThresholdParams, Thresholds } from "@/lib/types"
import { Package, ShoppingCart, Truck, Clock, ChevronDown, ChevronUp } from "lucide-react"
import { DateRangePicker } from "@/components/ui/date-range-picker"
import { DateRange } from "react-day-picker"
import { startOfDay, subDays, endOfDay } from "date-fns"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

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
  // Get the date range bounds from the data
  const { minDate, maxDate } = useMemo(() => {
    if (!chartData || chartData.length === 0) {
      return { minDate: undefined, maxDate: undefined };
    }

    const dates = chartData.map(item => new Date(item.date));
    return {
      minDate: new Date(Math.min(...dates.map(d => d.getTime()))),
      maxDate: new Date(Math.max(...dates.map(d => d.getTime()))),
    };
  }, [chartData]);

  // Initialize date range to last 7 days by default
  const [dateRange, setDateRange] = useState<DateRange | undefined>(() => {
    if (maxDate) {
      return {
        from: startOfDay(subDays(maxDate, 7)),
        to: endOfDay(maxDate)
      };
    }
    return undefined;
  });

  // Add state for threshold summary collapsible
  const [showThresholdSummary, setShowThresholdSummary] = useState(true);

  // Filter data based on the selected date range
  const filteredChartData = useMemo(() => {
    if (!dateRange?.from || !chartData) return chartData;
    
    return chartData.filter(item => {
      const itemDate = new Date(item.date);
      const isAfterFrom = dateRange.from ? itemDate >= dateRange.from : true;
      const isBeforeTo = dateRange.to ? itemDate <= dateRange.to : true;
      return isAfterFrom && isBeforeTo;
    });
  }, [chartData, dateRange]);

  const filteredOrdersData = useMemo(() => {
    if (!dateRange?.from || !ordersData) return ordersData;
    
    return ordersData.filter(item => {
      const itemDate = new Date(item.date);
      const isAfterFrom = dateRange.from ? itemDate >= dateRange.from : true;
      const isBeforeTo = dateRange.to ? itemDate <= dateRange.to : true;
      return isAfterFrom && isBeforeTo;
    });
  }, [ordersData, dateRange]);
  
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

  // Calculate the period in days for metrics
  const periodDays = useMemo(() => {
    if (!dateRange?.from || !dateRange?.to) return 7;
    const diffTime = Math.abs(dateRange.to.getTime() - dateRange.from.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }, [dateRange]);
  
  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Analysis Results</h2>
        <div className="flex items-center gap-4">
          <DateRangePicker
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
            minDate={minDate}
            maxDate={maxDate}
          />
          <Button onClick={exportThresholds}>
            Export Thresholds
          </Button>
        </div>
      </div>
      
      {/* Collapsible Summary Card */}
      <Collapsible open={showThresholdSummary} className="mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Threshold Summary</CardTitle>
              <CardDescription>Calculated inventory thresholds based on your data</CardDescription>
            </div>
            <CollapsibleTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-1"
                onClick={() => setShowThresholdSummary(!showThresholdSummary)}
              >
                {showThresholdSummary ? (
                  <>Hide Details <ChevronUp className="h-4 w-4" /></>
                ) : (
                  <>Show Details <ChevronDown className="h-4 w-4" /></>
                )}
              </Button>
            </CollapsibleTrigger>
          </CardHeader>
          <CollapsibleContent>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ThresholdSummary 
                  thresholds={thresholds} 
                  currentLevel={currentInventoryLevel} 
                />
                <ParameterAdjustment params={params} onParamChange={onParamChange} />
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
      
      {/* Key Metrics */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold">Key Metrics</h3>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <MetricCard
          title="Average Daily Orders"
          icon={<ShoppingCart size={18} />}
          data={ordersData}
          valueExtractor={(item) => Number(item.orders)}
          formatValue={(value) => value.toFixed(1)}
          period={periodDays.toString()}
        />
        <MetricCard
          title="Average Inventory"
          icon={<Package size={18} />}
          data={chartData}
          valueExtractor={(item) => Number(item.inventory_level)}
          formatValue={(value) => value.toFixed(1)}
          period={periodDays.toString()}
        />
        <MetricCard
          title="Lead Time (Days)"
          icon={<Truck size={18} />}
          data={ordersData}
          valueExtractor={(item) => Number(item.lead_time_days || 0)}
          formatValue={(value) => value.toFixed(1)}
          period={periodDays.toString()}
        />
        <MetricCard
          title="Order Fulfillment"
          icon={<Clock size={18} />}
          data={chartData.map((item, index) => {
            const matchingOrderData = ordersData.find(
              orderItem => orderItem.date === item.date
            );
            return {
              ...item,
              order_fulfilled: matchingOrderData ? 
                Number(item.inventory_level) >= Number(matchingOrderData.orders) : true
            };
          })}
          valueExtractor={(item) => item.order_fulfilled ? 100 : 0}
          formatValue={(value) => `${value.toFixed(0)}%`}
          period={periodDays.toString()}
        />
      </div>
      
      {/* Charts Section Title */}
      <h3 className="text-xl font-semibold mb-4">Performance Analytics</h3>
      
      {/* Chart Row - 2 columns on desktop, 1 column on mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <OrdersChart 
          data={filteredOrdersData} 
          getBarColor={getBarColor} 
          defaultLeadTime={params.leadTime} 
        />
        <InventoryChart 
          data={filteredChartData} 
          getBarColor={getBarColor}
          getLeadTimeColor={getLeadTimeColor}
        />
      </div>
      
      {/* Product Analysis Row */}
      <h3 className="text-xl font-semibold mb-4">Product Analysis</h3>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <ProductOrdersPieChart data={filteredOrdersData} />
        <ProductOrdersBarChart data={filteredOrdersData} />
      </div>
    </>
  )
} 