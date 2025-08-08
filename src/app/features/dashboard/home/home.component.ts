import { Component, OnInit } from '@angular/core';
import { DashboardService } from 'src/app/core/services/dashboard.service';
import { DashboardData, TopPost, TopAuthor, MonthlyUser } from 'src/app/core/models/dashboard.model';
import {
  ApexAxisChartSeries, ApexChart, ApexXAxis, ApexYAxis, ApexStroke, ApexFill,
  ApexDataLabels, ApexTooltip, ApexPlotOptions, ApexNonAxisChartSeries, ApexResponsive, ApexLegend
} from 'ng-apexcharts';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  standalone: false
})
export class HomeComponent implements OnInit {

  // KPI
  totalVisits = 0;
  totalLikes = 0;
  newUsers = 0;
  publishedPosts = 0;
  comments = 0;
  averageEngagement = 0;

  // En çoklar listeleri
  topViewedPosts: TopPost[] = [];
  topLikedPosts: TopPost[] = [];
  topCommentedPosts: TopPost[] = [];
  topAuthors: TopAuthor[] = [];

  // Aylık kullanıcı kayıt verisi
  monthlyUsers: MonthlyUser[] = [];

  // Alan grafiği (trafik)
  areaSeries: ApexAxisChartSeries = [];
  areaChart: ApexChart = { type: 'area', height: 320, toolbar: { show: false }, animations: { enabled: true } };
  areaXaxis: ApexXAxis = { categories: [] };
  areaYaxis: ApexYAxis = { labels: { formatter: v => String(Math.round(v)) } };
  areaStroke: ApexStroke = { curve: 'smooth', width: 2 };
  areaFill: ApexFill = { type: 'gradient', gradient: { shadeIntensity: 0.3, opacityFrom: 0.6, opacityTo: 0.1 } };
  dataLabels: ApexDataLabels = { enabled: false };
  tooltip: ApexTooltip = { theme: 'light' };

  // Sütun grafiği (kategoriye göre yazı)
  barSeries: ApexAxisChartSeries = [];
  barChart: ApexChart = { type: 'bar', height: 320, toolbar: { show: false } };
  barXaxis: ApexXAxis = { categories: [] };
  barPlot: ApexPlotOptions = { bar: { columnWidth: '45%', borderRadius: 6 } };

  // Donut (yayın durumu)
  donutSeries: ApexNonAxisChartSeries = [];
  donutLabels: string[] = [];
  donutChart: ApexChart = { type: 'donut', height: 320 };
  donutLegend: ApexLegend = { position: 'bottom' };
  donutResponsive: ApexResponsive[] = [
    { breakpoint: 768, options: { chart: { height: 280 }, legend: { position: 'bottom' } } }
  ];

  // Aylık kullanıcı kayıt grafiği
  userSeries: ApexAxisChartSeries = [];
  userChart: ApexChart = { type: 'line', height: 320, toolbar: { show: false } };
  userXaxis: ApexXAxis = { categories: [] };

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.dashboardService.getDashboardData().subscribe({
      next: (res) => {
        const data: DashboardData = res.data;

        // KPI verileri
        this.totalVisits = data.stats.totalViews;
        this.totalLikes = data.stats.totalLikes;
        this.newUsers = data.monthlyUserRegistrations?.at(-1)?.userCount ?? 0;
        this.publishedPosts = data.stats.totalPosts;
        this.comments = data.stats.totalComments;
        this.averageEngagement = data.averageEngagementPerPost ?? 0;

        // En çoklar listeleri
        this.topViewedPosts = data.topViewedPosts ?? [];
        this.topLikedPosts = data.topLikedPosts ?? [];
        this.topCommentedPosts = data.topCommentedPosts ?? [];
        this.topAuthors = data.topAuthors ?? [];

        // Aylık trafik
        this.areaSeries = [{
          name: 'Ziyaret',
          data: data.monthlyTraffic.map(m => m.visitCount)
        }];
        this.areaXaxis = { ...this.areaXaxis, categories: data.monthlyTraffic.map(m => m.month) };

        // Kategoriye göre yazılar
        this.barSeries = [{
          name: 'Yazı Sayısı',
          data: data.postsByCategory.map(c => c.postCount)
        }];
        this.barXaxis = { ...this.barXaxis, categories: data.postsByCategory.map(c => c.categoryName) };

        // Yayın durumu
        this.donutSeries = data.publishStatus.map(p => p.count);
        this.donutLabels = data.publishStatus.map(p => p.status);

        // Aylık kullanıcı kayıt grafiği
        this.monthlyUsers = data.monthlyUserRegistrations ?? [];
        this.userSeries = [{
          name: 'Yeni Kullanıcılar',
          data: this.monthlyUsers.map(m => m.userCount)
        }];
        this.userXaxis = { ...this.userXaxis, categories: this.monthlyUsers.map(m => m.month) };
      },
      error: (err) => console.error('Dashboard verileri alınamadı:', err)
    });
  }
}
