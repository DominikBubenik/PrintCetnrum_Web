import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Order, OrderItem } from '../models/order-models/order.model';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private baseUrl = 'https://localhost:7074/api/Order/'

  constructor(private http: HttpClient, private authService: AuthService) { }

  createOrder(order: Order): Observable<Order> {
    const userName = this.authService.getfullNameFromToken();
    const params = new HttpParams().set('userName', userName);
    return this.http.post<Order>(`${this.baseUrl}create-order`, order, { params });
  }

  addOrderItems(orederName: string, orderItems: OrderItem[]): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}add-order-items?orderName=${orederName}`, orderItems);
  }

  getOrderItems(id: number): Observable<OrderItem[]> {
    return this.http.get<OrderItem[]>(`${this.baseUrl}get-order-items/${id}`);
  }

  getOrderById(id: number): Observable<Order> {
    return this.http.get<Order>(`${this.baseUrl}get-order/${id}`);
  }

  getOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.baseUrl}get-orders/${this.authService.getfullNameFromToken()}`);
  }

  updateOrder(id: number, order: Order): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}update-order/${id}`, order);
  }

  updateOrderPrice(id: number, newPrice: number): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}update-price/${id}`, newPrice);
  }

  deleteOrder(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}delete-order/${id}`);
  }

  removeOrderItem(itemId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}delete-order-item/${itemId}`);
  }

}
