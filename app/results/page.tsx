"use client";

import { usePathname, useRouter } from "next/navigation";
import { useInventory } from "../providers";
import { ResultsStep } from "@/components/steps/ResultsStep";
import { ThresholdParams } from "@/lib/types";
import { Logo } from "@/components/ui/logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Footer } from "@/components/ui/footer";
import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

// Define export format type
export type ExportFormat = "text" | "pdf";

// Format the service level string
const getServiceLevel = (zScore: number): string => {
  if (zScore === 1.28) return "90%";
  if (zScore === 1.64) return "95%";
  if (zScore === 1.96) return "97.5%";
  if (zScore === 2.33) return "99%";
  if (zScore === 2.58) return "99.5%";
  return "95%";
};

export default function ResultsPage() {
  const router = useRouter();
  const pathName = usePathname();
  const {
    data,
    params,
    thresholds,
    chartData,
    ordersData,
    setParams,
    calculateThresholds,
  } = useInventory();
  
  // State for PDF modal
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [pdfContent, setPdfContent] = useState("");

  // Redirect to upload page if no data is available
  if (data.length === 0) {
    router.push("/");
    return null;
  }

  // Function to get dynamic background color based on lead time
  const getLeadTimeColor = (leadTime: number) => {
    if (leadTime <= 2) return "rgba(0, 255, 0, 0.1)"; // Fast lead time (green)
    if (leadTime <= 5) return "rgba(255, 255, 0, 0.1)"; // Medium lead time (yellow)
    if (leadTime <= 10) return "rgba(255, 165, 0, 0.1)"; // Longer lead time (orange)
    return "rgba(255, 0, 0, 0.1)"; // Very long lead time (red)
  };

  // Function to get bar color based on lead time
  const getBarColor = (leadTime: number) => {
    if (leadTime <= 2) return "hsl(var(--success))"; // Fast lead time
    if (leadTime <= 5) return "hsl(var(--warning))"; // Medium lead time
    if (leadTime <= 10) return "hsl(var(--amber))"; // Longer lead time
    return "hsl(var(--destructive))"; // Very long lead time
  };

  const handleParamChange = (key: keyof ThresholdParams, value: number) => {
    setParams((prev) => ({
      ...prev,
      [key]: value,
    }));

    // Recalculate thresholds with the new parameters
    calculateThresholds();
  };

  // Create the PDF content
  const createPdfContent = () => {
    const formatNumber = (num: number) => num.toFixed(2);
    const logoUrl = "https://media.licdn.com/dms/image/v2/D560BAQF1Nom5iwfD_A/company-logo_200_200/company-logo_200_200/0/1731818635764/ecomflowhq_logo?e=2147483647&v=beta&t=PSvA40PxX8CO07WkEeRqrXzEQEyYTL-kI5oJsffwL1k";
    
    return `
      <div class="pdf-container">
        <div class="logo-container">
          <img src="${logoUrl}" alt="EcomFlow Logo" class="logo" />
        </div>
        
        <h1>Inventory Threshold Analysis Results</h1>
        
        <div class="section">
          <div class="section-title">Threshold Levels</div>
          <div class="data-row">
            <span class="data-label">Low Threshold:</span>
            <span>${formatNumber(thresholds.low)}</span>
          </div>
          <div class="data-row">
            <span class="data-label">Medium Threshold:</span>
            <span>${formatNumber(thresholds.medium)}</span>
          </div>
          <div class="data-row">
            <span class="data-label">High Threshold:</span>
            <span>${formatNumber(thresholds.high)}</span>
          </div>
        </div>
        
        <div class="section">
          <div class="section-title">Calculated Values</div>
          <div class="data-row">
            <span class="data-label">Lead Time Demand:</span>
            <span>${formatNumber(thresholds.leadTimeDemand)}</span>
          </div>
          <div class="data-row">
            <span class="data-label">Safety Stock:</span>
            <span>${formatNumber(thresholds.safetyStock)}</span>
          </div>
          <div class="data-row">
            <span class="data-label">Reorder Point:</span>
            <span>${formatNumber(thresholds.reorderPoint)}</span>
          </div>
        </div>
        
        <div class="section">
          <div class="section-title">Parameters</div>
          <div class="data-row">
            <span class="data-label">Lead Time:</span>
            <span>${params.leadTime} days</span>
          </div>
          <div class="data-row">
            <span class="data-label">Safety Stock:</span>
            <span>${params.safetyStock}%</span>
          </div>
          <div class="data-row">
            <span class="data-label">Average Daily Sales:</span>
            <span>${formatNumber(params.averageDailySales)}</span>
          </div>
          <div class="data-row">
            <span class="data-label">Demand Standard Deviation:</span>
            <span>${formatNumber(params.demandStdDev)}</span>
          </div>
          <div class="data-row">
            <span class="data-label">Service Level:</span>
            <span>${getServiceLevel(params.zScore)} (Z-Score: ${params.zScore})</span>
          </div>
          <div class="data-row">
            <span class="data-label">Stockout Risk:</span>
            <span>${(1 - params.zScore * 0.1).toFixed(1)}%</span>
          </div>
        </div>
        
        <div class="footer">
          Export Date: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}
        </div>
      </div>
    `;
  };

  // Function to print the PDF
  const printPdf = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Please allow popups for this website to export as PDF");
      return;
    }

    // Add styled content to the new window
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Inventory Thresholds</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            padding: 20px;
            max-width: 800px;
            margin: 0 auto;
          }
          .logo-container {
            text-align: center;
            margin-bottom: 20px;
          }
          .logo {
            width: 100px;
            height: 100px;
            border-radius: 8px;
          }
          h1 {
            color: #01A20E;
            border-bottom: 1px solid #ccc;
            padding-bottom: 10px;
            text-align: center;
          }
          .section {
            margin-top: 20px;
            margin-bottom: 20px;
          }
          .section-title {
            font-weight: bold;
            margin-bottom: 10px;
            color: #01A20E;
          }
          .data-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 5px;
          }
          .data-label {
            font-weight: bold;
          }
          .footer {
            margin-top: 30px;
            font-size: 0.8em;
            color: #666;
            border-top: 1px solid #eee;
            padding-top: 10px;
          }
          @media print {
            body {
              padding: 0;
            }
            button {
              display: none;
            }
            /* Hide URL/about:blank text */
            @page {
              margin: 0.5cm;
              size: auto;
            }
            html {
              height: 100%;
            }
            body {
              min-height: 100%;
            }
          }
        </style>
      </head>
      <body>
        <div class="logo-container">
          <img src="${"https://media.licdn.com/dms/image/v2/D560BAQF1Nom5iwfD_A/company-logo_200_200/company-logo_200_200/0/1731818635764/ecomflowhq_logo?e=2147483647&v=beta&t=PSvA40PxX8CO07WkEeRqrXzEQEyYTL-kI5oJsffwL1k"}" alt="EcomFlow Logo" class="logo" />
        </div>
        
        <h1>Inventory Threshold Analysis Results</h1>
        
        <div class="section">
          <div class="section-title">Threshold Levels</div>
          <div class="data-row">
            <span class="data-label">Low Threshold:</span>
            <span>${thresholds.low.toFixed(2)}</span>
          </div>
          <div class="data-row">
            <span class="data-label">Medium Threshold:</span>
            <span>${thresholds.medium.toFixed(2)}</span>
          </div>
          <div class="data-row">
            <span class="data-label">High Threshold:</span>
            <span>${thresholds.high.toFixed(2)}</span>
          </div>
        </div>
        
        <div class="section">
          <div class="section-title">Calculated Values</div>
          <div class="data-row">
            <span class="data-label">Lead Time Demand:</span>
            <span>${thresholds.leadTimeDemand.toFixed(2)}</span>
          </div>
          <div class="data-row">
            <span class="data-label">Safety Stock:</span>
            <span>${thresholds.safetyStock.toFixed(2)}</span>
          </div>
          <div class="data-row">
            <span class="data-label">Reorder Point:</span>
            <span>${thresholds.reorderPoint.toFixed(2)}</span>
          </div>
        </div>
        
        <div class="section">
          <div class="section-title">Parameters</div>
          <div class="data-row">
            <span class="data-label">Lead Time:</span>
            <span>${params.leadTime} days</span>
          </div>
          <div class="data-row">
            <span class="data-label">Safety Stock:</span>
            <span>${params.safetyStock}%</span>
          </div>
          <div class="data-row">
            <span class="data-label">Average Daily Sales:</span>
            <span>${params.averageDailySales.toFixed(2)}</span>
          </div>
          <div class="data-row">
            <span class="data-label">Demand Standard Deviation:</span>
            <span>${params.demandStdDev.toFixed(2)}</span>
          </div>
          <div class="data-row">
            <span class="data-label">Service Level:</span>
            <span>${getServiceLevel(params.zScore)} (Z-Score: ${params.zScore})</span>
          </div>
          <div class="data-row">
            <span class="data-label">Stockout Risk:</span>
            <span>${(1 - params.zScore * 0.1).toFixed(1)}%</span>
          </div>
        </div>
        
        <div class="footer">
          Export Date: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}
        </div>
        
        <script>
          window.onload = function() {
            window.print();
          }
          
          // Handle Escape key to close the window
          document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
              window.close();
            }
          });
        </script>
      </body>
      </html>
    `);

    printWindow.document.close();
  };

  const exportThresholds = (format: ExportFormat = "text") => {
    const formatNumber = (num: number) => num.toFixed(2);

    // Create a more detailed export with the new parameters
    const content = `Inventory Threshold Analysis Results

