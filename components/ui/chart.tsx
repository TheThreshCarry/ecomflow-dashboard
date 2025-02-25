"use client"

import * as React from "react"
import { Card, CardHeader } from "@/components/ui/card"

export const ChartCard = Card

export const ChartHeader = CardHeader

export const ChartContainer = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={className} {...props} />,
)
ChartContainer.displayName = "ChartContainer"

