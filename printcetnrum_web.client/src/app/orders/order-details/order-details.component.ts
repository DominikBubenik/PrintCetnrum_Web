import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { OrderService } from '../../services/order.service';
import { Order, OrderItem } from '../../models/order-models/order.model';

@Component({
  selector: 'app-order-details',
  templateUrl: './order-details.component.html',
  styleUrls: ['./order-details.component.css']
})
export class OrderDetailsComponent implements OnInit {
  order: Order | null = null;
  orderItems: OrderItem[] = [];

  constructor(
    private route: ActivatedRoute,
    private orderService: OrderService
  ) { }

  ngOnInit(): void {
    // Get the order ID from the URL parameters
    const orderId = Number(this.route.snapshot.paramMap.get('id'));
    if (orderId) {
      this.getOrderDetails(orderId);
    }
  }

  getOrderDetails(orderId: number): void {
    this.orderService.getOrderById(orderId).subscribe(
      (order) => {
        this.order = order;
        console.log('Order details:', order);
        this.orderService.getOrderItems(orderId).subscribe(
          (data) => {
            this.orderItems = data;
          }
        );
      },
      (error) => {
        console.error('Error fetching order details:', error);
      }
    );
    
  }
}
