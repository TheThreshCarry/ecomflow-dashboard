import { type InventoryData, inventoryDataSchema } from "./schemas"

export class CSVController {
  static async parseCSV(file: File): Promise<{ data: InventoryData[]; error: string | null }> {
    try {
      const text = await file.text()
      const rows = text.split("\n")
      const headers = rows[0].split(",").map((header) => header.trim())

      const parsedRows = rows
        .slice(1)
        .filter((row) => row.trim() !== "")
        .map((row) => {
          const values = row.split(",").map((value) => value.trim())
          return headers.reduce(
            (obj, header, index) => {
              obj[header] = values[index]
              return obj
            },
            {} as Record<string, string>,
          )
        })

      const validationResult = inventoryDataSchema.safeParse(parsedRows)

      if (!validationResult.success) {
        const errors = validationResult.error.errors.map((err) => `${err.path.join(".")}: ${err.message}`).join("; ")
        return { data: [], error: `Validation failed: ${errors}` }
      }

      return { data: validationResult.data, error: null }
    } catch (error) {
      return {
        data: [],
        error: error instanceof Error ? error.message : "Failed to parse CSV file",
      }
    }
  }

  static validateHeaders(headers: string[]): boolean {
    const requiredHeaders = ["product_id", "product_name", "date", "inventory_level", "orders", "lead_time_days"]
    return requiredHeaders.every((header) => headers.includes(header))
  }
}

