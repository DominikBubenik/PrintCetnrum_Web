import { Component, inject, OnInit } from '@angular/core';
import { FileHandlerService } from '../../services/file-services/file-handler.service';
import { UserFile } from '../../models/user-models/user-file';
import { Order, OrderItem } from '../../models/order-models/order.model';
import { environment } from '../../../environments/environment';
import { forkJoin } from 'rxjs';
import { OrderService } from '../../services/order-services/order.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackBarUtil } from '../../shared/snackbar-util';
import { DesignFilesHandlerService } from '../../services/file-services/design-files-handler.service';

@Component({
  selector: 'app-new-order',
  templateUrl: './new-order.component.html',
  styleUrls: ['./new-order.component.css']
})
export class NewOrderComponent implements OnInit {
  private designFileService = inject(DesignFilesHandlerService);

  files: UserFile[] = [];
  order?: Order = undefined;
  orderItems: OrderItem[] = [];
  totalPrice: number = 0;
  pricePerFile: number = 5;
  baseUrl = environment.apiUrl;

  constructor(
    private fileHandlerService: FileHandlerService,
    private orderService: OrderService,
    private snackBar: MatSnackBar,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.fetchFiles();
  }

  fetchFiles(): void {
    const regularFiles$ = this.fileHandlerService.fetchFiles();
    const stamps$ = this.designFileService.getUserStamps();
    const diplomas$ = this.designFileService.getUserDiplomas();

    forkJoin([regularFiles$, stamps$, diplomas$]).subscribe({
      next: ([regularFiles, stamps, diplomas]) => {
        stamps.forEach(file => file.isStamp = true);
        diplomas.forEach(file => file.isDiploma = true);
        this.files = [
          ...regularFiles.filter(file => file.shouldPrint),
          ...stamps.filter(file => file.shouldPrint),
          ...diplomas.filter(file => file.shouldPrint)
        ];
        console.log(this.files);
        this.initializeOrder();

        if (this.order) {
          this.initializeOrderDetails();
        }
      },
      error: (err) => {
        SnackBarUtil.showSnackBar(this.snackBar, 'Failed to fetch files!', 'error');
        console.error('File fetch error:', err);
      }
    });
  }

  initializeOrder(): void {
    this.order = {
      id: 0,
      orderCreated: new Date(),
      orderItems: [],
      orderName: 'new',
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
      isDesignFile: file.isDiploma || file.isStamp ? true : false,
      count: 1,
      color: 'black',
      paperType: 'regular',
      size: 'A4',
      price: 0,
      description: ''
    }));
  }

  calculateTotalPrice(): void {
    this.totalPrice = this.orderItems.reduce((sum, order) => sum + order.price, 0);
  }

  isImage(extension: string): boolean {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff'];
    return imageExtensions.includes(extension?.toLowerCase());
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

  getFileIcon(extension: string): string {
    switch (extension) {
      case '.pdf':
        return 'bi bi-filetype-pdf pdf';
      case '.doc':
      case '.docx':
        return 'bi bi-file-earmark-word word';
      case '.xls':
      case '.xlsx':
        return 'bi bi-filetype-xlsx excel';
      default:
        return 'bi bi-file-earmark-text';
    }
  }
}
