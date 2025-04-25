import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AllOrdersListComponent } from './all-orders-list.component';
import { OrderService } from '../../services/order-services/order.service';
import { AuthService } from '../../services/auth-services/auth.service';
import { UserStoreService } from '../../services/auth-services/user-store.service';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterTestingModule } from '@angular/router/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { Order } from '../../models/order-models/order.model';

describe('AllOrdersListComponent', () => {
  let component: AllOrdersListComponent;
  let fixture: ComponentFixture<AllOrdersListComponent>;
  let orderServiceSpy: jasmine.SpyObj<OrderService>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let userStoreSpy: jasmine.SpyObj<UserStoreService>;

  const mockOrders: Order[] = [
    {
      id: 1,
      orderName: 'Order A',
      totalPrice: 100,
      orderCreated: new Date('2023-01-01'),
      isPreparedForCustomer: true,
      isTakenByCustomer: false,
      userId: 1,
      orderItems: []
    },
    {
      id: 2,
      orderName: 'Order B',
      totalPrice: 200,
      orderCreated: new Date('2023-02-01'),
      isPreparedForCustomer: true,
      isTakenByCustomer: true,
      userId: 2,
      orderItems: []
    }
  ];

  beforeEach(async () => {
    orderServiceSpy = jasmine.createSpyObj('OrderService', ['getOrders', 'deleteOrder', 'getOrderById', 'updateOrder']);
    authServiceSpy = jasmine.createSpyObj('AuthService', ['getRoleFromToken']);
    userStoreSpy = jasmine.createSpyObj('UserStoreService', ['getRoleFromStore']);

    await TestBed.configureTestingModule({
      declarations: [AllOrdersListComponent],
      imports: [MatSnackBarModule, RouterTestingModule, ReactiveFormsModule],
      providers: [
        { provide: OrderService, useValue: orderServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: UserStoreService, useValue: userStoreSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AllOrdersListComponent);
    component = fixture.componentInstance;

    orderServiceSpy.getOrders.and.returnValue(of(mockOrders));
    userStoreSpy.getRoleFromStore.and.returnValue(of('Admin'));

    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should load and filter orders on init', () => {
    expect(component.orders.length).toBe(2);
    expect(component.filteredOrders.length).toBe(2);
  });

  it('should filter by search term', () => {
    component.filterForm.controls['searchTerm'].setValue('Order A');
    component.applyFilters();
    expect(component.filteredOrders.length).toBe(1);
    expect(component.filteredOrders[0].orderName).toBe('Order A');
  });

  it('should sort orders by price descending', () => {
    component.sortBy = 'totalPrice';
    component.sortDirection = 'desc';
    component.sortOrders();
    expect(component.filteredOrders[0].totalPrice).toBe(200);
  });

  it('should delete an order and refresh list', () => {
    orderServiceSpy.deleteOrder.and.returnValue(of());
    orderServiceSpy.getOrders.and.returnValue(of(mockOrders));

    component.deleteOrder(1);

    expect(orderServiceSpy.deleteOrder).toHaveBeenCalledWith(1);
    expect(orderServiceSpy.getOrders).toHaveBeenCalled();
  });

  it('should handle deletion errors gracefully', () => {
    orderServiceSpy.deleteOrder.and.returnValue(throwError(() => new Error('Deletion failed')));
    component.deleteOrder(1);
    expect(component.showDeleteModal).toBeFalse();
  });

  it('should NOT mark order as completed if not prepared', () => {
    const notPrepared = { ...mockOrders[0], isPreparedForCustomer: false };
    spyOn(window, 'confirm').and.returnValue(true);
    orderServiceSpy.getOrderById.and.returnValue(of(notPrepared));

    component.markOrderAsCompleted(1);
    expect(orderServiceSpy.updateOrder).not.toHaveBeenCalled();
  });

  it('should update page on page change', () => {
    component.onPageChange(2);
    expect(component.currentPage).toBe(2);
  });

  it('should open and close delete modal', () => {
    component.openDeleteModal(1);
    expect(component.orderToDelete).toBe(1);
    expect(component.showDeleteModal).toBeTrue();

    component.closeDeleteModal();
    expect(component.showDeleteModal).toBeFalse();
  });

  it('should change sorting correctly', () => {
    component.changeSorting('totalPrice');
    expect(component.sortBy).toBe('totalPrice');
    expect(component.sortDirection).toBe('desc');

    component.changeSorting('totalPrice');
    expect(component.sortDirection).toBe('asc');
  });

  it('should correctly generate pagination array for small page count', () => {
    component.filteredOrders = Array.from({ length: 9 }).map((_, i) => ({
      ...mockOrders[0],
      id: i,
      orderName: `Order ${i}`
    }));
    component.itemsPerPage = 1;
    const pages = component.getPaginationArray();
    expect(pages.length).toBe(9);
  });

  it('should include ellipses in pagination for large page count', () => {
    component.filteredOrders = Array.from({ length: 100 }).map((_, i) => ({
      ...mockOrders[0],
      id: i,
      orderName: `Order ${i}`
    }));
    component.itemsPerPage = 1;
    component.currentPage = 50;
    const pages = component.getPaginationArray();
    expect(pages).toContain('...');
  });
});
