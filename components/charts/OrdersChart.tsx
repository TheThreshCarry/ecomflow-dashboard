import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from "recharts"
import { ChartCard, ChartContainer, ChartHeader } from "@/components/ui/chart"
import { CardTitle, CardDescription } from "@/components/ui/card"
import { useTheme } from "next-themes";
import { averageTimeSeriesData } from "@/lib/utils";
import { chartConfig } from "@/lib/chart-config";
import React, { useMemo } from "react";

interface OrdersChartProps {
  data: any[];
  getBarColor: (leadTime: number) => string;
  defaultLeadTime: number;
}

export function OrdersChart({ data, getBarColor, defaultLeadTime }: OrdersChartProps) {
  const theme = useTheme();

  // Process data to ensure orders are numbers, not strings with leading zeros
  // And average out data points if there are too many
  const processedData = useMemo(() => {
    // First process the raw data to ensure orders are numbers
    const normalizedData = data.map(item => ({
      ...item,
      orders: Number(item.orders)
    }));
    
    // Then apply averaging if there are too many data points
    return averageTimeSeriesData(normalizedData, 'date', chartConfig.maxTimeSeriesPoints);
  }, [data]);

  const OrdersTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const leadTimeDays = payload[0].payload.lead_time_days;
      const color =
        leadTimeDays <= 2
          ? "green"
          : leadTimeDays <= 5
          ? "yellow"
          : leadTimeDays <= 10
          ? "orange"
          : "red";
      return (
        <div className="bg-background/95 border rounded-lg shadow-lg p-3">
          <p className="font-medium">{new Date(label).toLocaleDateString()}</p>
          <p className="font-medium">
            Orders: {Number(payload[0].value).toFixed(0)}
          </p>
          {leadTimeDays && (
            <div>
              <p className="text-muted-foreground">
                Lead Time: {leadTimeDays} days
              </p>
              <div
                className="mt-1 h-2 w-full rounded-full"
                style={{
                  backgroundColor: color,
                  opacity: 0.7,
                }}
              />
              <p className="text-xs mt-1" style={{ color: color }}>
                {leadTimeDays <= 2
                  ? "Fast delivery"
                  : leadTimeDays <= 5
                  ? "Standard delivery"
                  : leadTimeDays <= 10
                  ? "Slower delivery"
                  : "Very slow delivery"}
              </p>
            </div>
          )}
        </div>
      );
    }
    return null
  }

  return (
    <ChartCard>
      <ChartHeader>
        <CardTitle>Daily Orders</CardTitle>
        <CardDescription>Order volume by day with color-coded lead times</CardDescription>
      </ChartHeader>
      <ChartContainer className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={processedData} 
            margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="date" 
              tickFormatter={(date) => new Date(date).toLocaleDateString()} 
            />
            <YAxis 
              domain={[0, Math.max(...processedData.map((d) => d.orders)) * 1.1]}
              label={{ value: 'Orders', angle: -90, position: 'insideLeft' }}
              tickFormatter={(value) => Number(value).toFixed(0)}
            />
            <Tooltip content={<OrdersTooltip />} />
            <Bar 
              dataKey="orders"
              radius={[4, 4, 0, 0]}
            >
              {processedData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`}
                  fill={theme.theme === "dark" ? "white": "black"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
    </ChartCard>
  )
} 