import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface MetricCardProps {
  title: string;
  icon?: React.ReactNode;
  data: any[];
  valueExtractor: (item: any) => number;
  dateKey?: string;
  formatValue?: (value: number) => string;
  period: string;
}

export function MetricCard({
  title,
  icon,
  data,
  valueExtractor,
  dateKey = 'date',
  formatValue = (value) => value.toFixed(0),
  period
}: MetricCardProps) {
  
  const calculateMetric = () => {
    if (!data || data.length === 0) return { value: 0, trend: 0, previousValue: 0, currentValue: 0 };
    
    // Sort data by date (newest first)
    const sortedData = [...data].sort((a, b) => {
      return new Date(b[dateKey]).getTime() - new Date(a[dateKey]).getTime();
    });
    
    // Get the most recent date in the dataset
    const mostRecentDate = new Date(sortedData[0][dateKey]);
    
    // Calculate days to look back based on selected period
    const daysToLookBack = parseInt(period);
    
    // Current period: from (mostRecentDate - daysToLookBack) to mostRecentDate
    const currentPeriodStartDate = new Date(mostRecentDate);
    currentPeriodStartDate.setDate(currentPeriodStartDate.getDate() - daysToLookBack);
    
    // Filter data for current period
    const currentPeriodData = sortedData.filter(item => {
      const itemDate = new Date(item[dateKey]);
      return itemDate >= currentPeriodStartDate && itemDate <= mostRecentDate;
    });
    
    // Previous period: from (currentPeriodStartDate - daysToLookBack) to currentPeriodStartDate
    const previousPeriodStartDate = new Date(currentPeriodStartDate);
    previousPeriodStartDate.setDate(previousPeriodStartDate.getDate() - daysToLookBack);
    
    // Filter data for previous period
    const previousPeriodData = sortedData.filter(item => {
      const itemDate = new Date(item[dateKey]);
      return itemDate >= previousPeriodStartDate && itemDate < currentPeriodStartDate;
    });
    
    // Calculate average values
    let currentValue = 0;
    if (currentPeriodData.length > 0) {
      const sum = currentPeriodData.reduce((acc, item) => acc + valueExtractor(item), 0);
      currentValue = sum / currentPeriodData.length;
    }
    
    let previousValue = 0;
    if (previousPeriodData.length > 0) {
      const sum = previousPeriodData.reduce((acc, item) => acc + valueExtractor(item), 0);
      previousValue = sum / previousPeriodData.length;
    }
    
    // Calculate trend percentage
    let trendPercentage = 0;
    if (previousValue !== 0) {
      trendPercentage = ((currentValue - previousValue) / previousValue) * 100;
    }
    
    return {
      value: currentValue,
      trend: trendPercentage,
      previousValue: previousValue,
      currentValue: currentValue
    };
  };
  
  const { value, trend, previousValue, currentValue } = calculateMetric();
  const isPositiveTrend = trend >= 0;
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center space-x-2">
          {icon && <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">{icon}</div>}
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold">{formatValue(value)}</div>
          {trend !== 0 && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className={`flex items-center ${isPositiveTrend ? 'text-success' : 'text-destructive'} cursor-help`}>
                    {isPositiveTrend ? (
                      <TrendingUp className="h-4 w-4 mr-1" />
                    ) : (
                      <TrendingDown className="h-4 w-4 mr-1" />
                    )}
                    <span className="text-xs font-medium">{Math.abs(trend).toFixed(1)}%</span>
                    <span className="text-xs ml-1">
                      ({isPositiveTrend ? '+' : '-'}{formatValue(Math.abs(currentValue - previousValue))})
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent className="p-2 w-[200px]">
                  <div className="space-y-1">
                    <p className="text-xs font-medium">Comparison:</p>
                    <div className="grid grid-cols-2 gap-1">
                      <p className="text-xs text-muted-foreground">Previous period:</p>
                      <p className="text-xs text-right">{formatValue(previousValue)}</p>
                      <p className="text-xs text-muted-foreground">Current period:</p>
                      <p className="text-xs text-right">{formatValue(currentValue)}</p>
                      <p className="text-xs text-muted-foreground">Difference:</p>
                      <p className={`text-xs text-right ${isPositiveTrend ? 'text-success' : 'text-destructive'}`}>
                        {isPositiveTrend ? '+' : ''}{formatValue(currentValue - previousValue)}
                      </p>
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          {parseInt(period) === 1 ? 'Today' : 
           parseInt(period) === 7 ? 'Last 7 days' :
           parseInt(period) === 30 ? 'Last 30 days' :
           `${period} days period`}
        </p>
      </CardContent>
    </Card>
  );
} 