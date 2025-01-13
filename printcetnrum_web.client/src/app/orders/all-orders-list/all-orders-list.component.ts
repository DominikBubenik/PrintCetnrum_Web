import { Component } from '@angular/core';
import { OrderService } from '../../services/order.service';
import { Order } from '../../models/order-models/order.model';
import { AuthService } from '../../services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { UserStoreService } from '../../services/user-store.service';
import { SnackBarUtil } from '../../shared/snackbar-util';


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
        this.isAdmin = role === 'Admin';
      } else {
        this.isAdmin = this.authService.getRoleFromToken() === 'Admin';
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
        SnackBarUtil.showSnackBar(this.snackBar, 'Error fetching orders. Please try again.', 'error');
      }
    );
  }

  deleteOrder(id: number): void {
    if (confirm('Are you sure you want to delete this order?')) {
      this.orderService.deleteOrder(id).subscribe(
        () => {
          SnackBarUtil.showSnackBar(this.snackBar, 'Order removed successfully!', 'success');
          this.getAllOrders();
        },
        () => {
          SnackBarUtil.showSnackBar(this.snackBar, 'Something went wrong!', 'error');
        }
      );
    }
  }

  viewOrderDetails(orderId: number): void {
    this.router.navigate(['/order-details', orderId]);
  }

  markOrderAsCompleted(orderId: number): void {
    if (confirm('Are you sure you want to mark this order as completed?')) {
      this.orderService.getOrderById(orderId).subscribe((order) => {
        if (order.isPreparedForCustomer) {
          order.isTakenByCustomer = true;
          this.orderService.updateOrder(orderId, order).subscribe(
            () => {
              SnackBarUtil.showSnackBar(this.snackBar, 'Order marked as completed!', 'success');
              this.getAllOrders();
            },
            (error) => {
              console.error('Error marking order as completed:', error);
              SnackBarUtil.showSnackBar(this.snackBar, 'Failed to mark order as completed!', 'error');
            }
          );
        } else {
          SnackBarUtil.showSnackBar(this.snackBar, 'Order is not prepared!', 'error');
        }
      });
    }
  }
}
