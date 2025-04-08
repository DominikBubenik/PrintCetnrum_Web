import { HttpClient } from '@angular/common/http';
import {inject, Injectable} from '@angular/core';
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class StatService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'https://localhost:7074/api/statistics';

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

  getFilesStatistics(): Observable<any> {
    return this.http.get(`${this.baseUrl}/user-files`);
  }
}
