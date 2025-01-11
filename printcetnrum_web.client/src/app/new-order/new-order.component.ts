import { Component, OnInit } from '@angular/core';
import { FileHandlerService } from '../services/file-handler.service';
import { AuthService } from '../services/auth.service';
import { UserFile } from '../models/user-file';
import { Order, OrderItem } from '../models/order-models/order.model';
import { environment } from '../../environments/environment';
import { BehaviorSubject } from 'rxjs';
import { OrderService } from '../services/order.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-new-order',
  templateUrl: './new-order.component.html',
  styleUrls: ['./new-order.component.css']
})
export class NewOrderComponent implements OnInit {
  files: UserFile[] = [];
  order!: Order;
  orderItems: OrderItem[] = []; 
  totalPrice: number = 0;
  pricePerFile: number = 5;
  baseUrl = environment.apiUrl;

  constructor(
    private fileHandlerService: FileHandlerService,
    private orderService: OrderService,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.fetchFiles();
  }

  fetchFiles(): void {
    this.fileHandlerService.fetchFiles().subscribe(files => {
      this.files = files.filter(file => file.shouldPrint);
      this.initializeOrder();
      console.log(this.order);
      if (this.order) {
        this.initializeOrderDetails();
      }
    });
  }

  initializeOrder(): void {
    this.order = {
      orderCreated: new Date(),
      orderName: 'ff',
      isPreparedForCustomer: false,
      isTakenByCustomer: false,
      totalPrice: 0,
      //orderItems: this.orderItems,
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


    console.log(this.orderItems);
    //this.order.orderItems = this.orderItems;
    this.orderService.createOrder(this.order).subscribe(
      (createdOrder) => {
        console.log('Order created successfully:', createdOrder);
        this.orderService.addOrderItems(createdOrder.orderName, this.orderItems).subscribe(
          () => {
            console.log('Order items added successfully');
          },
          (error) => {
            console.log('Error adding order items:', error);
          }
        );
      },
      (error) => {
        console.error('Error creating order:', error);
        alert('An error occurred while creating the order. Please try again.');
      }
    );
  }
}
