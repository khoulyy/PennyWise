import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FirestoreExpenseService } from '../../services/firestore-expense.service';
import { inject } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { Timestamp } from 'firebase/firestore';

@Component({
  selector: 'app-add-expense-btn',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-expense-btn.component.html',
  styleUrl: './add-expense-btn.component.css',
})
export class AddExpenseBtnComponent {
  showModal = false;
  amount: number | null = null;
  category = '';
  description = '';
  date!: string; // holds yyyy-MM-dd value

  categories = [
    'grocery',
    'transport',
    'entertainment',
    'utilities',
    'health',
    'other',
  ];

  private expenseService = inject(FirestoreExpenseService);
  private auth = inject(Auth);
  balanceError = false;
  loading = false;

  async addExpense() {
    this.balanceError = false;
    this.loading = true;

    if (!this.amount || !this.category || !this.description || !this.date) {
      this.loading = false;
      return;
    }

    const jsDate = new Date(this.date);
    if (isNaN(jsDate.getTime())) {
      console.error('❌ Invalid date format:', this.date);
      this.loading = false;
      return;
    }

    const user = this.auth.currentUser;
    if (!user) {
      this.loading = false;
      return;
    }

    const currentBalance = await this.expenseService.getTotalBalance(user.uid);
    console.log('Current Balance:', currentBalance);
    console.log('Requested Expense Amount:', this.amount);
    if (currentBalance < this.amount) {
      this.balanceError = true;
      this.loading = false;
      return;
    }

    // Save as negative amount
    await this.expenseService.addExpense({
      amount: Math.abs(this.amount), // ensure it's negative
      category: this.category,
      description: this.description,
      date: jsDate,
      uId: user.uid,
    });
    await this.expenseService.updateUserBalance(
      user.uid,
      -Math.abs(this.amount)
    );

    this.resetForm();
    this.loading = false;
    window.location.reload();
  }

  private resetForm() {
    this.showModal = false;
    this.amount = null;
    this.category = '';
    this.description = '';
    this.date = '';
  }
}
