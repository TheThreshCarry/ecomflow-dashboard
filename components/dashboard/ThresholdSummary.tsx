import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Thresholds } from "@/lib/types"

interface ThresholdSummaryProps {
  thresholds: Thresholds;
}

export function ThresholdSummary({ thresholds }: ThresholdSummaryProps) {
  // Safe formatting function to handle undefined values
  const formatNumber = (value: number | undefined, decimals: number = 1): string => {
    return value !== undefined ? value.toFixed(decimals) : "0.0";
  };
  
  // Normalize segments for better visualization with minimum visibility
  // Even with close values, we'll be able to see the difference
  const minSegmentWidth = 15; // Minimum width in percentage to ensure visibility
  
  // Default to 0 if values are undefined
  const lowValue = thresholds.low || 0;
  const mediumValue = thresholds.medium || 0;
  const highValue = thresholds.high || 0;
  
  // Normalize to ensure minimum widths while preserving relative differences
  let lowSegment, mediumSegment, highSegment;
  
  // Calculate raw percentages based on the range (avoiding division by zero)
  const rawLowPercent = highValue !== 0 ? (lowValue / highValue) * 100 : 33.3;
  const rawMediumPercent = highValue !== 0 ? ((mediumValue - lowValue) / highValue) * 100 : 33.3;
  const rawHighPercent = highValue !== 0 ? ((highValue - mediumValue) / highValue) * 100 : 33.3;
  
  // Approach 1: Ensure minimum segment width while preserving relative sizes
  if (rawLowPercent < minSegmentWidth || rawMediumPercent < minSegmentWidth || rawHighPercent < minSegmentWidth) {
    // If any segment is smaller than minimum, distribute evenly with small differences
    const remainingSpace = 100 - (3 * minSegmentWidth);
    
    // Distribute remaining space proportionally to original percentages
    const total = rawLowPercent + rawMediumPercent + rawHighPercent;
    // Avoid division by zero
    if (total === 0) {
      lowSegment = mediumSegment = highSegment = 33.3;
    } else {
      lowSegment = minSegmentWidth + (remainingSpace * (rawLowPercent / total));
      mediumSegment = minSegmentWidth + (remainingSpace * (rawMediumPercent / total));
      highSegment = minSegmentWidth + (remainingSpace * (rawHighPercent / total));
    }
  } else {
    // If all segments are large enough, use the raw percentages
    lowSegment = rawLowPercent;
    mediumSegment = rawMediumPercent;
    highSegment = rawHighPercent;
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="font-medium">Threshold Levels</span>
          <div className="flex items-center gap-2">
            <span className="font-bold text-destructive">{formatNumber(thresholds.low)}</span>
            <span>-</span>
            <span className="font-bold text-warning">{formatNumber(thresholds.medium)}</span>
            <span>-</span>
            <span className="font-bold text-info">{formatNumber(thresholds.high)}</span>
          </div>
        </div>
        <div className="w-full bg-muted rounded-full h-6 overflow-hidden flex">
          {/* Low threshold segment */}
          <div 
            className="bg-destructive h-full rounded-l-full"
            style={{ width: `${lowSegment}%` }}
          >
            {lowSegment > 10 && (
              <span className="text-xs text-white flex items-center justify-center h-full px-2 truncate">
                0-{formatNumber(thresholds.low)}
              </span>
            )}
          </div>
          {/* Medium threshold segment */}
          <div 
            className="bg-warning h-full"
            style={{ width: `${mediumSegment}%` }}
          >
            {mediumSegment > 10 && (
              <span className="text-xs flex items-center justify-center h-full px-2 truncate">
                {formatNumber(thresholds.low)}-{formatNumber(thresholds.medium)}
              </span>
            )}
          </div>
          {/* High threshold segment */}
          <div 
            className="bg-info h-full rounded-r-full"
            style={{ width: `${highSegment}%` }}
          >
            {highSegment > 10 && (
              <span className="text-xs text-white flex items-center justify-center h-full px-2 truncate">
                {formatNumber(thresholds.medium)}-{formatNumber(thresholds.high)}
              </span>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-3 text-xs mt-2">
          <div>
            <span className="inline-block w-3 h-3 bg-destructive rounded-full mr-1"></span>
            <span>Low: Order Immediately</span>
          </div>
          <div>
            <span className="inline-block w-3 h-3 bg-warning rounded-full mr-1"></span>
            <span>Medium: Prepare to Order</span>
          </div>
          <div>
            <span className="inline-block w-3 h-3 bg-info rounded-full mr-1"></span>
            <span>High: Monitor Levels</span>
          </div>
        </div>
      </div>

      <div className="bg-muted/20 p-4 rounded-lg border border-border">
        <h3 className="font-medium mb-3">Inventory Parameters</h3>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="text-sm">
            <div className="font-medium">Lead Time Demand:</div>
            <div className="text-lg font-bold">{formatNumber(thresholds.leadTimeDemand)}</div>
            <div className="text-xs text-muted-foreground">Expected units sold during lead time</div>
          </div>
          <div className="text-sm">
            <div className="font-medium">Safety Stock:</div>
            <div className="text-lg font-bold">{formatNumber(thresholds.safetyStock)}</div>
            <div className="text-xs text-muted-foreground">Buffer to handle demand variability</div>
          </div>
          <div className="text-sm">
            <div className="font-medium">Reorder Point:</div>
            <div className="text-lg font-bold">{formatNumber(thresholds.reorderPoint)}</div>
            <div className="text-xs text-muted-foreground">When to place new orders</div>
          </div>
        </div>
        
        <h3 className="font-medium mb-3">Threshold Explanation</h3>
        <div className="space-y-2 text-sm">
          <p><strong>Low Threshold ({formatNumber(thresholds.low)}):</strong> Critical level - Place order immediately to avoid stockout.</p>
          <p><strong>Medium Threshold ({formatNumber(thresholds.medium)}):</strong> Warning level - Prepare to place orders soon.</p>
          <p><strong>High Threshold ({formatNumber(thresholds.high)}):</strong> Caution level - Monitor inventory and forecast demand.</p>
        </div>
      </div>
    </div>
  )
} 