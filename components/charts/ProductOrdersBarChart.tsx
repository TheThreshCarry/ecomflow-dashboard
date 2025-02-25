import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts"
import { ChartCard, ChartContainer, ChartHeader } from "@/components/ui/chart"
import { CardTitle, CardDescription } from "@/components/ui/card"
import React, { useMemo } from "react";
import { chartConfig } from "@/lib/chart-config";

interface ProductOrdersBarChartProps {
  data: any[];
}

interface ProductData {
  name: string;
  orders: number;
}

interface RawProductData {
  product_id?: string;
  product_name?: string;
  orders?: number | string;
}

export function ProductOrdersBarChart({ data }: ProductOrdersBarChartProps) {
  // Process data to aggregate orders by product
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    // Create a map to store the aggregated data
    const productMap = new Map<string, ProductData>();
    
    // Aggregate orders by product_name instead of product_id
    data.forEach((item: RawProductData) => {
      const productName = item.product_name;
      const ordersRaw = item.orders;
      
      // Skip if missing required fields
      if (!productName || ordersRaw === undefined) return;
      
      // Convert orders to number
      const orders = typeof ordersRaw === 'string' ? Number(ordersRaw) : ordersRaw;
      
      // Skip if orders is NaN
      if (isNaN(orders)) return;
      
      if (productMap.has(productName)) {
        const current = productMap.get(productName);
        if (current) {
          productMap.set(productName, {
            ...current,
            orders: current.orders + orders,
          });
        }
      } else {
        productMap.set(productName, {
          name: productName,
          orders: orders
        });
      }
    });
    
    // Convert the map to an array and sort by orders (descending)
    return Array.from(productMap.values())
      .sort((a, b) => b.orders - a.orders)
      .slice(0, chartConfig.maxTopProducts); // Limit to top N products
  }, [data]);
  
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background/95 border rounded-lg shadow-lg p-3">
          <p className="font-medium">{payload[0].payload.name}</p>
          <p className="text-primary font-medium">
            Orders: {Number(payload[0].value).toFixed(0)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <ChartCard>
      <ChartHeader>
        <CardTitle>Top Products by Orders</CardTitle>
        <CardDescription>Total orders per product</CardDescription>
      </ChartHeader>
      <ChartContainer className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 10, right: 30, left: 100, bottom: 10 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
            <XAxis
              type="number"
              tickFormatter={(value) => Number(value).toFixed(0)}
            />
            <YAxis
              type="category"
              dataKey="name"
              width={90}
              tickFormatter={(value) => {
                // Truncate long product names
                return value.length > 12 ? `${value.substring(0, 12)}...` : value;
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="orders"
              fill="hsl(var(--primary))"
              radius={[0, 4, 4, 0]}
              barSize={20}
            />
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
    </ChartCard>
  );
} 