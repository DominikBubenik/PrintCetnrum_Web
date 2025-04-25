import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OrderDetailsComponent } from './order-details.component';
import { OrderService } from '../../services/order-services/order.service';
import { FileHandlerService } from '../../services/file-services/file-handler.service';
import { DesignFilesHandlerService } from '../../services/file-services/design-files-handler.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { AuthService } from '../../services/auth-services/auth.service';
import { UserStoreService } from '../../services/auth-services/user-store.service';
import { SnackBarUtil } from '../../shared/snackbar-util';
import { Order, OrderItem } from '../../models/order-models/order.model';
import { UserFile } from '../../models/user-models/user-file';

describe('OrderDetailsComponent', () => {
  let component: OrderDetailsComponent;
  let fixture: ComponentFixture<OrderDetailsComponent>;
  let orderService: jasmine.SpyObj<OrderService>;
  let fileService: jasmine.SpyObj<FileHandlerService>;
  let designFileService: jasmine.SpyObj<DesignFilesHandlerService>;
  let snackBar: jasmine.SpyObj<MatSnackBar>;
  let authService: jasmine.SpyObj<AuthService>;
  let userStore: jasmine.SpyObj<UserStoreService>;

  const mockOrder: Order = {
    id: 1,
    orderCreated: new Date(),
    orderName: 'Test Order',
    isPreparedForCustomer: false,
    isTakenByCustomer: false,
    totalPrice: 100,
    orderItems: [],
    userId: 1
  };

  const mockOrderItem: OrderItem = {
    orderId: 1,
    userFileId: 1,
    userFile: {
      id: 1,
      fileName: 'testfile.pdf',
      filePath: 'path/to/testfile.pdf',
      uploadDate: new Date(),
      extension: 'pdf',
      isStamp: false,
      isDiploma: false,
      shouldPrint: true,
      fileUinique: 'uniqueId',
    },
    isDesignFile: false,
    count: 1,
    color: 'Black',
    paperType: 'A4',
    size: 'Small',
    price: 10,
    description: 'Sample description'
  };

  beforeEach(async () => {
    const orderServiceSpy = jasmine.createSpyObj('OrderService', ['getOrderById', 'getOrderItems', 'updateOrder', 'removeOrderItem', 'sendOrderReadyEmail']);
    const fileServiceSpy = jasmine.createSpyObj('FileHandlerService', ['getFilesWithId', 'downloadFile']);
    const designFileServiceSpy = jasmine.createSpyObj('DesignFilesHandlerService', ['getDesignFilesById', 'downloadDesignFile']);
    const snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['getRoleFromToken']);
    const userStoreServiceSpy = jasmine.createSpyObj('UserStoreService', ['getRoleFromStore']);

    await TestBed.configureTestingModule({
      declarations: [OrderDetailsComponent],
      providers: [
        { provide: OrderService, useValue: orderServiceSpy },
        { provide: FileHandlerService, useValue: fileServiceSpy },
        { provide: DesignFilesHandlerService, useValue: designFileServiceSpy },
        { provide: MatSnackBar, useValue: snackBarSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: UserStoreService, useValue: userStoreServiceSpy },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => '1' } } } }
      ]
    })
      .compileComponents();

    orderService = TestBed.inject(OrderService) as jasmine.SpyObj<OrderService>;
    fileService = TestBed.inject(FileHandlerService) as jasmine.SpyObj<FileHandlerService>;
    designFileService = TestBed.inject(DesignFilesHandlerService) as jasmine.SpyObj<DesignFilesHandlerService>;
    snackBar = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    userStore = TestBed.inject(UserStoreService) as jasmine.SpyObj<UserStoreService>;

    fixture = TestBed.createComponent(OrderDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should load order details on init', () => {
    orderService.getOrderById.and.returnValue(of(mockOrder));
    orderService.getOrderItems.and.returnValue(of([mockOrderItem]));
    fileService.getFilesWithId.and.returnValue(of([]));
    designFileService.getDesignFilesById.and.returnValue(of([]));

    component.ngOnInit();

    expect(orderService.getOrderById).toHaveBeenCalledWith(1);
    expect(orderService.getOrderItems).toHaveBeenCalledWith(1);
    expect(component.order).toEqual(mockOrder);
    expect(component.orderItems).toEqual([mockOrderItem]);
  });

  it('should save order changes', () => {
    orderService.updateOrder.and.returnValue(of());
    component.order = mockOrder;
    component.saveOrderChanges();

    expect(orderService.updateOrder).toHaveBeenCalledWith(mockOrder.id, mockOrder);
    expect(snackBar.open).toHaveBeenCalledWith('Order changes saved successfully!', 'success', { duration: 3000 });
  });

  it('should mark order as prepared and send email notification', () => {
    orderService.updateOrder.and.returnValue(of());
    orderService.sendOrderReadyEmail.and.returnValue(of({}));

    component.order = mockOrder;
    component.markOrderAsPrepared(true);

    expect(orderService.updateOrder).toHaveBeenCalledWith(mockOrder.id, { ...mockOrder, isPreparedForCustomer: true });
    expect(orderService.sendOrderReadyEmail).toHaveBeenCalledWith(mockOrder.id);
    expect(snackBar.open).toHaveBeenCalledWith('Order marked as done!', 'success', { duration: 3000 });
  });

  it('should calculate order total price correctly', () => {
    component.orderItems = [mockOrderItem];
    component.calculateOrderTotalPrice();
    expect(component.order?.totalPrice).toBe(10);
  });

  it('should show error snackbar on price update failure', () => {
    orderService.updateOrderItemPrice.and.returnValue(of());
    component.updateItemPrice(mockOrderItem);

    expect(snackBar.open).toHaveBeenCalledWith('Failed to update price!', 'error', { duration: 3000 });
  });
});
