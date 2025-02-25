import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from "recharts"
import { ChartCard, ChartContainer, ChartHeader } from "@/components/ui/chart"
import { CardTitle, CardDescription } from "@/components/ui/card"

interface OrdersChartProps {
  data: any[];
  getBarColor: (leadTime: number) => string;
  defaultLeadTime: number;
}

export function OrdersChart({ data, getBarColor, defaultLeadTime }: OrdersChartProps) {
  const OrdersTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const leadTimeDays = payload[0].payload.lead_time_days;
      return (
        <div className="bg-background/95 border rounded-lg shadow-lg p-3">
          <p className="font-medium">{new Date(label).toLocaleDateString()}</p>
          <p className="text-primary">Orders: {payload[0].value}</p>
          {leadTimeDays && (
            <div>
              <p className="text-muted-foreground">Lead Time: {leadTimeDays} days</p>
              <div 
                className="mt-1 h-2 w-full rounded-full" 
                style={{ 
                  backgroundColor: getBarColor(leadTimeDays),
                  opacity: 0.7
                }}
              />
              <p className="text-xs mt-1" style={{ color: getBarColor(leadTimeDays) }}>
                {leadTimeDays <= 2 ? "Fast delivery" : 
                 leadTimeDays <= 5 ? "Standard delivery" : 
                 leadTimeDays <= 10 ? "Slower delivery" : 
                 "Very slow delivery"}
              </p>
            </div>
          )}
        </div>
      )
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
            data={data} 
            margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="date" 
              tickFormatter={(date) => new Date(date).toLocaleDateString()} 
            />
            <YAxis 
              domain={[0, Math.max(...data.map((d) => d.orders)) * 1.1]}
              label={{ value: 'Orders', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip content={<OrdersTooltip />} />
            <Bar 
              dataKey="orders"
              fill={getBarColor(defaultLeadTime)}
              radius={[4, 4, 0, 0]}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`}
                  fill={getBarColor(entry.lead_time_days)}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
    </ChartCard>
  )
} 