import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Averages time series data points to reduce visual noise when there are too many data points
 * @param data Array of data points
 * @param dateKey Key for the date field in data objects
 * @param maxPoints Maximum number of points to show
 * @returns Averaged data with reduced points
 */
export function averageTimeSeriesData(data: any[], dateKey: string = 'date', maxPoints: number = 30) {
  if (!data || data.length === 0 || data.length <= maxPoints) {
    return data;
  }

  // Sort data by date
  const sortedData = [...data].sort((a, b) => 
    new Date(a[dateKey]).getTime() - new Date(b[dateKey]).getTime()
  );

  // Calculate how many points to combine
  const chunkSize = Math.ceil(data.length / maxPoints);
  
  // Group data into chunks and average each chunk
  const averagedData = [];
  
  for (let i = 0; i < sortedData.length; i += chunkSize) {
    const chunk = sortedData.slice(i, i + chunkSize);
    if (chunk.length === 0) continue;
    
    // Create a new data point with averaged values
    const avgPoint: any = {};
    
    // Use the middle date from the chunk
    const middleIndex = Math.floor(chunk.length / 2);
    avgPoint[dateKey] = chunk[middleIndex][dateKey];
    
    // Average numeric fields, keep other fields from the middle item
    Object.keys(chunk[0]).forEach(key => {
      if (key === dateKey) return;
      
      // If the value is a number, calculate average
      if (typeof chunk[0][key] === 'number') {
        avgPoint[key] = chunk.reduce((sum, item) => sum + (item[key] || 0), 0) / chunk.length;
      } else {
        // For non-numeric fields, use the value from the middle item
        avgPoint[key] = chunk[middleIndex][key];
      }
    });
    
    averagedData.push(avgPoint);
  }
  
  return averagedData;
}
