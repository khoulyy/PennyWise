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

  categories = ['grocery', 'transport', 'entertainment', 'utilities', 'health', 'other'];

  private expenseService = inject(FirestoreExpenseService);
  private auth = inject(Auth);

async addExpense() {
  if (!this.amount || !this.category || !this.description || !this.date) return;

  console.log('Picked date string:', this.date);

  const jsDate = new Date(this.date);
if (isNaN(jsDate.getTime())) {
  console.error('❌ Invalid date format:', this.date);
  return;
}

  const user = this.auth.currentUser;
  if (!user) return;

await this.expenseService.addExpense({
  amount: this.amount,
  category: this.category,
  description: this.description,
  date: jsDate, // Date object, Firestore handles this
  uId: user.uid,
});

  this.resetForm();
}





  private resetForm() {
    this.showModal = false;
    this.amount = null;
    this.category = '';
    this.description = '';
    this.date = '';
  }
}
