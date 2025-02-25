import {
  ComposedChart,
  Line,
  Area,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import { ChartCard, ChartContainer, ChartHeader } from "@/components/ui/chart";
import { CardTitle, CardDescription } from "@/components/ui/card";
import { useState, useMemo } from "react";
import { useTheme } from "next-themes";
import { averageTimeSeriesData } from "@/lib/utils";
import { chartConfig } from "@/lib/chart-config";
import { Thresholds } from "@/lib/types";

interface InventoryChartProps {
  data: any[];
  getBarColor: (leadTime: number) => string;
  getLeadTimeColor: (leadTime: number) => string;
}

export function InventoryChart({
  data,
  getBarColor,
  getLeadTimeColor,
}: InventoryChartProps) {
  const isDarkMode = useTheme().theme === "dark";

  // Process data to include lead time background values and average if too many points
  const processedData = useMemo(() => {
    if (!data || data.length === 0) return [];

    // First, categorize lead times into our defined ranges
    const categorizedData = data.map((item) => {
      const leadTime = item.lead_time_days;
      let category = "";

      if (leadTime <= 2) category = "fast"; // 0-2 days (fast)
      else if (leadTime <= 5) category = "standard"; // 3-5 days (standard)
      else if (leadTime <= 10) category = "slow"; // 6-10 days (slow)
      else category = "verySlow"; // >10 days (very slow)

      return {
        ...item,
        leadTimeCategory: category,
      };
    });

    // Calculate the max inventory value for chart scaling
    const maxInventory =
      Math.max(...data.map((item) => item.inventory_level)) * 1.1;

    // For each data point, add properties for lead time area charts
    const preparedData = categorizedData.map((item) => {
      return {
        ...item,
        // Set inventory value for each lead time category
        // Only one of these will be set, allowing us to stack them
        fastLeadTime: item.leadTimeCategory === "fast" ? maxInventory : 0,
        standardLeadTime:
          item.leadTimeCategory === "standard" ? maxInventory : 0,
        slowLeadTime: item.leadTimeCategory === "slow" ? maxInventory : 0,
        verySlowLeadTime:
          item.leadTimeCategory === "verySlow" ? maxInventory : 0,
      };
    });
    
    // Apply averaging if there are too many data points
    const averaged = averageTimeSeriesData(preparedData, 'date', chartConfig.maxTimeSeriesPoints);
    
    // Format numeric values to integers if they have no decimal part
    return averaged.map(item => {
      const formattedItem = { ...item };
      
      // Format numeric fields to integers if they don't have decimal parts
      Object.keys(item).forEach(key => {
        if (typeof item[key] === 'number') {
          // Check if the number has a decimal part
          formattedItem[key] = Number.isInteger(item[key]) ? 
            item[key] : // Keep as number, no need to convert
            parseFloat(item[key].toFixed(1));
        }
      });
      
      return formattedItem;
    });
  }, [data]);

  const InventoryTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      const leadTime = item.lead_time_days;
      return (
        <div className="bg-background/95 border rounded-lg shadow-lg p-3">
          <p className="font-medium">{new Date(label).toLocaleDateString()}</p>
          <p className="text-primary">
            Inventory: {Number(item.inventory_level).toFixed(0)}
          </p>
          <p className="font-medium" style={{ color: getBarColor(leadTime) }}>
            Lead Time: {leadTime} days
            {leadTime <= 2
              ? " (Fast)"
              : leadTime <= 5
              ? " (Standard)"
              : leadTime <= 10
              ? " (Slow)"
              : " (Very slow)"}
          </p>
          {item.dangerZone && (
            <p className="text-destructive font-medium">Below Low Threshold!</p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <ChartCard>
      <ChartHeader>
        <div>
          <CardTitle>Inventory</CardTitle>
          <CardDescription>
            Inventory levels with background color representing thresholds
          </CardDescription>
        </div>
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
              domain={[
                Math.min(...data.map((d) => d.inventory_level)) * 0.9,
                Math.max(...data.map((d) => d.inventory_level)) * 1.1,
              ]}
              label={{
                value: "Inventory Level",
                angle: -90,
                position: "insideLeft",
              }}
              tickFormatter={(value) => Number(value).toFixed(0)}
            />
            <Tooltip content={<InventoryTooltip />} />
            <Legend />

            {/* Threshold zones as stacked areas */}
            <>
              <Area
                type="monotone"
                name="Low Zone"
                dataKey="lowThreshold"
                fill="hsl(var(--destructive))" // Red for low threshold zone
                fillOpacity={isDarkMode ? 0.1 : 0.3}
                stroke="none"
                stackId="1"
              />
              <Area
                type="monotone"
                name="Medium Zone"
                dataKey={(datum) =>
                  datum.mediumThreshold - datum.lowThreshold
                }
                fill="hsl(var(--warning))" // Yellow for medium threshold zone
                fillOpacity={isDarkMode ? 0.1 : 0.3}
                stroke="none"
                stackId="1"
              />
              <Area
                type="monotone"
                name="High Zone"
                // Modified to always go to max value
                dataKey={(datum) => {
                  const maxValue = Math.max(...data.map(d => d.inventory_level)) * 1.1;
                  return maxValue - datum.mediumThreshold;
                }}
                fill="hsl(var(--success))" // Green for high threshold zone
                fillOpacity={isDarkMode ? 0.1 : 0.3}
                stroke="none"
                stackId="1"
              />
            </>

            {/* Inventory line */}
            <Line
              type="monotone"
              name="Inventory Level"
              dataKey="inventory_level"
              stroke="hsl(var(--foreground))"
              strokeWidth={3}
              dot={true}
              activeDot={{ r: 6 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </ChartContainer>
    </ChartCard>
  );
}
