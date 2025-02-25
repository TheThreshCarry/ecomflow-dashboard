import { LineChart, Line, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"
import { ChartCard, ChartContainer, ChartHeader } from "@/components/ui/chart"
import { CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useState } from "react"

interface InventoryChartProps {
  data: any[];
  getBarColor: (leadTime: number) => string;
  getLeadTimeColor: (leadTime: number) => string;
}

export function InventoryChart({ data, getBarColor, getLeadTimeColor }: InventoryChartProps) {
  const [showLeadTimeBackground, setShowLeadTimeBackground] = useState(true)

  const InventoryTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      const leadTime = item.lead_time_days;
      return (
        <div className="bg-background/95 border rounded-lg shadow-lg p-3">
          <p className="font-medium">{new Date(label).toLocaleDateString()}</p>
          <p className="text-primary">Inventory: {item.inventory_level}</p>
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
          <CardTitle>Inventory with Lead Time Indicators</CardTitle>
          <CardDescription>Inventory levels with background color representing lead time values</CardDescription>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setShowLeadTimeBackground(!showLeadTimeBackground)}
          className="flex items-center gap-1"
        >
          {showLeadTimeBackground ? "Hide" : "Show"} Lead Time Backgrounds
        </Button>
      </ChartHeader>
      <ChartContainer className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart 
            data={data} 
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
                Math.max(...data.map((d) => d.inventory_level)) * 1.1
              ]}
              label={{ value: 'Inventory Level', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip content={<InventoryTooltip />} />
            
            {/* Threshold zones */}
            <Area
              type="monotone"
              dataKey="lowThreshold"
              fill="rgba(255, 0, 0, 0.1)" // Red for low threshold zone
              fillOpacity={0.8}
              stroke="none"
            />
            <Area
              type="monotone"
              dataKey="mediumThreshold"
              fill="rgba(255, 200, 0, 0.1)" // Yellow for medium threshold zone
              fillOpacity={0.6}
              stroke="none"
            />
            
            {/* Background rectangles for lead time visualization */}
            {showLeadTimeBackground && data.map((entry, index) => {
              // Only render if we have a next data point
              if (index < data.length - 1) {
                const startX = index / (data.length - 1) * 100; // Convert to percentage
                const width = 1 / (data.length - 1) * 100; // Width as percentage
                
                return (
                  <rect
                    key={`rect-${index}`}
                    x={`${startX}%`}
                    y="0%"
                    width={`${width}%`}
                    height="100%"
                    fill={getLeadTimeColor(entry.lead_time_days)}
                  />
                );
              }
              return null;
            })}
            
            {/* Inventory line */}
            <Line
              type="monotone"
              dataKey="inventory_level"
              stroke="hsl(var(--primary))"
              strokeWidth={3}
              dot={true}
            />
            
            {/* Threshold reference lines */}
            <Line
              type="monotone"
              dataKey="lowThreshold"
              stroke="hsl(var(--destructive))"
              strokeDasharray="5 5"
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="mediumThreshold"
              stroke="hsl(var(--warning))"
              strokeDasharray="5 5"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartContainer>
    </ChartCard>
  )
} 