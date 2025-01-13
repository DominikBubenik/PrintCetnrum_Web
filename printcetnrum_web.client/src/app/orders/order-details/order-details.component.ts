import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { OrderService } from '../../services/order.service';
import { Order, OrderItem } from '../../models/order-models/order.model';
import { FileHandlerService } from '../../services/file-handler.service';
import { UserFile } from '../../models/user-file';
import { UserFilesComponent } from '../../user-files/user-files.component';

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
    private orderService: OrderService,
    private fileService: FileHandlerService
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
        this.orderService.getOrderItems(orderId).subscribe((items) => {
          this.orderItems = items;

          // Extract the file IDs from order items
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
    const fileUrl = orderItem.userFile?.filePath;
    if (fileUrl) {
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = orderItem.userFile.fileName || 'download';
      link.click();
    } else {
      alert('File not available for download.');
    }
  }
}
