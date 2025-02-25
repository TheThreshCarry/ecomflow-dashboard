import { PieChart, Pie, ResponsiveContainer, Tooltip, Cell, Legend } from "recharts"
import { ChartCard, ChartContainer, ChartHeader } from "@/components/ui/chart"
import { CardTitle, CardDescription } from "@/components/ui/card"
import React, { useMemo } from "react";
import { chartConfig } from "@/lib/chart-config";

interface ProductOrdersPieChartProps {
  data: any[];
}

// Predefined set of colors for the pie chart slices
const COLORS = [
  "#8884d8", "#83a6ed", "#8dd1e1", "#82ca9d", "#a4de6c", 
  "#d0ed57", "#ffc658", "#ff8042", "#ff5252", "#ba68c8",
  "#6a0dad", "#1e90ff", "#32cd32", "#ff4500", "#9370db",
  "#00ced1", "#ff6347", "#7b68ee", "#3cb371", "#ffa07a"
];

// Number of individual products to show before grouping into "Others"
const MAX_PRODUCTS_TO_SHOW = chartConfig.maxProductsToShow;

interface ProductData {
  name: string;
  value: number;
}

interface RawProductData {
  product_id?: string;
  product_name?: string;
  orders?: number | string;
}

export function ProductOrdersPieChart({ data }: ProductOrdersPieChartProps) {
  // Process data to aggregate orders by product
  const pieData = useMemo(() => {
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
            value: current.value + orders,
          });
        }
      } else {
        productMap.set(productName, {
          name: productName,
          value: orders
        });
      }
    });
    
    // Convert the map to an array and sort by orders (descending)
    const sortedProducts = Array.from(productMap.values())
      .sort((a, b) => b.value - a.value);
    
    // If we have more products than our limit, group the rest into "Others"
    if (sortedProducts.length > MAX_PRODUCTS_TO_SHOW) {
      const topProducts = sortedProducts.slice(0, MAX_PRODUCTS_TO_SHOW);
      const othersValue = sortedProducts
        .slice(MAX_PRODUCTS_TO_SHOW)
        .reduce((sum, item) => sum + item.value, 0);
      
      if (othersValue > 0) {
        topProducts.push({
          name: "Others",
          value: othersValue
        });
      }
      
      return topProducts;
    }
    
    return sortedProducts;
    
  }, [data]);
  
  const ProductTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      const total = pieData.reduce((sum, p) => sum + p.value, 0);
      const percent = total > 0 ? ((item.value / total) * 100).toFixed(1) : '0.0';
      
      return (
        <div className="bg-background/95 border rounded-lg shadow-lg p-3">
          <p className="font-medium">{item.name}</p>
          <p className="text-primary font-medium">Orders: {item.value.toFixed(0)}</p>
          <p className="text-muted-foreground">Percentage: {percent}%</p>
        </div>
      );
    }
    return null;
  };

  // If we have no data after processing, show a message
  if (pieData.length === 0) {
    return (
      <ChartCard>
        <ChartHeader>
          <CardTitle>Order Distribution</CardTitle>
          <CardDescription>Percentage of orders by product</CardDescription>
        </ChartHeader>
        <ChartContainer className="h-[300px] flex items-center justify-center">
          <p className="text-muted-foreground">No product data available</p>
        </ChartContainer>
      </ChartCard>
    );
  }

  return (
    <ChartCard>
      <ChartHeader>
        <CardTitle>Order Distribution</CardTitle>
        <CardDescription>Percentage of orders by product</CardDescription>
      </ChartHeader>
      <ChartContainer className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              fill="#8884d8"
              paddingAngle={2}
              dataKey="value"
              label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
              labelLine={false}
            >
              {pieData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[index % COLORS.length]} 
                />
              ))}
            </Pie>
            <Tooltip content={<ProductTooltip />} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </ChartContainer>
    </ChartCard>
  );
} 