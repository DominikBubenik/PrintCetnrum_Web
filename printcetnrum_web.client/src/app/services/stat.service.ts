import { HttpClient } from '@angular/common/http';
import {inject, Injectable} from '@angular/core';
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class StatService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'https://localhost:7074/api/statistics';
  private businessOverviewData = {
    TotalOrders: 458,
    TotalRevenue: 27540.50,
    PendingOrders: 32,
    CompletedOrders: 426
  };

  private salesTrendsData = {
    TodaySales: 2450.75,
    WeeklySales: 18430.25,
    MonthlySales: 27540.50
  };

  private topProductsData = [
    { ProductName: 'Coffee Machine Deluxe', Sales: 45, Revenue: 6750.00 },
    { ProductName: 'Premium Coffee Beans 1kg', Sales: 120, Revenue: 3600.00 },
    { ProductName: 'Ceramic Coffee Mug Set', Sales: 85, Revenue: 2125.00 },
    { ProductName: 'French Press 32oz', Sales: 38, Revenue: 1900.00 },
    { ProductName: 'Espresso Machine Pods', Sales: 210, Revenue: 1680.00 }
  ];

  private newCustomersData = {
    NewCustomers: [
      { Name: 'John Doe', Date: '2025-03-30', Orders: 2 },
      { Name: 'Jane Smith', Date: '2025-03-29', Orders: 1 },
      { Name: 'Robert Johnson', Date: '2025-03-28', Orders: 3 },
      { Name: 'Emily Davis', Date: '2025-03-28', Orders: 1 },
      { Name: 'Michael Wilson', Date: '2025-03-27', Orders: 2 }
    ]
  };

  private orderStatusData = {
    PreparedOrders: 12,
    TakenOrders: 20,
    FinishedOrders: 426
  };
  getBusinessOverview(): Observable<any> {
    return this.http.get(`${this.baseUrl}/overview`);
  }

  getSalesTrends(): Observable<any> {
    return this.http.get(`${this.baseUrl}/sales-trends`);
  }

  getTopProducts(): Observable<any> {
    return this.http.get(`${this.baseUrl}/top-products`);
  }

  getNewCustomers(): Observable<any> {
    return this.http.get(`${this.baseUrl}/new-customers`);
  }

  getOrderStatus(): Observable<any> {
    return this.http.get(`${this.baseUrl}/order-status`);
  }
}
