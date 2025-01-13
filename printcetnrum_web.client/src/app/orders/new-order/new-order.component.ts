import { Component, OnInit } from '@angular/core';
import { FileHandlerService } from '../../services/file-handler.service';
import { AuthService } from '../../services/auth.service';
import { UserFile } from '../../models/user-file';
import { Order, OrderItem } from '../../models/order-models/order.model';
import { environment } from '../../../environments/environment';
import { BehaviorSubject } from 'rxjs';
import { OrderService } from '../../services/order.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackBarUtil } from '../../shared/snackbar-util';

@Component({
  selector: 'app-new-order',
  templateUrl: './new-order.component.html',
  styleUrls: ['./new-order.component.css']
})
export class NewOrderComponent implements OnInit {
  files: UserFile[] = [];
  order?: Order = undefined;
  orderItems: OrderItem[] = [];
  totalPrice: number = 0;
  pricePerFile: number = 5;
  baseUrl = environment.apiUrl;

  constructor(
    private fileHandlerService: FileHandlerService,
    private orderService: OrderService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.fetchFiles();
  }

  fetchFiles(): void {
    this.fileHandlerService.fetchFiles().subscribe(
      files => {
        this.files = files.filter(file => file.shouldPrint);
        this.initializeOrder();
        if (this.order) {
          this.initializeOrderDetails();
        }
      },
      error => {
        console.error('Error fetching files:', error);
        SnackBarUtil.showSnackBar(this.snackBar, 'Failed to fetch files!', 'error');
      }
    );
  }

  initializeOrder(): void {
    this.order = {
      id: 0,
      orderCreated: new Date(),
      orderItems: [],
      orderName: 'ff',
      isPreparedForCustomer: false,
      isTakenByCustomer: false,
      totalPrice: 0,
      orderFinished: undefined,
      orderTakenTime: undefined,
      userId: 0
    };
  }

  initializeOrderDetails(): void {
    this.orderItems = this.files.map(file => ({
      orderId: 0,
      userFileId: file.id,
      userFile: file,
      count: 1,
      color: 'black',
      paperType: 'regular',
      size: 'A4',
      price: 5,
      description: ''
    }));
  }

  calculateTotalPrice(): void {
    this.totalPrice = this.orderItems.reduce((sum, order) => sum + order.price, 0);
  }

  isImage(extension: string): boolean {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff'];
    return imageExtensions.includes(extension.toLowerCase());
  }

  submitOrder(): void {
    if (!this.order) {
      return;
    }
    this.orderService.createOrder(this.order).subscribe(
      (createdOrder) => {
        this.orderService.addOrderItems(createdOrder.orderName, this.orderItems).subscribe(
          () => {
            this.order = undefined;
            SnackBarUtil.showSnackBar(this.snackBar, 'Order created successfully!', 'success');
            this.router.navigate(['/allOrders']);
          },
          (error) => {
            console.error('Error adding order items:', error);
            SnackBarUtil.showSnackBar(this.snackBar, 'Failed to add order items!', 'error');
          }
        );
      },
      (error) => {
        console.error('Error creating order:', error);
        SnackBarUtil.showSnackBar(this.snackBar, 'Creating order failed!', 'error');
      }
    );
  }
}
