import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgChartsModule } from 'ng2-charts';
import { ChartConfiguration, ChartType } from 'chart.js';
import { Firestore, collection, query, where, getDocs } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { Timestamp } from 'firebase/firestore';

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

  public barChartData = {
    labels: this.barChartLabels,
    datasets: [
      {
        data: [0, 0, 0, 0, 0, 0, 0],
        label: 'Expenses',
        backgroundColor: '#3b82f6',
        borderRadius: 8,
        barPercentage: 0.6,
      },
    ],
  };

  async ngOnInit() {
    const user = this.auth.currentUser;
    if (!user) {
      console.error('🚫 No user is logged in.');
      return;
    }

    console.log('✅ Logged-in user UID:', user.uid);

    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday
    startOfWeek.setHours(0, 0, 0, 0); // Ensure time is at midnight

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999); // End of Saturday

    console.log('📅 Week range:', startOfWeek, 'to', endOfWeek);

    const expensesRef = collection(this.firestore, 'expenses'); // ✅ Correct collection name
    const q = query(expensesRef, where('uId', '==', user.uid));
    const snapshot = await getDocs(q);

    console.log(`📦 Retrieved ${snapshot.docs.length} expenses from Firestore`);

const weekExpenses: { amount: number; date: Date }[] = [];

snapshot.docs.forEach(doc => {
  const data = doc.data() as { amount: number; date: any };
  let dateObj: Date;

if (data.date && typeof data.date === 'object' && 'toDate' in data.date) {
  dateObj = data.date.toDate(); // ✅ Timestamp-like object
} else if (typeof data.date === 'string') {
  dateObj = new Date(data.date);
} else {
  console.warn('⚠️ Unknown date format in document:', data);
  return; // Skip if unrecognized
}

  console.log(`🕓 Parsed date: ${dateObj.toISOString()}`);

  if (dateObj >= startOfWeek && dateObj <= endOfWeek) {
    weekExpenses.push({ amount: data.amount, date: dateObj });
  }
});


    console.log(`🗓️ Filtered ${weekExpenses.length} expenses for this week`);
    console.table(weekExpenses.map(e => ({
      amount: e.amount,
      date: e.date instanceof Timestamp ? e.date.toDate() : e.date,
    })));

    const dailyTotals = [0, 0, 0, 0, 0, 0, 0]; // Sun (0) to Sat (6)

    for (const expense of weekExpenses) {
      const dateObj = expense.date instanceof Timestamp ? expense.date.toDate() : new Date(expense.date);
      const dayIndex = dateObj.getDay(); // 0 = Sunday ... 6 = Saturday
      dailyTotals[dayIndex] += Math.abs(expense.amount);
    }

    console.log('📊 Totals per day (Sun to Sat):', dailyTotals);

    // Rearranged to match chart labels: Mon–Sun
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
      backgroundColor: '#3b82f6',
      borderRadius: 8,
      barPercentage: 0.6,
    },
  ],
};

  }
}
