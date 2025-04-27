import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { StatService } from './stat.service';

describe('StatService', () => {
  let service: StatService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [StatService],
    });

    service = TestBed.inject(StatService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getBusinessOverview', () => {
    it('should return business overview data', () => {
      const mockResponse = { totalOrders: 100, totalRevenue: 5000 };

      service.getBusinessOverview().subscribe(response => {
        expect(response.totalOrders).toBe(100);
        expect(response.totalRevenue).toBe(5000);
      });

      const req = httpMock.expectOne('https://localhost:7074/api/statistics/overview');
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('getSalesTrends', () => {
    it('should return sales trends data', () => {
      const mockResponse = { monthlySales: [100, 200, 150, 250] };

      service.getSalesTrends().subscribe(response => {
        expect(response.monthlySales.length).toBe(4);
        expect(response.monthlySales[0]).toBe(100);
      });

      const req = httpMock.expectOne('https://localhost:7074/api/statistics/sales-trends');
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('getTopProducts', () => {
    it('should return top products data', () => {
      const mockResponse = [{ productName: 'Product A', quantitySold: 50 }, { productName: 'Product B', quantitySold: 40 }];

      service.getTopProducts().subscribe(response => {
        expect(response.length).toBe(2);
        expect(response[0].productName).toBe('Product A');
        expect(response[1].quantitySold).toBe(40);
      });

      const req = httpMock.expectOne('https://localhost:7074/api/statistics/top-products');
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('getNewCustomers', () => {
    it('should return new customers data', () => {
      const mockResponse = [{ name: 'John Doe', email: 'john.doe@example.com' }];

      service.getNewCustomers().subscribe(response => {
        expect(response.length).toBe(1);
        expect(response[0].name).toBe('John Doe');
      });

      const req = httpMock.expectOne('https://localhost:7074/api/statistics/new-customers');
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('getOrderStatus', () => {
    it('should return order status data', () => {
      const mockResponse = { totalOrders: 100, completedOrders: 80, pendingOrders: 20 };

      service.getOrderStatus().subscribe(response => {
        expect(response.totalOrders).toBe(100);
        expect(response.completedOrders).toBe(80);
      });

      const req = httpMock.expectOne('https://localhost:7074/api/statistics/order-status');
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('getFilesStatistics', () => {
    it('should return files statistics data', () => {
      const mockResponse = { totalFiles: 500, printFiles: 200, designFiles: 150 };

      service.getFilesStatistics().subscribe(response => {
        expect(response.totalFiles).toBe(500);
        expect(response.printFiles).toBe(200);
        expect(response.designFiles).toBe(150);
      });

      const req = httpMock.expectOne('https://localhost:7074/api/statistics/user-files');
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });
});
