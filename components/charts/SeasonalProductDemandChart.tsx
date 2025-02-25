import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { ChartCard, ChartContainer, ChartHeader } from "@/components/ui/chart";
import { CardTitle, CardDescription } from "@/components/ui/card";
import { useMemo } from "react";
import { chartConfig } from "@/lib/chart-config";

interface SeasonalProductDemandChartProps {
  data: any[];
}

export function SeasonalProductDemandChart({ data }: SeasonalProductDemandChartProps) {
  // Process data to show seasonal demand by month for each product
  const { seasonalData, monthlyTotals, productList, maxDemand } = useMemo(() => {
    if (!data || data.length === 0) return { 
      seasonalData: [], 
      monthlyTotals: {}, 
      productList: [],
      maxDemand: 0
    };
    
    // Group by product and month
    const productMonthOrders: Record<string, Record<string, number>> = {};
    const productTotals: Record<string, number> = {};
    const monthlyTotals: Record<string, number> = {};
    let maxDemand = 0;
    
    // First, aggregate orders by product and month
    data.forEach(item => {
      if (!item.product_name || !item.date || !item.orders) return;
      
      const productName = item.product_name;
      const date = new Date(item.date);
      const month = date.getMonth(); // 0-11 for Jan-Dec
      const monthName = date.toLocaleString('default', { month: 'short' });
      const orders = Number(item.orders);
      
      if (isNaN(orders)) return;
      
      // Initialize product entry if it doesn't exist
      if (!productMonthOrders[productName]) {
        productMonthOrders[productName] = {};
        productTotals[productName] = 0;
      }
      
      // Add orders to the product-month entry
      if (!productMonthOrders[productName][month]) {
        productMonthOrders[productName][month] = 0;
      }
      productMonthOrders[productName][month] += orders;
      
      // Track total orders per product
      productTotals[productName] += orders;
      
      // Track monthly totals across all products
      if (!monthlyTotals[month]) {
        monthlyTotals[month] = 0;
      }
      monthlyTotals[month] += orders;
    });
    
    // Determine which products to include (top N by total orders)
    const sortedProducts = Object.entries(productTotals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, chartConfig.maxTopProducts)
      .map(entry => entry[0]);
    
    // Create data points for the scatter plot (heat map)
    const seasonalData: Array<{
      product: string;
      month: string;
      monthIndex: number;
      productIndex: number;
      volume: number;
      percentage: number;
    }> = [];
    
    // Month names for x-axis
    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    
    // Create data points for each product and month
    sortedProducts.forEach((product, productIndex) => {
      // Calculate the product's orders for each month
      for (let month = 0; month < 12; month++) {
        const volume = productMonthOrders[product][month] || 0;
        
        // Calculate this product's percentage of total orders for this month
        const monthTotal = monthlyTotals[month] || 1; // Avoid division by zero
        const percentage = volume / monthTotal * 100;
        
        // Track maximum demand for color scaling
        maxDemand = Math.max(maxDemand, percentage);
        
        seasonalData.push({
          product,
          month: monthNames[month],
          monthIndex: month,
          productIndex,
          volume,
          percentage
        });
      }
    });
    
    return { 
      seasonalData, 
      monthlyTotals, 
      productList: sortedProducts,
      maxDemand
    };
  }, [data]);
  
  // Color function for heat map cells
  const getHeatMapColor = (value: number) => {
    // Scale the color intensity based on the percentage (0-100%)
    const intensity = Math.min(value / maxDemand, 1);
    
    if (intensity < 0.2) return 'hsl(var(--muted-foreground)/0.2)';
    if (intensity < 0.4) return 'hsl(var(--warning)/0.4)';
    if (intensity < 0.6) return 'hsl(var(--warning)/0.6)';
    if (intensity < 0.8) return 'hsl(var(--warning)/0.8)';
    return 'hsl(var(--amber))';
  };
  
  // Custom tooltip content
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      
      return (
        <div className="bg-background/95 border rounded-lg shadow-lg p-3">
          <p className="font-medium">{data.product}</p>
          <p className="text-sm">{data.month}</p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-1">
            <p className="text-sm">Order Volume:</p>
            <p className="text-sm font-medium">{Math.round(data.volume)}</p>
            
            <p className="text-sm">Share of Month:</p>
            <p className="text-sm font-medium">
              {data.percentage.toFixed(1)}%
            </p>
          </div>
        </div>
      );
    }
    
    return null;
  };
  
  // Generate custom ticks for the Y-axis (product names)
  const CustomizedYAxisTick = ({ y, payload }: any) => {
    const productName = productList[payload.value];
    // Truncate long product names
    const displayName = productName?.length > 12 
      ? `${productName.substring(0, 12)}...` 
      : productName;
      
    return (
      <g transform={`translate(0,${y})`}>
        <text 
          x={-10} 
          y={0} 
          dy={4} 
          textAnchor="end" 
          fill="currentColor"
          className="text-xs"
        >
          {displayName}
        </text>
      </g>
    );
  };

  return (
    <ChartCard>
      <ChartHeader>
        <CardTitle>Seasonal Product Demand</CardTitle>
        <CardDescription>
          Monthly demand patterns for top products
        </CardDescription>
      </ChartHeader>
      
      <ChartContainer className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart
            margin={{ top: 20, right: 20, bottom: 20, left: 100 }}
          >
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="monthIndex" 
              name="Month" 
              type="number"
              domain={[0, 11]}
              tickCount={12}
              tickFormatter={(val) => ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                               'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][val]}
            />
            <YAxis 
              dataKey="productIndex" 
              name="Product"
              type="number"
              domain={[0, productList.length - 1]}
              tickCount={productList.length}
              tick={<CustomizedYAxisTick />}
              axisLine={false}
            />
            <ZAxis 
              dataKey="percentage" 
              range={[100, 100]} 
              scale="linear"
            />
            <Tooltip content={<CustomTooltip />} />
            <Scatter
              name="Product Demand"
              data={seasonalData}
              fill="hsl(var(--primary))"
            >
              {seasonalData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={getHeatMapColor(entry.percentage)}
                />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </ChartContainer>
    </ChartCard>
  );
} 