Threshold Levels:
Low Threshold: ${formatNumber(thresholds.low)}
Medium Threshold: ${formatNumber(thresholds.medium)} 
High Threshold: ${formatNumber(thresholds.high)}

Calculated Values:
Lead Time Demand: ${formatNumber(thresholds.leadTimeDemand)}
Safety Stock: ${formatNumber(thresholds.safetyStock)}
Reorder Point: ${formatNumber(thresholds.reorderPoint)}

Parameters:
Lead Time: ${params.leadTime} days
Safety Stock: ${params.safetyStock}%
Average Daily Sales: ${formatNumber(params.averageDailySales)}
Demand Standard Deviation: ${formatNumber(params.demandStdDev)}
Service Level: ${getServiceLevel(params.zScore)} (Z-Score: ${params.zScore})
Stockout Risk: ${(1 - params.zScore * 0.1).toFixed(1)}%

Export Date: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}
`;

    if (format === "text") {
      const blob = new Blob([content], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "inventory-thresholds.txt";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else if (format === "pdf") {
      // Set PDF content and open modal
      setPdfContent(createPdfContent());
      setIsPdfModalOpen(true);
    }
  };

  // PDF Preview Component
  const PDFPreview = () => {
    return (
      <div className="pdf-preview">
        <style jsx global>{`
          .pdf-container {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            padding: 20px;
            max-width: 100%;
            margin: 0 auto;
          }
          .logo-container {
            text-align: center;
            margin-bottom: 20px;
          }
          .logo {
            width: 100px;
            height: 100px;
            border-radius: 8px;
          }
          .pdf-container h1 {
            color: #01A20E;
            border-bottom: 1px solid #ccc;
            padding-bottom: 10px;
            text-align: center;
          }
          .section {
            margin-top: 20px;
            margin-bottom: 20px;
          }
          .section-title {
            font-weight: bold;
            margin-bottom: 10px;
            color: #01A20E;
          }
          .data-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 5px;
          }
          .data-label {
            font-weight: bold;
          }
          .footer {
            margin-top: 30px;
            font-size: 0.8em;
            color: #666;
            border-top: 1px solid #eee;
            padding-top: 10px;
          }
        `}</style>
        <div dangerouslySetInnerHTML={{ __html: pdfContent }} />
      </div>
    );
  };

  return (
    <div className="container mx-auto p-4 min-h-screen flex flex-col">
      <div className="flex items-center justify-between gap-3 mb-8">
        <div className="flex items-center gap-3">
          <Logo size="large" />
          <h1 className="text-3xl font-bold">Inventory Threshold Optimizer</h1>
        </div>
        <ThemeToggle />
      </div>

      <ResultsStep
        params={params}
        thresholds={thresholds}
        chartData={chartData}
        ordersData={ordersData}
        onParamChange={handleParamChange}
        exportThresholds={exportThresholds}
        getBarColor={getBarColor}
        getLeadTimeColor={getLeadTimeColor}
      />

      <Footer />
      
      {/* PDF Preview Modal */}
      <Dialog open={isPdfModalOpen} onOpenChange={setIsPdfModalOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>PDF Preview</DialogTitle>
          </DialogHeader>
          
          <div className="my-4 max-h-[70vh] overflow-y-auto">
            <PDFPreview />
          </div>
          
          <DialogFooter>
            <div className="flex justify-between items-center w-full">
              <div className="text-sm text-muted-foreground">
                Note: Headers/footers & URL will not appear in the final PDF
              </div>
              <Button variant="default" onClick={printPdf}>
                <Printer className="mr-2 h-4 w-4" />
                Save as PDF
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
