import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { OrderService } from './order.service';
import { AuthService } from '../auth-services/auth.service';
import { Order, OrderItem } from '../../models/order-models/order.model';
import { UserFile } from '../../models/user-models/user-file'; // Import UserFile model

describe('OrderService', () => {
  let service: OrderService;
  let httpMock: HttpTestingController;
  let authService: jasmine.SpyObj<AuthService>;

  beforeEach(() => {
    const authSpy = jasmine.createSpyObj('AuthService', ['getfullNameFromToken']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        OrderService,
        { provide: AuthService, useValue: authSpy },
      ]
    });

    service = TestBed.inject(OrderService);
    httpMock = TestBed.inject(HttpTestingController);
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('createOrder', () => {
    it('should create an order and return it', () => {
      const order: Order = {
        id: 1,
        orderCreated: new Date(),
        orderName: 'Order 1',
        isPreparedForCustomer: false,
        isTakenByCustomer: false,
        totalPrice: 100,
        orderItems: [],
        userId: 1
      };
      const mockResponse = { ...order };
      authService.getfullNameFromToken.and.returnValue('John Doe');

      service.createOrder(order).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne('https://localhost:7074/api/Order/create-order?userName=John%20Doe');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(order);
      req.flush(mockResponse);
    });
  });

  describe('addOrderItems', () => {
    it('should add order items to an order', () => {
      const orderName = 'Order 1';
      const userFile: UserFile = {
        id: 1,
        fileName: 'Design1.pdf',
        fileUinique: 'unique_file_12345',
        filePath: 'path/to/file/Design1.pdf',
        extension: '.pdf',
        uploadDate: new Date('2025-04-01'),
        shouldPrint: true,
        isStamp: false,
        isDiploma: false
      };

      const orderItems: OrderItem[] = [{
        orderId: 1,
        userFileId: 1,
        userFile: userFile,
        isDesignFile: true,
        count: 2,
        color: 'Red',
        paperType: 'Glossy',
        size: 'A4',
        price: 50,
        description: 'Item 1 description'
      }];

      service.addOrderItems(orderName, orderItems).subscribe(response => {
        expect(response).toBeUndefined();
      });

      const req = httpMock.expectOne(`https://localhost:7074/api/Order/add-order-items?orderName=${orderName}`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(orderItems);
      req.flush({});
    });
  });

  describe('getOrderItems', () => {
    it('should return the order items for the given order id', () => {
      const orderId = 1;
      const userFile: UserFile = {
        id: 1,
        fileName: 'Design1.pdf',
        fileUinique: 'unique_file_12345',
        filePath: 'path/to/file/Design1.pdf',
        extension: '.pdf',
        uploadDate: new Date('2025-04-01'),
        shouldPrint: true,
        isStamp: false,
        isDiploma: false
      };

      const mockOrderItems: OrderItem[] = [{
        orderId: 1,
        userFileId: 1,
        userFile: userFile,
        isDesignFile: true,
        count: 2,
        color: 'Red',
        paperType: 'Glossy',
        size: 'A4',
        price: 50,
        description: 'Item 1 description'
      }];

      service.getOrderItems(orderId).subscribe(orderItems => {
        expect(orderItems.length).toBe(1);
        expect(orderItems[0].userFile.fileName).toBe('Design1.pdf');
        expect(orderItems[0].userFile.fileUinique).toBe('unique_file_12345');
        expect(orderItems[0].userFile.filePath).toBe('path/to/file/Design1.pdf');
        expect(orderItems[0].userFile.extension).toBe('.pdf');
        expect(orderItems[0].userFile.shouldPrint).toBe(true);
      });

      const req = httpMock.expectOne(`https://localhost:7074/api/Order/get-order-items/${orderId}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockOrderItems);
    });
  });


  describe('getOrderById', () => {
    it('should return the order for the given order id', () => {
      const orderId = 1;
      const order: Order = {
        id: 1,
        orderCreated: new Date(),
        orderName: 'Order 1',
        isPreparedForCustomer: false,
        isTakenByCustomer: false,
        totalPrice: 100,
        orderItems: [],
        userId: 1
      };

      service.getOrderById(orderId).subscribe(orderData => {
        expect(orderData.id).toBe(1);
        expect(orderData.orderName).toBe('Order 1');
      });

      const req = httpMock.expectOne(`https://localhost:7074/api/Order/get-order/${orderId}`);
      expect(req.request.method).toBe('GET');
      req.flush(order);
    });
  });

  describe('getOrders', () => {
    it('should return a list of orders', () => {
      const orders: Order[] = [
        {
          id: 1,
          orderCreated: new Date(),
          orderName: 'Order 1',
          isPreparedForCustomer: false,
          isTakenByCustomer: false,
          totalPrice: 100,
          orderItems: [],
          userId: 1
        },
        {
          id: 2,
          orderCreated: new Date(),
          orderName: 'Order 2',
          isPreparedForCustomer: true,
          isTakenByCustomer: true,
          totalPrice: 200,
          orderItems: [],
          userId: 2
        }
      ];

      service.getOrders().subscribe(orderList => {
        expect(orderList.length).toBe(2);
        expect(orderList[0].orderName).toBe('Order 1');
      });

      const req = httpMock.expectOne('https://localhost:7074/api/Order/get-orders');
      expect(req.request.method).toBe('GET');
      req.flush(orders);
    });
  });

  describe('updateOrder', () => {
    it('should update the order', () => {
      const orderId = 1;
      const updatedOrder: Order = {
        id: 1,
        orderCreated: new Date(),
        orderName: 'Updated Order',
        isPreparedForCustomer: true,
        isTakenByCustomer: true,
        totalPrice: 120,
        orderItems: [],
        userId: 1
      };

      service.updateOrder(orderId, updatedOrder).subscribe(response => {
        expect(response).toBeUndefined();
      });

      const req = httpMock.expectOne(`https://localhost:7074/api/Order/update-order/${orderId}`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updatedOrder);
      req.flush({});
    });
  });

  describe('deleteOrder', () => {
    it('should delete the order', () => {
      const orderId = 1;

      service.deleteOrder(orderId).subscribe(response => {
        expect(response).toBeUndefined();
      });

      const req = httpMock.expectOne(`https://localhost:7074/api/Order/delete-order/${orderId}`);
      expect(req.request.method).toBe('DELETE');
      req.flush({});
    });
  });

  describe('sendOrderReadyEmail', () => {
    it('should send the order ready email', () => {
      const orderId = 1;
      const mockResponse = { message: 'Email sent successfully!' };

      service.sendOrderReadyEmail(orderId).subscribe(response => {
        expect(response.message).toBe('Email sent successfully!');
      });

      const req = httpMock.expectOne(`https://localhost:7074/api/Order/send-order-ready-email/${orderId}`);
      expect(req.request.method).toBe('POST');
      req.flush(mockResponse);
    });
  });
});
