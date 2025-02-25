/**
 * Configuration for chart data processing and display
 */

export const chartConfig = {
  /**
   * Maximum number of data points to display in time series charts
   * When data exceeds this number, points will be averaged
   */
  maxTimeSeriesPoints: 100,
  
  /**
   * Maximum number of products to display individually in distribution charts
   * When products exceed this number, smallest ones are grouped into "Others"
   */
  maxProductsToShow: 7,
  
  /**
   * Maximum number of products to show in top products bar chart
   */
  maxTopProducts: 10
}; 