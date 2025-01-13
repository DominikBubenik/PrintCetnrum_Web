import { Component } from '@angular/core';
import { OrderService } from '../../services/order.service';
import { Order } from '../../models/order-models/order.model';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { UserStoreService } from '../../services/user-store.service';

@Component({
  selector: 'app-all-orders-list',
  templateUrl: './all-orders-list.component.html',
  styleUrl: './all-orders-list.component.css'
})
export class AllOrdersListComponent {
  orders: Order[] = [];  
  isAdmin: boolean = false;
  constructor(
    private orderService: OrderService,
    private authService: AuthService,
    private userStore: UserStoreService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.userStore.getRoleFromStore().subscribe(role => {
      if (role) {
        this.isAdmin = role == 'Admin' ? true : false;
      } else {
        this.isAdmin = this.authService.getRoleFromToken() == 'Admin' ? true : false;
      }
    });
  }

  ngOnInit(): void {
    this.getAllOrders();
  }

  getAllOrders(): void {
    this.orderService.getOrders().subscribe(
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

  viewOrderDetails(orderId: number): void {
    this.router.navigate(['/order-details', orderId]);  // Navigate to order details page
  }

  markOrderAsCompleted(orderId: number): void {
    if (confirm('Are you sure you want to mark this order as completed?')) {
      this.orderService.getOrderById(orderId).subscribe((order) => {
        if (order.isPreparedForCustomer) {
          order.isTakenByCustomer = true;
          this.orderService.updateOrder(orderId, order).subscribe(
            () => {
              this.snackBar.open('Order marked as completed!', 'Close', {
                duration: 3000,
                horizontalPosition: 'center',
                verticalPosition: 'top',
                panelClass: 'app-notification-success'
              });
              this.getAllOrders();
            },
            (error) => {
              console.error('Error marking order as completed:', error);
              this.snackBar.open('Failed to mark order as completed!', 'Close', {
                duration: 3000,
                horizontalPosition: 'center',
                verticalPosition: 'top',
                panelClass: 'app-notification-error'
              });
            }
          );
        } else {
          this.snackBar.open('Order is not prepared!', 'Close', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
            panelClass: 'app-notification-error'
          });
        }
      });
    }
  }
}
