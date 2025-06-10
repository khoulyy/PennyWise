import { Component } from '@angular/core';
import { ExpenseChartComponent } from '../../components/expense-chart/expense-chart.component';
import { LogoutBtnComponent } from '../../components/logout-btn/logout-btn.component';
import { BalanceComponent } from '../../components/balance/balance.component';
import { AddExpenseBtnComponent } from '../../components/add-expense-btn/add-expense-btn.component';

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
export class HomeComponent {}
