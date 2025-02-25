import type { Metadata } from 'next'
import './globals.css'
import { InventoryProvider } from './providers'
import { ThemeProvider } from '@/components/theme-provider'

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
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <InventoryProvider>
            {children}
          </InventoryProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
