import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { OrderService } from '../../services/order.service';
import { Order, OrderItem } from '../../models/order-models/order.model';
import { FileHandlerService } from '../../services/file-handler.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../services/auth.service';
import { UserStoreService } from '../../services/user-store.service';
import { SnackBarUtil } from '../../shared/snackbar-util';


@Component({
  selector: 'app-order-details',
  templateUrl: './order-details.component.html',
  styleUrls: ['./order-details.component.css']
})
export class OrderDetailsComponent implements OnInit {
  order: Order | null = null;
  orderItems: OrderItem[] = [];
  isAdmin: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private orderService: OrderService,
    private fileService: FileHandlerService,
    private snackBar: MatSnackBar,
    private auth: AuthService,
    private userStore: UserStoreService
  ) { }

  ngOnInit(): void {
    const orderId = Number(this.route.snapshot.paramMap.get('id'));
    if (orderId) {
      this.getOrderDetails(orderId);
    }
    this.userStore.getRoleFromStore().subscribe(role => {
      if (role) {
        this.isAdmin = role === 'Admin';
      } else {
        this.isAdmin = this.auth.getRoleFromToken() === 'Admin';
      }
    });
  }

  saveOrderChanges(): void {
    if (this.order) {
      this.orderService.updateOrder(this.order.id, this.order).subscribe(
        () => {
          SnackBarUtil.showSnackBar(this.snackBar, 'Order changes saved successfully!', 'success');
        },
        (error) => {
          console.error('Error saving order changes:', error);
          SnackBarUtil.showSnackBar(this.snackBar, 'Failed to save order changes!', 'error');
        }
      );
    }
  }

  markOrderAsPrepared(value: boolean): void {
    if (this.order) {
      this.order.isPreparedForCustomer = value;

      this.orderService.updateOrder(this.order.id, this.order).subscribe(
        () => {
          SnackBarUtil.showSnackBar(this.snackBar, 'Order marked as done!', 'success');
          this.sendOrderReadyNotification();
        },
        (error) => {
          console.error('Error marking order as done:', error);
          SnackBarUtil.showSnackBar(this.snackBar, 'Failed to mark order as done!', 'error');
        }
      );
    }
  }

  getOrderDetails(orderId: number): void {
    this.orderService.getOrderById(orderId).subscribe(
      (order) => {
        this.order = order;
        this.orderService.getOrderItems(orderId).subscribe((items) => {
          this.orderItems = items;

          const fileIds = items.map(item => item.userFileId);

          this.fileService.getFilesWithId(fileIds).subscribe((files) => {
            this.orderItems.forEach(item => {
              if (files) {
                item.userFile = files.find(file => file?.id === item.userFileId) ?? { id: 0, fileName: '', fileUinique: '', shouldPrint: false, uploadDate: new Date, filePath: '', extension: '' };
              }
            });
          });
        });
      },
      (error) => {
        console.error('Error fetching order details:', error);
      }
    );
  }

  downloadFile(orderItem: OrderItem): void {
    this.fileService.downloadFile(orderItem.userFileId).subscribe(
      (fileBlob) => {
        const downloadUrl = window.URL.createObjectURL(fileBlob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = orderItem.userFile.fileName;
        link.click();
        window.URL.revokeObjectURL(downloadUrl);
      },
      (error) => {
        console.error('Error downloading file:', error);
        SnackBarUtil.showSnackBar(this.snackBar, 'File could not be downloaded.', 'error');
      }
    );
  }

  removeItem(item: OrderItem): void {
    const confirmed = confirm(`Are you sure you want to remove ${item.userFile?.fileName || 'this item'}?`);
    if (confirmed) {
      this.orderService.removeOrderItem(item.id ?? 0).subscribe(
        () => {
          this.orderItems = this.orderItems.filter((i) => i.id !== item.id);
          SnackBarUtil.showSnackBar(this.snackBar, 'Item removed successfully!', 'success');
        },
        (error) => {
          console.error('Error removing item:', error);
          SnackBarUtil.showSnackBar(this.snackBar, 'Item removing failed!', 'error');
        }
      );
    }
  }

  sendOrderReadyNotification(): void {
    this.orderService.sendOrderReadyEmail(this.order?.id ?? 0).subscribe(
      () => {
        SnackBarUtil.showSnackBar(this.snackBar, 'Email sent successfully!', 'success');
      },
      (error) => {
        console.error('Error sending email:', error);
        SnackBarUtil.showSnackBar(this.snackBar, 'Email was not sent!', 'error');
      }
    );
  }
}
