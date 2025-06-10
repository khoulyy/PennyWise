import { Component, OnInit } from '@angular/core';
import { ExpenseChartComponent } from '../../components/expense-chart/expense-chart.component';
import { LogoutBtnComponent } from '../../components/logout-btn/logout-btn.component';
import { BalanceComponent } from '../../components/balance/balance.component';
import { AddExpenseBtnComponent } from '../../components/add-expense-btn/add-expense-btn.component';
import { ExpenseService } from '../../services/expense.service.ts.service';
import { Expense } from '../../models/expense';
import { Timestamp } from 'firebase/firestore';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    ExpenseChartComponent,
    LogoutBtnComponent,
    BalanceComponent,
    AddExpenseBtnComponent,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit {
  thisMonthExpenses: number = 0;
  totalTransactions: number = 0;
  recentTransactions: Expense[] = [];

  constructor(private expenseService: ExpenseService) {}

  async ngOnInit() {
    const expenses: Expense[] = await this.expenseService.getExpensesForUser();
    this.totalTransactions = expenses.length;

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const monthlyExpenses = expenses.filter(e => {
      const dateObj =
        e.date && typeof e.date === 'object' && 'toDate' in e.date
          ? e.date.toDate()
          : new Date(e.date);
      return dateObj >= startOfMonth && dateObj <= endOfMonth;
    });

    // ✅ Always add absolute value of amount to total
    this.thisMonthExpenses = monthlyExpenses.reduce(
      (sum: number, e: Expense) => sum + Math.abs(e.amount),
      0
    );

    // Show latest 5 transactions
    this.recentTransactions = expenses
      .sort((a, b) => {
        const dateA = a.date instanceof Timestamp ? a.date.toDate() : new Date(a.date);
        const dateB = b.date instanceof Timestamp ? b.date.toDate() : new Date(b.date);
        return dateB.getTime() - dateA.getTime();
      })
      .slice(0, 5);
  }

  editTransaction(expense: Expense) {
    // TODO: Implement your edit logic here
    console.log('Edit:', expense);
  }
}
