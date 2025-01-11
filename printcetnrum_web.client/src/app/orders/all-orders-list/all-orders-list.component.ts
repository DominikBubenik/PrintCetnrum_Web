import { Component } from '@angular/core';
import { OrderService } from '../../services/order.service';
import { Order } from '../../models/order-models/order.model';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-all-orders-list',
  templateUrl: './all-orders-list.component.html',
  styleUrl: './all-orders-list.component.css'
})
export class AllOrdersListComponent {
  orders: Order[] = [];  

  constructor(
    private orderService: OrderService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.getAllOrders();
  }

  getAllOrders(): void {
    var name = this.authService.getfullNameFromToken();
    this.orderService.getOrdersOfUser(name).subscribe(
      (orders) => {
        this.orders = orders; 
      },
      (error) => {
        console.error('Error fetching orders:', error);
      }
    );
  }

  deleteOrder(id: number): void {
    if (confirm('Are you sure you want to delete this order?')) {
      this.orderService.deleteOrder(id).subscribe(
        () => {
          this.snackBar.open('Order removed successfully!', 'Close', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
            panelClass: 'app-notification-success'
          });
          this.getAllOrders();
        }, (error) => {
          this.snackBar.open('Something went wrong!', 'Close', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
            panelClass: 'app-notification-error'
          });
        }
      );
    }
  }
}
