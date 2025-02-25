import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { ChartCard, ChartContainer, ChartHeader } from "@/components/ui/chart";
import { CardTitle, CardDescription } from "@/components/ui/card";
import { useMemo } from "react";
import { averageTimeSeriesData } from "@/lib/utils";
import { chartConfig } from "@/lib/chart-config";

interface StockToSalesRatioChartProps {
  data: any[];
  inventoryData: any[];
}

export function StockToSalesRatioChart({
  data,
  inventoryData,
}: StockToSalesRatioChartProps) {
  // Process data to calculate stock-to-sales ratio for each date
  const processedData = useMemo(() => {
    if (!data || !inventoryData || data.length === 0 || inventoryData.length === 0) {
      return [];
    }
    
    // Create a map of dates to inventory levels
    const inventoryByDate = new Map();
    inventoryData.forEach(item => {
      inventoryByDate.set(item.date, Number(item.inventory_level));
    });
    
    // Calculate stock-to-sales ratio for each date with order data
    const ratioData = data.map(item => {
      const orders = Number(item.orders);
      const inventoryLevel = inventoryByDate.get(item.date) || 0;
      
      // Avoid division by zero
      const ratio = orders > 0 ? inventoryLevel / orders : inventoryLevel;
      
      return {
        date: item.date,
        orders,
        inventoryLevel,
        ratio: Number.isFinite(ratio) ? ratio : 0,
      };
    }).filter(item => item.date && item.inventoryLevel > 0);
    
    // Sort by date
    ratioData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    // Apply averaging if there are too many data points
    return averageTimeSeriesData(ratioData, 'date', chartConfig.maxTimeSeriesPoints);
  }, [data, inventoryData]);

  // Calculate average ratio for reference line
  const averageRatio = useMemo(() => {
    if (!processedData || processedData.length === 0) return 0;
    
    const sum = processedData.reduce((acc, item) => acc + item.ratio, 0);
    return sum / processedData.length;
  }, [processedData]);

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background/95 border rounded-lg shadow-lg p-3">
          <p className="font-medium">{new Date(label).toLocaleDateString()}</p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-1">
            <p className="text-sm">Stock-to-Sales Ratio:</p>
            <p className="text-sm font-medium">
              {payload[0].value.toFixed(2)}
            </p>
            
            <p className="text-sm">Inventory Level:</p>
            <p className="text-sm font-medium">
              {payload[1].payload.inventoryLevel.toFixed(0)} units
            </p>
            
            <p className="text-sm">Orders:</p>
            <p className="text-sm font-medium">
              {payload[1].payload.orders.toFixed(0)} units
            </p>
          </div>
        </div>
      );
    }
    
    return null;
  };

  // Helper function to determine the status based on the ratio
  const getRatioStatus = (ratio: number) => {
    if (ratio <= 1) return "Critical - Risk of stockout";
    if (ratio <= 2) return "Low - Need to reorder";
    if (ratio <= 4) return "Healthy - Optimal balance";
    return "High - Potential overstocking";
  };

  return (
    <ChartCard>
      <ChartHeader>
        <CardTitle>Stock-to-Sales Ratio</CardTitle>
        <CardDescription>
          Relationship between inventory levels and sales volume
        </CardDescription>
      </ChartHeader>
      
      <ChartContainer className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={processedData}
            margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="date" 
              tickFormatter={(date) => new Date(date).toLocaleDateString()}
            />
            <YAxis 
              yAxisId="left"
              label={{ value: 'Stock-to-Sales Ratio', angle: -90, position: 'insideLeft' }}
              domain={[0, 'dataMax + 1']}
              tickFormatter={(value) => value.toFixed(1)}
            />
            <YAxis 
              yAxisId="right"
              orientation="right"
              label={{ value: 'Units', angle: 90, position: 'insideRight' }}
              domain={[0, 'dataMax + 10']}
              tickFormatter={(value) => value.toFixed(0)}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            
            {/* Average ratio reference line */}
            <ReferenceLine 
              y={averageRatio} 
              yAxisId="left"
              label={{ 
                value: 'Avg Ratio', 
                position: 'insideTopRight',
              }}
              stroke="hsl(var(--primary))"
              strokeDasharray="3 3"
            />
            
            {/* Ratio line */}
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="ratio"
              name="Stock-to-Sales Ratio"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={{ r: 1 }}
              activeDot={{ r: 5 }}
            />
            
            {/* Inventory level bar */}
            <Bar
              yAxisId="right"
              dataKey="inventoryLevel"
              name="Inventory Level"
              fill="hsl(var(--muted-foreground)/0.5)"
              radius={[4, 4, 0, 0]}
              barSize={20}
            />
            
            {/* Orders line */}
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="orders"
              name="Orders"
              stroke="hsl(var(--destructive))"
              dot={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </ChartContainer>
    </ChartCard>
  );
} 