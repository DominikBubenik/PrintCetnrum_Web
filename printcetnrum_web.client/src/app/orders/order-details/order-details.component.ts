import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { OrderService } from '../../services/order.service';
import { Order, OrderItem } from '../../models/order-models/order.model';
import { FileHandlerService } from '../../services/file-handler.service';
import { UserFile } from '../../models/user-file';
import { UserFilesComponent } from '../../user-files/user-files.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../services/auth.service';
import { UserStoreService } from '../../services/user-store.service';

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
        this.isAdmin = role == 'Admin' ? true : false;
      } else {
        this.isAdmin = this.auth.getRoleFromToken() == 'Admin' ? true : false;
      }
    });
  }

  saveOrderChanges(): void {
    if (this.order) {
      this.orderService.updateOrder(this.order.id, this.order).subscribe(
        () => {
          this.snackBar.open('Order changes saved successfully!', 'Close', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
            panelClass: 'app-notification-success'
          });
        },
        (error) => {
          console.error('Error saving order changes:', error);
          this.snackBar.open('Failed to save order changes!', 'Close', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
            panelClass: 'app-notification-error'
          });
        }
      );
    }
  }

  markOrderAsPrepared(value: boolean): void {
    if (this.order) {
      this.order.isPreparedForCustomer = value;

      this.orderService.updateOrder(this.order.id, this.order).subscribe(
        () => {
          this.snackBar.open('Order marked as done!', 'Close', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
            panelClass: 'app-notification-success'
          });
        },
        (error) => {
          console.error('Error marking order as done:', error);
          this.snackBar.open('Failed to mark order as done!', 'Close', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
            panelClass: 'app-notification-error'
          });
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
            console.log('Order items with files:', this.orderItems);
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
        window.URL.revokeObjectURL(downloadUrl);  // Clean up the URL object
      },
      (error) => {
        console.error('Error downloading file:', error);
        alert('File could not be downloaded.');
      }
    );
  }

  removeItem(item: OrderItem): void {
    const confirmed = confirm(`Are you sure you want to remove ${item.userFile?.fileName || 'this item'}?`);
    if (confirmed) {
      // Call service to remove the item from the backend
      this.orderService.removeOrderItem(item.id ?? 0).subscribe(
        () => {
          this.orderItems = this.orderItems.filter((i) => i.id !== item.id);
          this.snackBar.open('Item removed successfully!', 'Close', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
            panelClass: 'app-notification-success'
          });
        },
        (error) => {
          console.error('Error removing item:', error);
          this.snackBar.open('Item removing failed!', 'Close', {
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
