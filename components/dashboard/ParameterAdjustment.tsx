import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { ThresholdParams } from "@/lib/types"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ParameterAdjustmentProps {
  params: ThresholdParams;
  onParamChange: (key: keyof ThresholdParams, value: number) => void;
}

export function ParameterAdjustment({ params, onParamChange }: ParameterAdjustmentProps) {
  const handleZScoreChange = (value: string) => {
    onParamChange("zScore", Number(value));
  };

  const getServiceLevel = (zScore: number): string => {
    if (zScore === 1.28) return "90%";
    if (zScore === 1.64) return "95%";
    if (zScore === 1.96) return "97.5%";
    if (zScore === 2.33) return "99%";
    if (zScore === 2.58) return "99.5%";
    return "95%";
  };

  // Safe formatting to handle undefined values
  const formatNumber = (value: number | undefined, decimals: number = 2): string => {
    return value !== undefined ? value.toFixed(decimals) : "0.00";
  };

  return (
    <div className="bg-muted/20 p-4 rounded-lg space-y-4 border border-border">
      <h3 className="font-medium text-sm mb-3">Quick Parameter Adjustment</h3>
      
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label htmlFor="quickLeadTime" className="text-sm">Lead Time</Label>
          <span className="text-sm font-medium">{params.leadTime} days</span>
        </div>
        <Slider
          id="quickLeadTime"
          min={1}
          max={30}
          step={1}
          value={[params.leadTime]}
          onValueChange={(value) => onParamChange("leadTime", value[0])}
        />
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label htmlFor="quickSafetyStock" className="text-sm">Safety Stock</Label>
          <span className="text-sm font-medium">{params.safetyStock}%</span>
        </div>
        <Slider
          id="quickSafetyStock"
          min={5}
          max={50}
          step={5}
          value={[params.safetyStock]}
          onValueChange={(value) => onParamChange("safetyStock", value[0])}
        />
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label htmlFor="quickServiceLevel" className="text-sm">Service Level</Label>
          <span className="text-sm font-medium">{getServiceLevel(params.zScore)}</span>
        </div>
        <Select
          onValueChange={handleZScoreChange}
          defaultValue={params.zScore.toString()}
        >
          <SelectTrigger id="quickServiceLevel" className="w-full">
            <SelectValue placeholder="Service Level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1.28">90% Service Level</SelectItem>
            <SelectItem value="1.64">95% Service Level</SelectItem>
            <SelectItem value="1.96">97.5% Service Level</SelectItem>
            <SelectItem value="2.33">99% Service Level</SelectItem>
            <SelectItem value="2.58">99.5% Service Level</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="mt-4">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-muted-foreground">Average Daily Sales:</span>
          <span>{formatNumber(params.averageDailySales)}</span>
        </div>
        <div className="flex justify-between text-xs mb-2">
          <span className="text-muted-foreground">Demand Std Deviation:</span>
          <span>{formatNumber(params.demandStdDev)}</span>
        </div>
        <p className="text-xs">Adjustments are applied immediately to the charts below.</p>
      </div>
    </div>
  )
} 