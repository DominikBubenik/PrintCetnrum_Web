import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StatisticsComponent } from './statistics.component';
import { StatService } from '../../services/stat-services/stat.service';
import { of, throwError } from 'rxjs';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BusinessOverview, ChartData } from '../../models/statistics.model';

describe('StatisticsComponent', () => {
  let component: StatisticsComponent;
  let fixture: ComponentFixture<StatisticsComponent>;
  let mockStatService: jasmine.SpyObj<StatService>;

  const mockBusinessOverview: BusinessOverview = {
    totalOrders: 200,
    totalRevenue: 15000,
    completedOrders: 170,
    preparedOrders: 20,
    pendingOrders: 10,
    averageOrderValue: 75
  };

  const mockChartData: ChartData[] = [
    { name: 'Today', value: 1000 },
    { name: 'This Week', value: 4000 },
    { name: 'This Month', value: 8000 }
  ];

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('StatService', [
      'getBusinessOverview',
      'getSalesTrends',
      'getTopProducts',
      'getNewCustomers',
      'getOrderStatus',
      'getFilesStatistics'
    ]);

    await TestBed.configureTestingModule({
      declarations: [StatisticsComponent],
      providers: [{ provide: StatService, useValue: spy }],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();

    mockStatService = TestBed.inject(StatService) as jasmine.SpyObj<StatService>;
  });

  beforeEach(() => {
    mockStatService.getBusinessOverview.and.returnValue(of(mockBusinessOverview));
    mockStatService.getSalesTrends.and.returnValue(of({
      todaySales: 1000,
      weeklySales: 4000,
      monthlySales: 8000
    }));
    mockStatService.getTopProducts.and.returnValue(of([{ name: 'Product A', value: 10 }]));
    mockStatService.getNewCustomers.and.returnValue(of([{ name: 'Day 1', value: 5 }]));
    mockStatService.getOrderStatus.and.returnValue(of({
      pendingOrders: 10,
      preparedOrders: 20,
      takenOrders: 170
    }));
    mockStatService.getFilesStatistics.and.returnValue(of({
      pdfFiles: 10,
      wordFiles: 5,
      images: 20,
      designFiles: 2,
      otherFiles: 3
    }));

    fixture = TestBed.createComponent(StatisticsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load business overview data correctly', () => {
    expect(component.businessOverview()).toEqual(mockBusinessOverview);
  });

  it('should load sales trends', () => {
    expect(component.salesTrends().length).toBe(3);
  });

  it('should load top products', () => {
    expect(component.topProducts.length).toBe(1);
    expect(component.topProducts[0].name).toBe('Product A');
  });

  it('should load new customers', () => {
    expect(component.newCustomers().length).toBe(1);
  });

  it('should load order status correctly', () => {
    expect(component.orderStatus.length).toBe(3);
    expect(component.orderStatus.find(o => o.name === 'Pending')?.value).toBe(10);
    expect(component.loading).toBeFalse();
  });

  it('should load file statistics', () => {
    expect(component.fileStats().length).toBeGreaterThan(0);
    expect(component.loading).toBeFalse();
  });

  it('should handle error during business overview load', () => {
    mockStatService.getBusinessOverview.and.returnValue(throwError(() => new Error('fail')));
    component.loadStatistics();
    expect(component.error).toBeTrue();
  });
});
