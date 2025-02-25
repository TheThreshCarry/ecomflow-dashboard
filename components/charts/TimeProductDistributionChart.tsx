import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from "recharts";
import { ChartCard, ChartContainer, ChartHeader } from "@/components/ui/chart";
import { CardTitle, CardDescription } from "@/components/ui/card";
import { useMemo } from "react";
import { chartConfig } from "@/lib/chart-config";
import { differenceInDays, format, isAfter, isBefore, isSameDay, startOfDay, subDays } from "date-fns";

interface TimeProductDistributionChartProps {
  data: any[];
  type: 'orders' | 'inventory';
}

export function TimeProductDistributionChart({ data, type }: TimeProductDistributionChartProps) {
  // Process data to show product distribution by appropriate time period
  const { chartData, productList, colorMap, timeUnit } = useMemo(() => {
    if (!data || data.length === 0) return { 
      chartData: [], 
      productList: [], 
      colorMap: {},
      timeUnit: 'month'
    };
    
    // Color palette for consistent product colors
    const COLORS = [
      "hsl(var(--primary))",
      "hsl(var(--chart-1))",
      "hsl(var(--chart-2))",
      "hsl(var(--chart-3))",
      "hsl(var(--chart-4))",
      "hsl(var(--chart-5))",
      "hsl(var(--warning))",
      "hsl(var(--info))",
    ];
    
    // Determine date range to pick appropriate grouping
    const dates = data
      .filter(item => item.date)
      .map(item => new Date(item.date));
    
    const minDate = dates.length > 0 ? new Date(Math.min(...dates.map(d => d.getTime()))) : new Date();
    const maxDate = dates.length > 0 ? new Date(Math.max(...dates.map(d => d.getTime()))) : new Date();
    const daysDiff = differenceInDays(maxDate, minDate) + 1;
    
    // Choose time unit based on range
    let timeUnit = 'month';
    let formatString = 'MMM yy';
    let groupingFunction = (date: Date) => `${date.getFullYear()}-${date.getMonth() + 1}`;
    
    if (daysDiff <= 14) {
      // For 2 weeks or less, group by day
      timeUnit = 'day';
      formatString = 'MMM d';
      groupingFunction = (date: Date) => format(date, 'yyyy-MM-dd');
    } else if (daysDiff <= 90) {
      // For 3 months or less, group by week
      timeUnit = 'week';
      formatString = "'W'w MMM";
      groupingFunction = (date: Date) => {
        const week = Math.floor(date.getDate() / 7) + 1;
        return `${date.getFullYear()}-${date.getMonth() + 1}-W${week}`;
      };
    }
    // Else, keep month grouping
    
    // Group by time period and product
    const periodData: Record<string, Record<string, any>> = {};
    const productTotals: Record<string, number> = {};
    
    // First, aggregate data by time period and product
    data.forEach(item => {
      if (!item.product_name || !item.date) return;
      
      // Get the value based on type (orders or inventory)
      const value = type === 'orders' 
        ? Number(item.orders || 0) 
        : Number(item.inventory_level || 0);
      
      if (isNaN(value) || value <= 0) return;
      
      const productName = item.product_name;
      const date = new Date(item.date);
      const periodKey = groupingFunction(date);
      const periodDisplay = format(date, formatString);
      
      // Track period data
      if (!periodData[periodKey]) {
        periodData[periodKey] = { 
          period: periodDisplay, 
          periodDate: date, // Keep date for sorting
          total: 0 
        };
      }
      
      if (!periodData[periodKey][productName]) {
        periodData[periodKey][productName] = 0;
      }
      
      periodData[periodKey][productName] += value;
      periodData[periodKey].total += value;
      
      // Track product totals for selecting top products
      if (!productTotals[productName]) {
        productTotals[productName] = 0;
      }
      productTotals[productName] += value;
    });
    
    // Determine top products by total
    const topProducts = Object.entries(productTotals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, chartConfig.maxProductsToShow - 1) // Save space for "Others"
      .map(entry => entry[0]);
    
    // Create color mapping for products
    const colorMap: Record<string, string> = {};
    topProducts.forEach((product, index) => {
      colorMap[product] = COLORS[index % COLORS.length];
    });
    colorMap["Others"] = "hsl(var(--muted-foreground))";
    
    // Convert period data to chart format with percentages
    const chartData = Object.entries(periodData)
      .map(([key, periodData]) => {
        const total = periodData.total || 1; // Avoid division by zero
        const result: Record<string, any> = { 
          period: periodData.period,
          periodDate: periodData.periodDate
        };
        
        // Calculate percentage for each top product
        topProducts.forEach(product => {
          const value = periodData[product] || 0;
          result[product] = (value / total) * 100;
        });
        
        // Combine remaining products as "Others"
        const othersValue = Object.entries(periodData)
          .filter(([key, _]) => key !== 'period' && key !== 'periodDate' && key !== 'total' && !topProducts.includes(key))
          .reduce((sum, [_, value]) => sum + (value as number), 0);
        
        result["Others"] = (othersValue / total) * 100;
        
        return result;
      })
      // Sort by date chronologically
      .sort((a, b) => a.periodDate.getTime() - b.periodDate.getTime());
    
    return { 
      chartData, 
      productList: [...topProducts, "Others"],
      colorMap,
      timeUnit
    };
  }, [data, type]);
  
  // Get unit label text based on timeUnit
  const getUnitLabel = () => {
    switch (timeUnit) {
      case 'day': return 'Daily';
      case 'week': return 'Weekly';
      case 'month': return 'Monthly';
      default: return 'Period';
    }
  };
  
  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background/95 border rounded-lg shadow-lg p-3">
          <p className="font-medium">{label}</p>
          <div className="mt-2 space-y-1">
            {payload.map((entry: any, index: number) => (
              <div key={`item-${index}`} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-sm">{entry.name}:</span>
                <span className="text-sm font-medium">{entry.value.toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <ChartCard>
      <ChartHeader>
        <CardTitle>
          {getUnitLabel()} {type === 'orders' ? 'Order Distribution' : 'Inventory Distribution'}
        </CardTitle>
        <CardDescription>
          {type === 'orders' 
            ? `Percentage breakdown of orders by product for each ${timeUnit}` 
            : `Percentage breakdown of inventory by product for each ${timeUnit}`}
        </CardDescription>
      </ChartHeader>
      
      <ChartContainer className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
            stackOffset="expand"
          >
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="period" 
              tickFormatter={(value) => value}
              height={70}
              angle={-45}
              textAnchor="end"
            />
            <YAxis 
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              verticalAlign="top"
              wrapperStyle={{ paddingBottom: '10px' }}
            />
            
            {productList.map((product, index) => (
              <Bar 
                key={`product-${index}`}
                dataKey={product}
                stackId="a"
                fill={colorMap[product]}
                name={product}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
    </ChartCard>
  );
} 