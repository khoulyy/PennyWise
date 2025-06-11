// import { Component, OnInit } from '@angular/core';
// import { ExpenseChartComponent } from '../../components/expense-chart/expense-chart.component';
// import { LogoutBtnComponent } from '../../components/logout-btn/logout-btn.component';
// import { BalanceComponent } from '../../components/balance/balance.component';
// import { AddExpenseBtnComponent } from '../../components/add-expense-btn/add-expense-btn.component';
// import { ExpenseService } from '../../services/expense.service.ts.service';
// import { Expense } from '../../models/expense';
// import { Timestamp } from 'firebase/firestore';
// import { RecentTransactionsComponent } from '../../components/recent-transactions/recent-transactions.component';
// @Component({
//   selector: 'app-home',
//   standalone: true,
//   imports: [
//     ExpenseChartComponent,
//     LogoutBtnComponent,
//     BalanceComponent,
//     AddExpenseBtnComponent,
//     RecentTransactionsComponent,
//   ],
//   templateUrl: './home.component.html',
//   styleUrl: './home.component.css',
// })
// export class HomeComponent implements OnInit {
//   thisMonthExpenses: number = 0;
//   totalTransactions: number = 0;
//  recentTransactions: { docId: string, data: Expense }[] = [];


//   constructor(private expenseService: ExpenseService) {}

//   async ngOnInit() {
//     const expenses: Expense[] = await this.expenseService.getExpensesForUser();
//     this.totalTransactions = expenses.length;

//     const now = new Date();
//     const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
//     const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

//     const monthlyExpenses = expenses.filter(e => {
//       const dateObj =
//         e.date && typeof e.date === 'object' && 'toDate' in e.date
//      //     ? e.date.toDate()
//           : new Date(e.date);
//       return dateObj >= startOfMonth && dateObj <= endOfMonth;
//     });

//     // ✅ Always add absolute value of amount to total
//     this.thisMonthExpenses = monthlyExpenses.reduce(
//       (sum: number, e: Expense) => sum + Math.abs(e.amount),
//       0
//     );

//     // Show latest 5 transactions
//     this.recentTransactions = expenses
//       .sort((a, b) => {
//         const dateA = a.date instanceof Timestamp ? a.date.toDate() : new Date(a.date);
//         const dateB = b.date instanceof Timestamp ? b.date.toDate() : new Date(b.date);
//         return dateB.getTime() - dateA.getTime();
//       })
//       .slice(0, 5);
//   }

//   editTransaction(expense: Expense) {
//     // TODO: Implement your edit logic here
//     console.log('Edit:', expense);
//   }
// }

// =============================================
// import { Component, OnInit } from '@angular/core';
// import { ExpenseChartComponent } from '../../components/expense-chart/expense-chart.component';
// import { LogoutBtnComponent } from '../../components/logout-btn/logout-btn.component';
// import { BalanceComponent } from '../../components/balance/balance.component';
// import { AddExpenseBtnComponent } from '../../components/add-expense-btn/add-expense-btn.component';
// import { RecentTransactionsComponent } from '../../components/recent-transactions/recent-transactions.component';
// import { ExpenseService } from '../../services/expense.service.ts.service';
// import { Expense } from '../../models/expense';
// import { Timestamp } from 'firebase/firestore';

// @Component({
//   selector: 'app-home',
//   standalone: true,
//   imports: [
//     ExpenseChartComponent,
//     LogoutBtnComponent,
//     BalanceComponent,
//     AddExpenseBtnComponent,
//     RecentTransactionsComponent,
//   ],
//   templateUrl: './home.component.html',
//   styleUrl: './home.component.css',
// })
// export class HomeComponent implements OnInit {
//   thisMonthExpenses: number = 0;
//   totalTransactions: number = 0;
//   recentTransactions: { docId: string, data: Expense }[] = [];

//   constructor(private expenseService: ExpenseService) {}

//   async ngOnInit() {
//     const expenses = await this.expenseService.getExpensesForUser();
//     this.totalTransactions = expenses.length;

//     const now = new Date();
//     const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
//     const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

//     // Calculate total this month expenses
//     const monthlyExpenses = expenses.filter(e => {
//       const date = this.getDateFromExpense(e.data.date);
//       return date >= startOfMonth && date <= endOfMonth;
//     });

