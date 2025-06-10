import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgChartsModule } from 'ng2-charts';
import { ChartConfiguration, ChartType } from 'chart.js';

@Component({
  selector: 'app-expense-chart',
  standalone: true,
  imports: [CommonModule, NgChartsModule],
  templateUrl: './expense-chart.component.html',
  styleUrl: './expense-chart.component.css',
})
export class ExpenseChartComponent {
  // Example data: expenses per weekday
  public barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: true, text: 'Weekly Expenses' },
    },
    scales: {
      x: { grid: { display: false } },
      y: { beginAtZero: true },
    },
  };
  public barChartType: ChartType = 'bar';
  public barChartLabels: string[] = [
    'Mon',
    'Tue',
    'Wed',
    'Thu',
    'Fri',
    'Sat',
    'Sun',
  ];
  public barChartData = {
    labels: this.barChartLabels,
    datasets: [
      {
        data: [120, 150, 90, 200, 170, 80, 100],
        label: 'Expenses',
        backgroundColor: '#3b82f6',
        borderRadius: 8,
        barPercentage: 0.6,
      },
    ],
  };
}
