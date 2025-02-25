import { useState } from "react";
import { useDropzone } from "react-dropzone";
import {
  Upload,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  SkipForward,
  FileCheck,
  FileWarning,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CSVController } from "@/lib/csv-controller";
import type { InventoryData } from "@/lib/schemas";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Logo } from "../ui/logo";

interface UploadStepProps {
  onBack: () => void;
  onNext: (data: InventoryData[]) => void;
  onFileValidated: (data: InventoryData[]) => void;
  setError: (error: string) => void;
  error: string;
}

export function UploadStep({
  onBack,
  onNext,
  onFileValidated,
  setError,
  error,
}: UploadStepProps) {
  const [fileUploaded, setFileUploaded] = useState(false);
  const [parsedData, setParsedData] = useState<InventoryData[]>([]);
  const [showFullError, setShowFullError] = useState(false);
  const [rawFile, setRawFile] = useState<File | null>(null);
  const [isLoadingClean, setIsLoadingClean] = useState(false);
  const [isLoadingErrors, setIsLoadingErrors] = useState(false);

  // Function to load mock data
  const loadMockData = async (variant: "clean" | "errors") => {
    // Reset file uploaded status when starting to load new data
    setFileUploaded(false);

    if (variant === "clean") {
      setIsLoadingClean(true);
    } else {
      setIsLoadingErrors(true);
    }

    try {
      const filename =
        variant === "clean" ? "mock-clean.csv" : "mock-errors.csv";
      const response = await fetch(`/data/${filename}`);
      const csvText = await response.text();

      // Create a File object from the fetched data
      const file = new File([csvText], filename, { type: "text/csv" });
      setRawFile(file);

      // Parse the CSV with validation
      const { data, error: parseError } = await CSVController.parseCSV(
        file,
        false
      );

      if (parseError) {
        setError(parseError);
        // If this is the error variant, still allow to proceed with skip errors
        if (variant === "errors") {
          // Auto-handle skip errors for demo purposes with error file
          const { data: skipValidationData } = await CSVController.parseCSV(
            file,
            true
          );
          setFileUploaded(true);
          setParsedData(skipValidationData);
          onFileValidated(skipValidationData);
        }

        if (variant === "clean") {
          setIsLoadingClean(false);
        } else {
          setIsLoadingErrors(false);
        }

        return;
      }

      setFileUploaded(true);
      setParsedData(data);
      onFileValidated(data);
      setError("");
    } catch (err) {
      setError(
        `Failed to load mock data: ${
          err instanceof Error ? err.message : String(err)
        }`
      );
    } finally {
      if (variant === "clean") {
        setIsLoadingClean(false);
      } else {
        setIsLoadingErrors(false);
      }
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      "text/csv": [".csv"],
    },
    onDrop: async (acceptedFiles) => {
      // Reset file uploaded status when dropping a new file
      setFileUploaded(false);

      const file = acceptedFiles[0];
      setRawFile(file);
      const { data: parsedData, error: parseError } =
        await CSVController.parseCSV(file);

      if (parseError) {
        setError(parseError);
        return;
      }

      setFileUploaded(true);
      setParsedData(parsedData);
      onFileValidated(parsedData);
      setError("");
    },
  });

  // Function to skip validation errors and process the file anyway
  const handleSkipErrors = async () => {
    if (!rawFile) return;

    try {
      // Force parse the CSV file without strict validation
      const { data } = await CSVController.parseCSV(rawFile, true);

      setFileUploaded(true);
      setParsedData(data);
      onFileValidated(data);
      setError("");
    } catch (err) {
      setError("Failed to process the file even with validation disabled.");
    }
  };

  // Format error message to show limited lines
  const formatErrorMessage = () => {
    if (!error) return null;

    // Split error message by semicolons to separate individual validation errors
    const errorLines = error.replace("Validation failed: ", "").split("; ");

    if (errorLines.length <= 3 || showFullError) {
      return error;
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
    );
  };

  return (
    <Card className="mx-auto max-w-3xl">
      <CardHeader className="flex flex-col items-center justify-between gap-4">
        <Logo size="large" />
        <div className="flex items-center gap-2 w-full">
          <div>
            <CardTitle>Step 1: Upload Inventory Data</CardTitle>
            <CardDescription>
              Upload a CSV file with your inventory and order data to begin
              analysis
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors
            ${
              isDragActive
                ? "border-primary bg-primary/10"
                : fileUploaded
                ? error
                  ? "border-destructive bg-destructive/10"
                  : "border-success bg-success/10"
                : "border-muted-foreground/25"
            }`}
        >
          <input {...getInputProps()} />
          {fileUploaded ? (
            error ? (
              <>
                <div className="mx-auto h-12 w-12 mb-4 text-destructive rounded-full bg-destructive/20 flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M18 6L6 18" />
                    <path d="M6 6l12 12" />
                  </svg>
                </div>
                <p className="font-medium text-destructive">
                  File has validation errors
                </p>
              </>
            ) : (
              <>
                <div className="mx-auto h-12 w-12 mb-4 text-success rounded-full bg-success/20 flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                </div>
                <p className="font-medium text-success">
                  File uploaded successfully!
                </p>
              </>
            )
          ) : (
            <>
              <Upload className="mx-auto h-12 w-12 mb-4 text-muted-foreground" />
              {isDragActive ? (
                <p className="font-medium">Drop the file here</p>
              ) : (
                <p>Drag and drop a CSV file here, or click to select</p>
              )}
            </>
          )}
        </div>

        {/* Mock Data Section */}
        <div className="p-4 sm:p-5 border border-border rounded-lg bg-muted/20">
          <h3 className="text-sm sm:text-base font-medium mb-1 sm:mb-2">
            🚀 Quick Start with Sample Data
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
            No data to upload? Try our sample datasets to explore the app's
            features:
          </p>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex-1 py-3 sm:py-4 border-success/50 hover:border-success hover:bg-success/10"
                    onClick={() => loadMockData("clean")}
                    disabled={isLoadingClean}
                  >
                    <div className="flex items-center justify-center gap-2">
                      {isLoadingClean ? (
                        <>
                          <div className="h-4 w-4 sm:h-5 sm:w-5 animate-spin rounded-full border-2 border-dotted border-success"></div>
                          <span className="text-sm sm:text-base font-medium">
                            Loading...
                          </span>
                        </>
                      ) : (
                        <>
                          <FileCheck className="h-4 w-4 sm:h-5 sm:w-5 text-success" />
                          <span className="text-sm sm:text-base font-medium">
                            Clean Sample Data
                          </span>
                        </>
                      )}
                    </div>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="p-2" glass>
                  <p className="text-xs">
                    Perfect for quick testing - loads clean data without
                    validation errors
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex-1 py-3 sm:py-4 border-amber/50 hover:border-amber hover:bg-amber/10"
                    onClick={() => loadMockData("errors")}
                    disabled={isLoadingErrors}
                  >
                    <div className="flex items-center justify-center gap-2">
                      {isLoadingErrors ? (
                        <>
                          <div className="h-4 w-4 sm:h-5 sm:w-5 animate-spin rounded-full border-2 border-dotted border-amber"></div>
                          <span className="text-sm sm:text-base font-medium">
                            Loading...
                          </span>
                        </>
                      ) : (
                        <>
                          <FileWarning className="h-4 w-4 sm:h-5 sm:w-5 text-amber" />
                          <span className="text-sm sm:text-base font-medium">
                            Data with Errors
                          </span>
                        </>
                      )}
                    </div>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="p-2" glass>
                  <p className="text-xs">
                    Test error handling - loads data with validation issues
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
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
                    <>
                      Show Less <ChevronUp className="ml-1 h-3 w-3" />
                    </>
                  ) : (
                    <>
                      Show More <ChevronDown className="ml-1 h-3 w-3" />
                    </>
                  )}
                </Button>
              </div>
            </AlertTitle>
            <AlertDescription>{formatErrorMessage()}</AlertDescription>
          </Alert>
        )}

        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={onBack}
            disabled={isLoadingClean || isLoadingErrors}
          >
            Back
          </Button>
          <Button
            onClick={() => (error ? handleSkipErrors() : onNext(parsedData))}
            disabled={!fileUploaded || isLoadingClean || isLoadingErrors}
          >
            {error
              ? "Continue with Skipped Errors"
              : "Continue to Configuration"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
