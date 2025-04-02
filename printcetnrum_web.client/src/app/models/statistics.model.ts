export interface BusinessOverview {
  totalOrders: number;
  totalRevenue: number;
  completedOrders: number;
  preparedOrders: number;
  pendingOrders: number;
  averageOrderValue: number;
}

export interface SalesTrend {
  name: string;
  value: number;
}
