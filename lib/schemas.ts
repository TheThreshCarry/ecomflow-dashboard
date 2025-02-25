import { z } from "zod"

export const inventoryRowSchema = z.object({
  product_id: z.string(),
  product_name: z.string(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format. Use YYYY-MM-DD"),
  inventory_level: z.coerce.number().min(0, "Inventory level must be positive"),
  orders: z.coerce.number().min(0, "Orders must be positive"),
  lead_time_days: z.coerce.number().min(0, "Lead time must be positive"),
})

export const inventoryDataSchema = z.array(inventoryRowSchema)

export type InventoryData = z.infer<typeof inventoryRowSchema>

