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
  ErrorBar
} from 'recharts';
import { ChartCard, ChartContainer, ChartHeader } from "@/components/ui/chart";
import { CardTitle, CardDescription } from "@/components/ui/card";
import { useMemo } from "react";
import { averageTimeSeriesData } from "@/lib/utils";
import { chartConfig } from "@/lib/chart-config";

interface LeadTimeVariationChartProps {
  data: any[];
  getLeadTimeColor: (leadTime: number) => string;
}

export function LeadTimeVariationChart({
  data,
  getLeadTimeColor,
}: LeadTimeVariationChartProps) {
  // Process data to calculate lead time statistics by month
  const processedData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    // Group data by month
    const monthlyData: Record<string, number[]> = {};

    data.forEach(item => {
      if (!item.lead_time_days) return;

      const date = new Date(item.date);
      const monthYear = `${date.getFullYear()}-${date.getMonth() + 1}`;
      
      if (!monthlyData[monthYear]) {
        monthlyData[monthYear] = [];
      }
      
      monthlyData[monthYear].push(Number(item.lead_time_days));
    });

    // Calculate statistics for each month
    return Object.entries(monthlyData).map(([monthYear, leadTimes]) => {
      // Calculate mean
      const sum = leadTimes.reduce((acc, val) => acc + val, 0);
      const mean = sum / leadTimes.length;
      
      // Calculate standard deviation
      const squareDiffs = leadTimes.map(value => {
        const diff = value - mean;
        return diff * diff;
      });
      const avgSquareDiff = squareDiffs.reduce((acc, val) => acc + val, 0) / squareDiffs.length;
      const stdDev = Math.sqrt(avgSquareDiff);
      
      // Calculate min and max
      const min = Math.min(...leadTimes);
      const max = Math.max(...leadTimes);
      
      const [year, month] = monthYear.split('-');
      const date = new Date(Number(year), Number(month) - 1, 15);
      
      return {
        date: date.toISOString(),
        month: date.toLocaleString('default', { month: 'short', year: 'numeric' }),
        mean,
        stdDev,
        min,
        max,
        q1: mean - stdDev, // Approximation for quartile 1
        q3: mean + stdDev, // Approximation for quartile 3
      };
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [data]);

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const meanColor = getLeadTimeColor(data.mean);
      
      return (
        <div className="bg-background/95 border rounded-lg shadow-lg p-3">
          <p className="font-medium">{data.month}</p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-1">
            <p className="text-sm">Average:</p>
            <p className="text-sm font-medium" style={{ color: meanColor }}>
              {data.mean.toFixed(1)} days
            </p>
            
            <p className="text-sm">Standard Dev:</p>
            <p className="text-sm font-medium">±{data.stdDev.toFixed(1)} days</p>
            
            <p className="text-sm">Minimum:</p>
            <p className="text-sm font-medium">{data.min.toFixed(1)} days</p>
            
            <p className="text-sm">Maximum:</p>
            <p className="text-sm font-medium">{data.max.toFixed(1)} days</p>
          </div>
        </div>
      );
    }
    
    return null;
  };

  return (
    <ChartCard>
      <ChartHeader>
        <CardTitle>Lead Time Variation</CardTitle>
        <CardDescription>
          Monthly variation in supplier lead times
        </CardDescription>
      </ChartHeader>
      
      <ChartContainer className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={processedData}
            margin={{ top: 20, right: 20, bottom: 30, left: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="month"
              height={60}
              tickFormatter={(value) => value}
            />
            <YAxis 
              label={{ value: 'Lead Time (Days)', angle: -90, position: 'insideLeft' }}
              domain={['dataMin', 'dataMax']}
              tickFormatter={(value) => value.toFixed(0)}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            
            {/* Average lead time with error bars representing standard deviation */}
            <Bar
              dataKey="mean"
              name="Avg. Lead Time"
              fill="hsl(var(--primary))"
              radius={[4, 4, 0, 0]}
              barSize={20}
            >
              <ErrorBar 
                dataKey="stdDev" 
                width={4} 
                strokeWidth={2}
                stroke="hsl(var(--muted-foreground))" 
              />
            </Bar>
            
            {/* Min-max range line */}
            <Line
              dataKey="min"
              name="Min Lead Time"
              stroke="hsl(var(--success))"
              strokeDasharray="3 3"
              dot={false}
            />
            <Line
              dataKey="max"
              name="Max Lead Time"
              stroke="hsl(var(--destructive))"
              strokeDasharray="3 3"
              dot={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </ChartContainer>
    </ChartCard>
  );
} 