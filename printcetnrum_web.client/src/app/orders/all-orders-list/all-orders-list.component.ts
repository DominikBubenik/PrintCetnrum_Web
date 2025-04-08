import { Component, Inject, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { OrderService } from '../../services/order-services/order.service';
import { Order } from '../../models/order-models/order.model';
import { AuthService } from '../../services/auth-services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { UserStoreService } from '../../services/auth-services/user-store.service';
import { SnackBarUtil } from '../../shared/snackbar-util';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-all-orders-list',
  templateUrl: './all-orders-list.component.html',
  styleUrls: ['./all-orders-list.component.css']
})
export class AllOrdersListComponent implements OnInit {
  private orderService = inject(OrderService);
  private authService = inject(AuthService);
  private userStore = inject(UserStoreService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private fb = inject(FormBuilder);

  orders: Order[] = [];
  filteredOrders: Order[] = [];
  displayedOrders: Order[] = [];
  isAdmin: boolean = false;
  filterForm: FormGroup;
  sortBy: string = 'orderCreated';
  sortDirection: 'asc' | 'desc' = 'desc';

  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalItems: number = 0;
  showDeleteModal = false;
  orderToDelete = -1;

  constructor() {
    this.filterForm = this.fb.group({
      startDate: [null],
      endDate: [null],
      searchTerm: [''],
      status: ['all']
    });
    this.initializeForm();
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
    this.setupFormListeners();
  }

  initializeForm(): void {
    this.filterForm = this.fb.group({
      startDate: [null],
      endDate: [null],
      searchTerm: [''],
      status: ['all']
    });
  }

  setupFormListeners(): void {
    this.filterForm.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(() => {
      this.applyFilters();
    });
  }

  getAllOrders(): void {
    this.orderService.getOrders().subscribe(
      (orders) => {
        this.orders = orders;
        this.applyFilters();
      },
      (error) => {
        console.error('Error fetching orders:', error);
        SnackBarUtil.showSnackBar(this.snackBar, 'Error fetching orders. Please try again.', 'error');
      }
    );
  }

  applyFilters(): void {
    const { startDate, endDate, searchTerm, status } = this.filterForm.value;

    this.filteredOrders = this.orders.filter(order => {
      const orderDate = new Date(order.orderCreated);
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;

      const dateInRange = (!start || orderDate >= start) &&
        (!end || orderDate <= end);

      const matchesSearch = !searchTerm ||
        order.orderName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = status === 'all' ||
        (status === 'prepared' && order.isPreparedForCustomer && !order.isTakenByCustomer) ||
        (status === 'completed' && order.isTakenByCustomer) ||
        (status === 'pending' && !order.isPreparedForCustomer && !order.isTakenByCustomer);

      return dateInRange && matchesSearch && matchesStatus;
    });

    this.sortOrders();
    this.totalItems = this.filteredOrders.length;
    this.currentPage = 1;
    this.updateDisplayedOrders();
  }

  updateDisplayedOrders(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.displayedOrders = this.filteredOrders.slice(startIndex, endIndex);
  }

  sortOrders(): void {
    this.filteredOrders.sort((a, b) => {
      const modifier = this.sortDirection === 'asc' ? 1 : -1;

      switch (this.sortBy) {
        case 'totalPrice':
          return modifier * (a.totalPrice - b.totalPrice);
        case 'orderName':
          return modifier * a.orderName.localeCompare(b.orderName);
        default:
          return modifier * (new Date(a.orderCreated).getTime() - new Date(b.orderCreated).getTime());
      }
    });

    this.updateDisplayedOrders();
  }

  openDeleteModal(id: number) {
    this.orderToDelete = id;
    this.showDeleteModal = true;
  }

  closeDeleteModal() {
    this.showDeleteModal = false;
  }

  changeSorting(column: string): void {
    if (this.sortBy === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = column;
      this.sortDirection = 'desc';
    }
    this.sortOrders();
  }

  deleteOrder(id: number): void {
    this.orderService.deleteOrder(id).subscribe(
      () => {
        SnackBarUtil.showSnackBar(this.snackBar, 'Order removed successfully!', 'success');
        this.getAllOrders();
        this.showDeleteModal = false;
      },
      () => {
        SnackBarUtil.showSnackBar(this.snackBar, 'Something went wrong!', 'error');
        this.showDeleteModal = false;
      }
    );
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

  getPaginationArray(): (number | string)[] {
    const totalPages = Math.ceil(this.filteredOrders.length / this.itemsPerPage);
    const visiblePages = 5;
    const paginationArray: (number | string)[] = [];
    if (totalPages <= 10) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    paginationArray.push(1);
    if (this.currentPage > visiblePages + 2) {
      paginationArray.push('...');
    }

    let startPage = Math.max(2, this.currentPage - visiblePages);
    let endPage = Math.min(totalPages - 1, this.currentPage + visiblePages);

    for (let i = startPage; i <= endPage; i++) {
      paginationArray.push(i);
    }
    if (this.currentPage < totalPages - visiblePages - 1) {
      paginationArray.push('...');
    }
    paginationArray.push(totalPages);
    return paginationArray;
  }

  onPageChange(page: number | string): void {
    if (typeof page === 'number') {
      this.currentPage = page;
      this.updateDisplayedOrders();
    }
  }
}
