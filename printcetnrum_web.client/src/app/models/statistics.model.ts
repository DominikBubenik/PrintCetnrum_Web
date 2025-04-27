export interface BusinessOverview {
  totalOrders: number;
  totalRevenue: number;
  completedOrders: number;
  preparedOrders: number;
  pendingOrders: number;
  averageOrderValue: number;
}

export interface ChartData {
  name: string;
  value: number;
}
