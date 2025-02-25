import { useState } from "react"
import { useDropzone } from "react-dropzone"
import { Upload, AlertCircle, ChevronDown, ChevronUp, SkipForward } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CSVController } from "@/lib/csv-controller"
import type { InventoryData } from "@/lib/schemas"

interface UploadStepProps {
  onBack: () => void;
  onNext: (data: InventoryData[]) => void;
  onFileValidated: (data: InventoryData[]) => void;
  setError: (error: string) => void;
  error: string;
}

export function UploadStep({ onBack, onNext, onFileValidated, setError, error }: UploadStepProps) {
  const [fileUploaded, setFileUploaded] = useState(false)
  const [parsedData, setParsedData] = useState<InventoryData[]>([])
  const [showFullError, setShowFullError] = useState(false)
  const [rawFile, setRawFile] = useState<File | null>(null)

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      "text/csv": [".csv"],
    },
    onDrop: async (acceptedFiles) => {
      const file = acceptedFiles[0]
      setRawFile(file)
      const { data: parsedData, error: parseError } = await CSVController.parseCSV(file)

      if (parseError) {
        setError(parseError)
        return
      }

      setFileUploaded(true)
      setParsedData(parsedData)
      onFileValidated(parsedData)
      setError("")
    },
  })

  // Function to skip validation errors and process the file anyway
  const handleSkipErrors = async () => {
    if (!rawFile) return
    
    try {
      // Force parse the CSV file without strict validation
      const { data } = await CSVController.parseCSV(rawFile, true)
      
      setFileUploaded(true)
      setParsedData(data)
      onFileValidated(data)
      setError("")
    } catch (err) {
      setError("Failed to process the file even with validation disabled.")
    }
  }

  // Format error message to show limited lines
  const formatErrorMessage = () => {
    if (!error) return null

    // Split error message by semicolons to separate individual validation errors
    const errorLines = error.replace("Validation failed: ", "").split("; ")
    
    if (errorLines.length <= 3 || showFullError) {
      return error
    }
    
    // Show only first 3 error lines if not expanded
    return (
      <>
        {`Validation failed: ${errorLines.slice(0, 3).join("; ")}`}
        <div className="mt-2">
          <span className="text-xs text-destructive">
            ...and {errorLines.length - 3} more errors
          </span>
        </div>
      </>
    )
  }

  return (
    <Card className="mx-auto max-w-3xl">
      <CardHeader>
        <CardTitle>Step 1: Upload Your Inventory Data</CardTitle>
        <CardDescription>Upload a CSV file with your inventory and order data</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors
            ${isDragActive ? "border-primary bg-primary/10" : fileUploaded ? "border-success bg-success/10" : "border-muted-foreground/25"}`}
        >
          <input {...getInputProps()} />
          {fileUploaded ? (
            <>
              <div className="mx-auto h-12 w-12 mb-4 text-success rounded-full bg-success/20 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6L9 17l-5-5"/>
                </svg>
              </div>
              <p className="font-medium text-success">File uploaded successfully!</p>
            </>
          ) : (
            <>
              <Upload className="mx-auto h-12 w-12 mb-4 text-muted-foreground" />
              {isDragActive ? <p className="font-medium">Drop the file here</p> : <p>Drag and drop a CSV file here, or click to select</p>}
            </>
          )}
        </div>
        
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle className="flex justify-between items-center">
              <span>Error</span>
              <div className="flex gap-2">
                {/* Toggle show more/less */}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-7 px-2 text-xs"
                  onClick={() => setShowFullError(!showFullError)}
                >
                  {showFullError ? (
                    <>Show Less <ChevronUp className="ml-1 h-3 w-3" /></>
                  ) : (
                    <>Show More <ChevronDown className="ml-1 h-3 w-3" /></>
                  )}
                </Button>
                
                {/* Skip errors button */}
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-7 px-2 text-xs"
                  onClick={handleSkipErrors}
                >
                  <SkipForward className="mr-1 h-3 w-3" /> Skip Faulty Fields
                </Button>
              </div>
            </AlertTitle>
            <AlertDescription>
              {formatErrorMessage()}
            </AlertDescription>
          </Alert>
        )}
        
        <div className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={onBack}
          >
            Back
          </Button>
          <Button 
            onClick={() => onNext(parsedData)}
            disabled={!fileUploaded}
          >
            Continue to Configuration
          </Button>
        </div>
      </CardContent>
    </Card>
  )
} 