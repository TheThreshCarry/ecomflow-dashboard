import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Logo } from "../ui/logo";

interface WelcomeStepProps {
  onNext: () => void;
}

export function WelcomeStep({ onNext }: WelcomeStepProps) {
  return (
    <Card className="mx-auto max-w-3xl">
      <CardHeader className="text-center flex flex-col items-center gap-2">
        <Logo size="large" />
        <CardTitle className="text-2xl">Welcome to Inventory Threshold Optimizer</CardTitle>
        <CardDescription>Optimize your inventory levels with data-driven thresholds</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-muted/50 p-4 rounded-lg">
          <h3 className="font-medium mb-2">How It Works:</h3>
          <ol className="list-decimal pl-5 space-y-2">
            <li><strong>Upload Data:</strong> Provide your inventory and order data in CSV format</li>
            <li><strong>Configure Parameters:</strong> Adjust lead time and safety stock settings</li>
            <li><strong>Generate Results:</strong> View optimized thresholds and visualizations</li>
          </ol>
        </div>
        
        <div className="bg-muted/50 p-4 rounded-lg">
          <h3 className="font-medium mb-2">Required CSV Format:</h3>
          <p className="text-sm text-muted-foreground mb-2">Your CSV file should include the following columns:</p>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            <li><code>product_id</code>: Product identifier</li>
            <li><code>product_name</code>: Name of the product</li>
            <li><code>date</code>: Date in YYYY-MM-DD format</li>
            <li><code>inventory_level</code>: Current inventory quantity</li>
            <li><code>orders</code>: Order quantity for the day</li>
            <li><code>lead_time_days</code>: Lead time for restocking</li>
          </ul>
        </div>
        
        <Button 
          className="w-full" 
          size="lg"
          onClick={onNext}
        >
          Get Started
        </Button>
      </CardContent>
    </Card>
  )
} 