import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { ThresholdParams, Thresholds } from "@/lib/types"
import { useEffect } from "react"
import { HelpCircle } from "lucide-react"
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger 
} from "@/components/ui/tooltip"
import { Logo } from "@/components/ui/logo"

interface ConfigureStepProps {
  onBack: () => void;
  onNext: () => void;
  params: ThresholdParams;
  thresholds: Thresholds;
  onParamChange: (key: keyof ThresholdParams, value: number) => void;
  onCalculate: () => void;
}

export function ConfigureStep({ 
  onBack, 
  onNext, 
  params, 
  thresholds,
  onParamChange,
  onCalculate
}: ConfigureStepProps) {

  // Run an initial calculation when the component mounts
  useEffect(() => {
    onCalculate();
  }, []);

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

  // Safe display function to handle undefined values
  const formatNumber = (value: number | undefined, decimals: number = 2): string => {
    return value !== undefined ? value.toFixed(decimals) : "0.00";
  };

  // Helper component for tooltips
  const InfoTooltip = ({ content }: { content: string }) => (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-flex items-center cursor-help text-muted-foreground ml-1">
          <HelpCircle size={14} />
        </span>
      </TooltipTrigger>
      <TooltipContent className="max-w-xs" glass={true}>
        <p>{content}</p>
      </TooltipContent>
    </Tooltip>
  );

  return (
    <TooltipProvider>
      <Card className="mx-auto max-w-3xl">
        <CardHeader className="flex flex-col items-center justify-between gap-4">
          <Logo size="large" />
          <div className="flex items-center gap-2 w-full">
            <div>
              <CardTitle>Step 2: Configure Parameters</CardTitle>
              <CardDescription>
                Adjust threshold calculation parameters for your inventory
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            {/* Editable Parameters Section */}
            <div className="bg-background p-4 rounded-lg border border-border">
              <h3 className="font-medium mb-4">Adjustable Parameters:</h3>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="leadTime">Lead Time (days)</Label>
                  <Input
                    id="leadTime"
                    type="number"
                    value={params.leadTime}
                    onChange={(e) =>
                      onParamChange("leadTime", Number(e.target.value))
                    }
                  />
                  <p className="text-sm text-muted-foreground">
                    The average time it takes to receive inventory after
                    ordering.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="safetyStock">Safety Stock (%)</Label>
                  <Input
                    id="safetyStock"
                    type="number"
                    value={params.safetyStock}
                    onChange={(e) =>
                      onParamChange("safetyStock", Number(e.target.value))
                    }
                  />
                  <p className="text-sm text-muted-foreground">
                    Extra inventory maintained to mitigate risk of stockouts.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="serviceLevel">Service Level</Label>
                  <Select
                    onValueChange={handleZScoreChange}
                    defaultValue={params.zScore.toString()}
                  >
                    <SelectTrigger>
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
                  <p className="text-sm text-muted-foreground">
                    Target service level determines your stockout risk
                    tolerance.
                  </p>
                </div>
              </div>
            </div>

            <Button onClick={onCalculate} className="w-full">
              Calculate Thresholds
            </Button>

            <Separator className="my-4" />

            {/* Read-only Calculated Values Section */}
            <div className="bg-muted/50 p-4 rounded-lg mt-4">
              <h3 className="font-medium mb-4">Calculated Values:</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>Average Daily Sales</div>
                <div className="font-medium flex items-center">
                  {formatNumber(params.averageDailySales)}
                  <InfoTooltip content="Average number of units sold per day, calculated from your historical data." />
                </div>

                <div>Demand Std Deviation</div>
                <div className="font-medium flex items-center">
                  {formatNumber(params.demandStdDev)}
                  <InfoTooltip content="Statistical measure of variability in daily sales. Higher values indicate more unpredictable demand." />
                </div>

                <div>Service Level</div>
                <div className="font-medium flex items-center">
                  {getServiceLevel(params.zScore)}
                  <InfoTooltip content="Probability of not having a stockout during lead time. Higher values mean fewer stockouts but higher inventory costs." />
                </div>

                <div>Lead Time Demand</div>
                <div className="font-medium flex items-center">
                  {formatNumber(thresholds.leadTimeDemand)}
                  <InfoTooltip content="Expected total demand during the lead time period (Average Daily Sales × Lead Time)." />
                </div>

                <div>Safety Stock</div>
                <div className="font-medium flex items-center">
                  {formatNumber(thresholds.safetyStock)}
                  <InfoTooltip content="Buffer stock to protect against variability in demand during lead time. Calculated using standard deviation and service level." />
                </div>

                <div>Reorder Point</div>
                <div className="font-medium flex items-center">
                  {formatNumber(thresholds.reorderPoint)}
                  <InfoTooltip content="Inventory level at which a new order should be placed. Equals Lead Time Demand + Safety Stock." />
                </div>

                <div>Low Threshold</div>
                <div className="font-medium flex items-center">
                  {formatNumber(thresholds.low)}
                  <InfoTooltip content="Critical inventory level. When stock falls below this point, order immediately to avoid stockouts." />
                </div>

                <div>Medium Threshold</div>
                <div className="font-medium flex items-center">
                  {formatNumber(thresholds.medium)}
                  <InfoTooltip content="Warning inventory level. When stock falls below this point, prepare to place orders soon." />
                </div>

                <div>High Threshold</div>
                <div className="font-medium flex items-center">
                  {formatNumber(thresholds.high)}
                  <InfoTooltip content="Caution inventory level. When stock falls below this point, monitor inventory and forecast demand." />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={onBack}>
              Back
            </Button>
            <Button onClick={onNext}>Generate Results</Button>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
} 