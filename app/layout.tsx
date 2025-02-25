import type { Metadata } from 'next'
import './globals.css'
import { InventoryProvider } from './providers'

export const metadata: Metadata = {
  title: 'Inventory Threshold Optimizer',
  description: 'Optimize your inventory levels with data-driven thresholds',
  generator: 'v0.dev',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        <InventoryProvider>
          {children}
        </InventoryProvider>
      </body>
    </html>
  )
}
