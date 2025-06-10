import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FirestoreExpenseService } from '../../services/firestore-expense.service';
import { inject } from '@angular/core';
import { Auth } from '@angular/fire/auth';

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
  private expenseService = inject(FirestoreExpenseService);
  private auth = inject(Auth);

  async addExpense() {
    if (!this.amount || !this.category || !this.description) return;
    const user = this.auth.currentUser;
    if (!user) return;
    await this.expenseService.addExpense({
      amount: this.amount,
      category: this.category,
      description: this.description,
      date: new Date().toISOString(),
      uId: user.uid,
    });
    this.showModal = false;
    this.amount = null;
    this.category = '';
    this.description = '';
  }
}
