import { Component, OnInit } from '@angular/core';
import { FileHandlerService } from '../services/file-handler.service';
import { UserFile } from '../models/user-file';
import { environment } from '../../environments/environment';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-new-order',
  templateUrl: './new-order.component.html',
  styleUrls: ['./new-order.component.css']
})
export class NewOrderComponent implements OnInit {
  files: UserFile[] = [];
  orderDetails: {
    file: UserFile;
    count: number;
    description: string;
    fileType: string;  
    imageSize: string; 
  }[] = [];
  totalPrice: number = 0;
  pricePerFile: number = 5;
  baseUrl = environment.apiUrl;

  constructor(private fileHandlerService: FileHandlerService) { }

  ngOnInit(): void {
    this.fetchFiles();
  }

  fetchFiles(): void {
    this.fileHandlerService.fetchFiles().subscribe(files => {
      this.files = files.filter(file => file.shouldPrint);
      this.initializeOrderDetails();
    });
  }

  initializeOrderDetails(): void {
    this.orderDetails = this.files.map(file => ({
      file,
      count: 1,
      description: '',
      fileType: 'color',   // Default value for fileType
      imageSize: 'A4'      // Default value for imageSize
    }));
  }

  calculateTotalPrice(): void {
    this.totalPrice = this.orderDetails.reduce((total, order) => {
      return total + (order.count * this.pricePerFile);
    }, 0);
  }

  isImage(extension: string): boolean {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff'];
    return imageExtensions.includes(extension.toLowerCase());
  }

  submitOrder(): void {
    alert('Order confirmed and sent!');
  }
}
