import { Component, inject, signal, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiPlatformService } from '../../core/services/api-platform.service';
import { UserLoginLog, Artwork } from '../../core/models';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class AdminDashboardComponent implements AfterViewInit {

  private api = inject(ApiPlatformService<any>);

  kpis = signal<any>(null);
  charts = signal<any>(null);

  ngAfterViewInit() {
    this.loadStats();
  }

  loadStats() {
    this.api.getAll('admin/dashboard').subscribe({
      next: (res: any) => {
        const data = res.items?.[0] ?? res;
        this.kpis.set(data.kpis);
        this.charts.set(data.charts);

        this.initCharts();
      }
    });
  }

  initCharts() {
    this.artworksByMonthChart();
    this.connectionsByDayChart();
    this.artworksDisplayedChart();
    this.stylesChart();
    this.nationalitiesChart();
  }

  artworksByMonthChart() {
    const data = this.charts().artworksByMonth;

    new Chart('artworksByMonth', {
      type: 'line',
      data: {
        labels: data.map((d: any) => d.month),
        datasets: [{
          label: 'Œuvres créées',
          data: data.map((d: any) => d.total),
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59,130,246,0.3)',
          tension: 0.4
        }]
      }
    });
  }

  connectionsByDayChart() {
    const data = this.charts().connectionsByDay;
    
    new Chart('connectionsByDay', {
      type: 'line',
      data: {
        labels: data.map((d: any) => d.day),
        datasets: [{
          label: 'Connexions',
          data: data.map((d: any) => d.total),
          borderColor: '#10b981'
        }]
      }
    });
  }

  artworksDisplayedChart() {
    const data = this.charts().artworksDisplayed;

    new Chart('artworksDisplayed', {
      type: 'doughnut',
      data: {
        labels: ['Affichées', 'Non affichées'],
        datasets: [{
          data: [data.displayed, data.hidden],
          backgroundColor: ['#3b82f6', '#ef4444']
        }]
      }
    });
  }

  stylesChart() {
    const data = this.charts().styles;

    new Chart('stylesChart', {
      type: 'pie',
      data: {
        labels: data.map((d: any) => d.style),
        datasets: [{
          data: data.map((d: any) => d.total)
        }]
      }
    });
  }

  nationalitiesChart() {
    const data = this.charts().nationalities;

    new Chart('nationalitiesChart', {
      type: 'bar',
      data: {
        labels: data.map((d: any) => d.nationality),
        datasets: [{
          label: 'Artistes',
          data: data.map((d: any) => d.total),
          backgroundColor: '#6366f1'
        }]
      }
    });
  }
}
