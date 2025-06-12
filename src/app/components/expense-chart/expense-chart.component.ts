import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgChartsModule } from 'ng2-charts';
import { ChartConfiguration, ChartType } from 'chart.js';
import { Firestore, collection, query, where, getDocs } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { Timestamp } from 'firebase/firestore';
import { registerables } from 'chart.js';
import Chart from 'chart.js/auto';

// Register Chart.js components
Chart.register(...registerables);

interface ExpenseData {
  amount: number;
  date: Date;
  category: string;
}

@Component({
  selector: 'app-expense-chart',
  standalone: true,
  imports: [CommonModule, NgChartsModule],
  templateUrl: './expense-chart.component.html',
  styleUrl: './expense-chart.component.css',
})
export class ExpenseChartComponent implements OnInit {
  private firestore = inject(Firestore);
  private auth = inject(Auth);
  private cdr = inject(ChangeDetectorRef);

  public barChartType: ChartType = 'bar';
  public barChartLabels: string[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  // Weekly summary data
  currentWeekTotal: number = 0;
  lastWeekTotal: number = 0;
  weekOverWeekChange: number = 0;
  categoryBreakdown: { category: string; amount: number; percentage: number }[] = [];

  public barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        titleColor: '#1e40af',
        bodyColor: '#374151',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        padding: 12,
        boxPadding: 6,
        usePointStyle: true,
        callbacks: {
          label: (context) => {
            return `$${context.parsed.y.toFixed(2)}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: { 
          display: false
        },
        ticks: {
          color: '#6b7280',
          font: {
            size: 12,
            weight: 'normal'
          }
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: '#e5e7eb'
        },
        ticks: {
          color: '#6b7280',
          font: {
            size: 12,
            weight: 'normal'
          },
          callback: (value) => `$${value}`
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index'
    }
  };

  public barChartData = {
    labels: this.barChartLabels,
    datasets: [
      {
        data: [0, 0, 0, 0, 0, 0, 0],
        label: 'Expenses',
        backgroundColor: 'rgba(99, 102, 241, 0.8)',
        hoverBackgroundColor: 'rgba(99, 102, 241, 1)',
        borderRadius: 8,
        barPercentage: 0.6,
        categoryPercentage: 0.8,
        borderSkipped: false,
        borderWidth: 0
      }
    ]
  };

  async ngOnInit() {
    await this.loadExpenseData();
  }

  private async loadExpenseData() {
    const user = this.auth.currentUser;
    if (!user) {
      console.error('🚫 No user is logged in.');
      return;
    }

    const now = new Date();
    const startOfCurrentWeek = new Date(now);
    startOfCurrentWeek.setDate(now.getDate() - now.getDay());
    startOfCurrentWeek.setHours(0, 0, 0, 0);

    const endOfCurrentWeek = new Date(startOfCurrentWeek);
    endOfCurrentWeek.setDate(startOfCurrentWeek.getDate() + 6);
    endOfCurrentWeek.setHours(23, 59, 59, 999);

    const startOfLastWeek = new Date(startOfCurrentWeek);
    startOfLastWeek.setDate(startOfCurrentWeek.getDate() - 7);
    const endOfLastWeek = new Date(startOfCurrentWeek);
    endOfLastWeek.setDate(startOfCurrentWeek.getDate() - 1);
    endOfLastWeek.setHours(23, 59, 59, 999);

    const expensesRef = collection(this.firestore, 'expenses');
    const q = query(expensesRef, where('uId', '==', user.uid));
    const snapshot = await getDocs(q);

    const currentWeekExpenses: ExpenseData[] = [];
    const lastWeekExpenses: ExpenseData[] = [];
    const categoryTotals: { [key: string]: number } = {};

    snapshot.docs.forEach(doc => {
      const data = doc.data();
      let dateObj: Date;

      if (data['date'] && typeof data['date'] === 'object' && 'toDate' in data['date']) {
        dateObj = data['date'].toDate();
      } else if (typeof data['date'] === 'string') {
        dateObj = new Date(data['date']);
      } else {
        return;
      }

      const expense: ExpenseData = {
        amount: Math.abs(data['amount']),
        date: dateObj,
        category: data['category']
      };

      if (dateObj >= startOfCurrentWeek && dateObj <= endOfCurrentWeek) {
        currentWeekExpenses.push(expense);
        categoryTotals[data['category']] = (categoryTotals[data['category']] || 0) + Math.abs(data['amount']);
      } else if (dateObj >= startOfLastWeek && dateObj <= endOfLastWeek) {
        lastWeekExpenses.push(expense);
      }
    });

    // Calculate weekly totals
    this.currentWeekTotal = currentWeekExpenses.reduce((sum, e) => sum + e.amount, 0);
    this.lastWeekTotal = lastWeekExpenses.reduce((sum, e) => sum + e.amount, 0);
    this.weekOverWeekChange = this.lastWeekTotal ? ((this.currentWeekTotal - this.lastWeekTotal) / this.lastWeekTotal) * 100 : 0;

    // Calculate category breakdown
    this.categoryBreakdown = Object.entries(categoryTotals)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: (amount / this.currentWeekTotal) * 100
      }))
      .sort((a, b) => b.amount - a.amount);

    // Prepare daily totals for chart
    const dailyTotals = [0, 0, 0, 0, 0, 0, 0];
    for (const expense of currentWeekExpenses) {
      const dayIndex = expense.date.getDay();
      dailyTotals[dayIndex] += expense.amount;
    }

    // Update chart data
    this.barChartData = {
      labels: this.barChartLabels,
      datasets: [
        {
          data: [
            dailyTotals[1], // Mon
            dailyTotals[2], // Tue
            dailyTotals[3], // Wed
            dailyTotals[4], // Thu
            dailyTotals[5], // Fri
            dailyTotals[6], // Sat
            dailyTotals[0], // Sun
          ],
          label: 'Expenses',
          backgroundColor: 'rgba(99, 102, 241, 0.8)',
          hoverBackgroundColor: 'rgba(99, 102, 241, 1)',
          borderRadius: 8,
          barPercentage: 0.6,
          categoryPercentage: 0.8,
          borderSkipped: false,
          borderWidth: 0
        }
      ]
    };

    this.cdr.detectChanges();
  }
}
