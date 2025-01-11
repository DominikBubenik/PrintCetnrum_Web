import { Component } from '@angular/core';
import { OrderService } from '../../services/order.service';
import { Order } from '../../models/order-models/order.model';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-all-orders-list',
  templateUrl: './all-orders-list.component.html',
  styleUrl: './all-orders-list.component.css'
})
export class AllOrdersListComponent {
  orders: Order[] = [];
  totalPrice: number = 0;
  baseUrl = environment.apiUrl;
 

  constructor(private orderService: OrderService) { }

  ngOnInit(): void {
    //this.getOrdersByUserId(1); // Replace 1 with actual user ID (can be dynamically assigned)
  }

  // Fetch orders of a user
  //getOrdersByUserId(userId: number): void {
  //  this.orderService.getOrdersByUserId(userId).subscribe({
  //    next: (data) => {
  //      this.orders = data;
  //      this.calculateTotalPrice();
  //    },
  //    error: (err) => {
  //      console.error('Error fetching orders', err);
  //    }
  //  });
  //}

  // Calculate total price for all orders
  calculateTotalPrice(): void {
   // this.totalPrice = this.orders.reduce((sum, order) => sum + order.totalPrice, 0);
  }

  // Check if file is an image based on its extension
  isImage(extension: string): boolean {
    return ['.jpg', '.jpeg', '.png', '.gif'].includes(extension.toLowerCase());
  }

  // Method to submit order (can be further implemented based on requirements)
  submitOrder(): void {
    console.log('Order submitted');
  }
}
