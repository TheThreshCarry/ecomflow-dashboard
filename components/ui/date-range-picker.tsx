"use client"

import * as React from "react"
import { addDays, format, startOfDay, endOfDay } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface DateRangePickerProps {
  dateRange: DateRange | undefined;
  onDateRangeChange: (range: DateRange | undefined) => void;
  minDate?: Date;
  maxDate?: Date;
  className?: string;
}

export function DateRangePicker({
  dateRange,
  onDateRangeChange,
  minDate,
  maxDate,
  className
}: DateRangePickerProps) {
  
  // Function to handle preset selection
  const handlePresetChange = (value: string) => {
    const today = new Date()
    
    if (value === "last7days") {
      const from = addDays(today, -7)
      onDateRangeChange({
        from: startOfDay(from),
        to: endOfDay(today)
      })
    } else if (value === "last3days") {
      const from = addDays(today, -30)
      onDateRangeChange({
        from: startOfDay(from),
        to: endOfDay(today)
      })
    } else if (value === "last7days") {
      const from = addDays(today, -14)
      const to = addDays(today, -7)
      onDateRangeChange({
        from: startOfDay(from),
        to: endOfDay(to)
      })
    } else if (value === "last30days") {
      const from = addDays(today, -30)
      onDateRangeChange({
        from: startOfDay(from),
        to: endOfDay(today)
      })
    } else if (value === "last60days") {
      const from = addDays(today, -60)
      onDateRangeChange({
        from: startOfDay(from),
        to: endOfDay(today)
      })
    } else if (value === "last90days") {
      const from = addDays(today, -90)
      onDateRangeChange({
        from: startOfDay(from),
        to: endOfDay(today)
      })

    } else if (value === "all") {
      onDateRangeChange({
        from: minDate ? startOfDay(minDate) : undefined,
        to: maxDate ? endOfDay(maxDate) : undefined
      })
    }
  }

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-[300px] justify-start text-left font-normal",
              !dateRange && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dateRange?.from ? (
              dateRange.to ? (
                <>
                  {format(dateRange.from, "LLL dd, y")} -{" "}
                  {format(dateRange.to, "LLL dd, y")}
                </>
              ) : (
                format(dateRange.from, "LLL dd, y")
              )
            ) : (
              <span>Select date range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="p-3 space-y-3">
            <Select
              onValueChange={handlePresetChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select range preset" />
              </SelectTrigger>
              <SelectContent position="popper">
                <SelectItem value="last3days">Last 3 days</SelectItem>
                <SelectItem value="lastWeek">Last Week</SelectItem>
                <SelectItem value="last30days">Last 30 days</SelectItem>
                <SelectItem value="last60days">Last 60 days</SelectItem>
                <SelectItem value="last90days">Last 90 days</SelectItem>
                <SelectItem value="all">All data</SelectItem>
              </SelectContent>
            </Select>
            <div className="border rounded-md p-3">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={onDateRangeChange}
                numberOfMonths={2}
                disabled={(date: Date) => 
                  (minDate ? date < minDate : false) || 
                  (maxDate ? date > maxDate : false)
                }
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
} 