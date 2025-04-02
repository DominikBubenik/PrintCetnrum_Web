import { Component, OnInit } from '@angular/core';
import {StatService} from "../../services/stat.service";

@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.scss'],
})
export class StatisticsComponent implements OnInit {
  businessOverview: any;
  salesTrends: any;
  topProducts: any;
  newCustomers: any;
  orderStatus: any;

  constructor(private statService: StatService) {}

  ngOnInit() {
    this.loadStatistics();
  }

  loadStatistics() {
    this.statService.getBusinessOverview().subscribe((data) => {
      this.businessOverview = data;
    });

    this.statService.getSalesTrends().subscribe((data) => {
      this.salesTrends = [
        { name: 'Today', value: data.TodaySales },
        { name: 'This Week', value: data.WeeklySales },
        { name: 'This Month', value: data.MonthlySales },
      ];
    });

    this.statService.getTopProducts().subscribe((data) => {
      this.topProducts = data;
      console.log(this.topProducts);
    });

    this.statService.getNewCustomers().subscribe((data) => {
      this.newCustomers = data.NewCustomers;
    });

    this.statService.getOrderStatus().subscribe((data) => {
      this.orderStatus = [
        { name: 'Prepared', value: data.PreparedOrders },
        { name: 'Taken', value: data.TakenOrders },
        { name: 'Finished', value: data.FinishedOrders },
      ];
    });
  }
}
