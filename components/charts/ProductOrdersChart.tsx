import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from "recharts"
import { ChartCard, ChartContainer, ChartHeader } from "@/components/ui/chart"
import { CardTitle, CardDescription } from "@/components/ui/card"
import { useTheme } from "next-themes";
import React, { useMemo } from "react";

interface ProductOrdersChartProps {
  data: any[];
  getBarColor: (leadTime: number) => string;
}

export function ProductOrdersChart({ data, getBarColor }: ProductOrdersChartProps) {
  const theme = useTheme();
  
  // Process data to aggregate orders by product
  const productData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    // Create a map to store the aggregated data
    const productMap = new Map();
    
    // Aggregate orders by product_id
    data.forEach(item => {
      const productId = item.product_id;
      const productName = item.product_name;
      const orders = Number(item.orders);
      const leadTime = item.lead_time_days;
      
      if (productMap.has(productId)) {
        const current = productMap.get(productId);
        productMap.set(productId, {
          ...current,
          orders: current.orders + orders,
        });
      } else {
        productMap.set(productId, {
          product_id: productId,
          product_name: productName,
          orders: orders,
          lead_time_days: leadTime
        });
      }
    });
    
    // Convert the map to an array and sort by orders (descending)
    return Array.from(productMap.values())
      .sort((a, b) => b.orders - a.orders);
  }, [data]);
  
  const ProductTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-background/95 border rounded-lg shadow-lg p-3">
          <p className="font-medium">{item.product_name}</p>
          <p className="text-primary font-medium">Orders: {item.orders.toFixed(0)}</p>
          <p className="text-muted-foreground">Lead Time: {item.lead_time_days} days</p>
        </div>
      );
    }
    return null;
  };

  return (
    <ChartCard>
      <ChartHeader>
        <CardTitle>Orders by Product</CardTitle>
        <CardDescription>Total orders for each product</CardDescription>
      </ChartHeader>
      <ChartContainer className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={productData} 
            layout="vertical"
            margin={{ top: 20, right: 30, bottom: 20, left: 100 }}
          >
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              type="number"
              tickFormatter={(value) => value.toFixed(0)} 
            />
            <YAxis 
              type="category"
              dataKey="product_name"
              width={90}
              tickFormatter={(value) => value.length > 12 ? `${value.substring(0, 12)}...` : value}
            />
            <Tooltip content={<ProductTooltip />} />
            <Bar 
              dataKey="orders"
              radius={[0, 4, 4, 0]}
            >
              {productData.map((entry, index) => (
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
  );
} 