//     this.thisMonthExpenses = monthlyExpenses.reduce(
//       (sum, e) => sum + Math.abs(e.data.amount),
//       0
//     );

//     // Get latest 5 transactions
//     this.recentTransactions = expenses
//       .sort((a, b) => {
//         const dateA = this.getDateFromExpense(a.data.date);
//         const dateB = this.getDateFromExpense(b.data.date);
//         return dateB.getTime() - dateA.getTime();
//       })
//       .slice(0, 5);
//   }

//   private getDateFromExpense(date: any): Date {
//     if (date instanceof Timestamp) return date.toDate();
//     if (typeof date === 'object' && 'toDate' in date) return date.toDate();
//     return new Date(date);
//   }





// }

import { Component, OnInit } from '@angular/core';
import { ExpenseChartComponent } from '../../components/expense-chart/expense-chart.component';
import { LogoutBtnComponent } from '../../components/logout-btn/logout-btn.component';
import { BalanceComponent } from '../../components/balance/balance.component';
import { AddExpenseBtnComponent } from '../../components/add-expense-btn/add-expense-btn.component';
import { RecentTransactionsComponent } from '../../components/recent-transactions/recent-transactions.component';
import { ExpenseService } from '../../services/expense.service.ts.service';
import { Expense } from '../../models/expense';
import { Timestamp, doc, updateDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { Firestore } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    ExpenseChartComponent,
    LogoutBtnComponent,
    BalanceComponent,
    AddExpenseBtnComponent,
    RecentTransactionsComponent,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit {
  thisMonthExpenses: number = 0;
  totalTransactions: number = 0;
  recentTransactions: { docId: string, data: Expense }[] = [];

  selectedDocId: string | null = null;
  editDescription = '';
  editAmount = 0;

  constructor(
    private expenseService: ExpenseService,
    private firestore: Firestore,
    private auth: Auth
  ) {}

  async ngOnInit() {
    await this.loadTransactions();
  }

  private getDateFromExpense(date: any): Date {
    if (date instanceof Timestamp) return date.toDate();
    if (typeof date === 'object' && 'toDate' in date) return date.toDate();
    return new Date(date);
  }

  async loadTransactions() {
    const expenses = await this.expenseService.getExpensesForUser();
    this.totalTransactions = expenses.length;

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const monthlyExpenses = expenses.filter(e => {
      const date = this.getDateFromExpense(e.data.date);
      return date >= startOfMonth && date <= endOfMonth;
    });

    this.thisMonthExpenses = monthlyExpenses.reduce(
      (sum, e) => sum + Math.abs(e.data.amount),
      0
    );

    this.recentTransactions = expenses
      .sort((a, b) => {
        const dateA = this.getDateFromExpense(a.data.date);
        const dateB = this.getDateFromExpense(b.data.date);
        return dateB.getTime() - dateA.getTime();
      })
      .slice(0, 5);
  }

  edit(tx: { docId: string, data: Expense }) {
    this.selectedDocId = tx.docId;
    this.editDescription = tx.data.description;
    this.editAmount = tx.data.amount;
  }

  cancelEdit() {
    this.selectedDocId = null;
  }

  async saveEdit(docId: string, originalAmount: number) {
    const docRef = doc(this.firestore, 'expenses', docId);
    await updateDoc(docRef, {
      description: this.editDescription,
      amount: this.editAmount,
    });
    await this.updateBalance(this.editAmount - originalAmount);
    this.selectedDocId = null;
    await this.loadTransactions();
  }

  async deleteExpense(docId: string, amount: number) {
    await deleteDoc(doc(this.firestore, 'expenses', docId));
    await this.updateBalance(amount);
    this.selectedDocId = null;
    await this.loadTransactions();
  }

  async updateBalance(delta: number) {
    const user = this.auth.currentUser;
    if (!user) return;
    const userRef = doc(this.firestore, 'users', user.uid);
    const userSnap = await getDoc(userRef);
    const userData: any = userSnap.data();
    const newBalance = (userData?.balance || 0) + delta;
    await updateDoc(userRef, { balance: newBalance });
  }
}
