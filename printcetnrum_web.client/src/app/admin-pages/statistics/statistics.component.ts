import { Component, OnInit, signal } from '@angular/core';
import { StatService } from "../../services/stat-services/stat.service";
import { BusinessOverview, ChartData} from '../../models/statistics.model';

@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.scss'],
})
export class StatisticsComponent implements OnInit {
  businessOverview = signal<BusinessOverview | null>(null);
  salesTrends = signal<ChartData[]>([]);
  newCustomers= signal<ChartData[]>([]);
  fileStats = signal<ChartData[]>([]); 
  topProducts: any[] = [];
  orderStatus: any[] = [];
  loading = true;
  error = false;

  view: [number, number] = [700, 300];
  showXAxis = true;
  showYAxis = true;
  gradient = false;
  showLegend = true;
  showXAxisLabel = true;
  showYAxisLabel = true;
  xAxisLabel = 'Period';
  yAxisLabel = 'Sales ($)';

  colorScheme = {
    domain: ['#4caf50', '#2196F3', '#FFC107', '#FF5722']
  };

  doughnutColorScheme = {
    domain: ['#FFC107', '#2196F3', '#4CAF50']
  };

  showLabels = true;
  isDoughnut = true;
  legendPosition = 'below';

  constructor(private statService: StatService) {}

  ngOnInit() {
    this.loadStatistics();
  }

  loadStatistics() {
    this.statService.getBusinessOverview().subscribe({
      next: (data) => {
        this.businessOverview.set(data);
      },
      error: (err) => {
        console.error('Error loading business overview', err);
        this.error = true;
      }
    });

    this.statService.getSalesTrends().subscribe({
      next: (data) => {
        this.salesTrends.set([
          { name: 'Today', value: data.todaySales },
          { name: 'This Week', value: data.weeklySales },
          { name: 'This Month', value: data.monthlySales },
        ]);
      },
      error: (err) => {
        console.error('Error loading sales trends', err);
        this.error = true;
      }
    });

    this.statService.getTopProducts().subscribe({
      next: (data) => {
        this.topProducts = data;
      },
      error: (err) => {
        console.error('Error loading top products', err);
        this.error = true;
      }
    });

    this.statService.getNewCustomers().subscribe({
      next: (data) => {
        this.newCustomers.set(data);
        console.log('New customers:', data);
      },
      error: (err) => {
        console.error('Error loading new customers', err);
        this.error = true;
      }
    });

    this.statService.getOrderStatus().subscribe({
      next: (data) => {
        this.orderStatus = [
          { name: 'Pending', value: data.pendingOrders },
          { name: 'Prepared', value: data.preparedOrders },
          { name: 'Taken', value: data.takenOrders },
        ];
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading order status', err);
        this.error = true;
        this.loading = false;
      }
    });

    this.statService.getFilesStatistics().subscribe({
      next: (data) => {
        this.fileStats.set([{ name: 'PDF Files', value: data.pdfFiles },
          { name: 'Word Files', value: data.wordFiles },
          { name: 'Images', value: data.images },
          { name: 'Design Files', value: data.designFiles },
          { name: 'Other Files', value: data.otherFiles}]);
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading order status', err);
        this.error = true;
        this.loading = false;
      }
    });
  }

  onResize(event: any) {
    const width = event.target.innerWidth;
    if (width < 700) {
      this.view = [width - 50, 300];
    } else {
      this.view = [700, 300];
    }
  }
}
