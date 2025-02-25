import { ComposedChart, Line, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from "recharts"
import { ChartCard, ChartContainer, ChartHeader } from "@/components/ui/chart"
import { CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useState, useMemo } from "react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useTheme } from "next-themes"

interface InventoryChartProps {
  data: any[];
  getBarColor: (leadTime: number) => string;
  getLeadTimeColor: (leadTime: number) => string;
}

export function InventoryChart({ data, getBarColor, getLeadTimeColor }: InventoryChartProps) {
  const [showLeadTimeBackground, setShowLeadTimeBackground] = useState(true)
  const isDarkMode = useTheme().theme === "dark"

  // Process data to include lead time background values
  const processedData = useMemo(() => {
    if (!data || data.length === 0) return [];

    // First, categorize lead times into our defined ranges
    const categorizedData = data.map(item => {
      const leadTime = item.lead_time_days;
      let category = "";
      
      if (leadTime <= 2) category = "fast"; // 0-2 days (fast)
      else if (leadTime <= 5) category = "standard"; // 3-5 days (standard)
      else if (leadTime <= 10) category = "slow"; // 6-10 days (slow)
      else category = "verySlow"; // >10 days (very slow)
      
      return {
        ...item,
        leadTimeCategory: category
      };
    });

    // Calculate the max inventory value for chart scaling
    const maxInventory = Math.max(...data.map(item => item.inventory_level)) * 1.1;
    
    // For each data point, add properties for lead time area charts
    return categorizedData.map(item => {
      return {
        ...item,
        // Set inventory value for each lead time category
        // Only one of these will be set, allowing us to stack them
        fastLeadTime: item.leadTimeCategory === "fast" ? maxInventory : 0,
        standardLeadTime: item.leadTimeCategory === "standard" ? maxInventory : 0,
        slowLeadTime: item.leadTimeCategory === "slow" ? maxInventory : 0,
        verySlowLeadTime: item.leadTimeCategory === "verySlow" ? maxInventory : 0,
      };
    });
  }, [data]);

  const InventoryTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      const leadTime = item.lead_time_days;
      return (
        <div className="bg-background/95 border rounded-lg shadow-lg p-3">
          <p className="font-medium">{new Date(label).toLocaleDateString()}</p>
          <p className="text-primary">Inventory: {Number(item.inventory_level).toFixed(0)}</p>
          <p className="font-medium" style={{ color: getBarColor(leadTime) }}>
            Lead Time: {leadTime} days
            {leadTime <= 2 ? " (Fast)" : 
             leadTime <= 5 ? " (Standard)" : 
             leadTime <= 10 ? " (Slow)" : 
             " (Very slow)"}
          </p>
          {item.dangerZone && <p className="text-destructive font-medium">Below Low Threshold!</p>}
        </div>
      );
    }
    return null;
  }

  return (
    <ChartCard>
      <ChartHeader>
        <div>
          <CardTitle>Inventory</CardTitle>
          <CardDescription>
            Inventory levels with background color representing lead time values / thresholds
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Label htmlFor="lead-time-bg-toggle" className="cursor-pointer">
            Show {" "}
            {showLeadTimeBackground ? "Lead Time" : "Thresholds"}
          </Label>
          <Switch
            id="lead-time-bg-toggle"
            checked={showLeadTimeBackground}
            onCheckedChange={setShowLeadTimeBackground}
          />
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
                0,
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

            {/* Lead time backgrounds as area charts */}
            {showLeadTimeBackground && (
              <>
                <Area
                  type="monotone"
                  name="Fast Lead Time (0-2 days)"
                  dataKey="fastLeadTime"
                  fill="rgba(0, 255, 0)" // Green for fast lead time
                  fillOpacity={isDarkMode ? 0.1 : 0.2}
                  stroke="none"
                  stackId="2"
                />
                <Area
                  type="monotone"
                  name="Standard Lead Time (3-5 days)"
                  dataKey="standardLeadTime"
                  fill="rgba(255, 255, 0)" // Yellow for standard lead time
                  fillOpacity={isDarkMode ? 0.1 : 0.2}
                  stroke="none"
                  stackId="2"
                />
                <Area
                  type="monotone"
                  name="Slow Lead Time (6-10 days)"
                  dataKey="slowLeadTime"
                  fill="rgba(255, 165, 0)" // Orange for slow lead time
                  fillOpacity={isDarkMode ? 0.1 : 0.2}
                  stroke="none"
                  stackId="2"
                />
                <Area
                  type="monotone"
                  name="Very Slow Lead Time (>10 days)"
                  dataKey="verySlowLeadTime"
                  fill="rgba(255, 0, 0)" // Red for very slow lead time
                  fillOpacity={isDarkMode ? 0.1 : 0.2}
                  stroke="none"
                  stackId="2"
                />
              </>
            )}

            {/* Threshold zones as stacked areas */}
            {!showLeadTimeBackground && (
              <>
                <Area
                  type="monotone"
                  name="Low Zone"
                  dataKey="lowThreshold"
                  fill="rgba(255, 0, 0)" // Red for low threshold zone
                  fillOpacity={isDarkMode ? 0.1 : 0.2}
                  stroke="none"
                  stackId="1"
                />
                <Area
                  type="monotone"
                  name="Medium Zone"
                  dataKey={(datum) =>
                    datum.mediumThreshold - datum.lowThreshold
                  }
                  fill="rgba(255, 200, 0)" // Yellow for medium threshold zone
                  fillOpacity={isDarkMode ? 0.1 : 0.2}
                  stroke="none"
                  stackId="1"
                />
                <Area
                  type="monotone"
                  name="High Zone"
                  dataKey={(datum) =>
                    datum.highThreshold - datum.mediumThreshold
                  }
                  fill="rgba(0, 255, 0)" // Green for high threshold zone
                  fillOpacity={isDarkMode ? 0.1 : 0.2}
                  stroke="none"
                  stackId="1"
                />
              </>
            )}

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