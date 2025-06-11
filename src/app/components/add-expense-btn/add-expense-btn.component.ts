import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FirestoreExpenseService } from '../../services/firestore-expense.service';
import { Auth } from '@angular/fire/auth';
import { Timestamp } from 'firebase/firestore';
import { ModalService } from '../../services/modal.service';

@Component({
  selector: 'app-add-expense-btn',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <button
      class="bg-pennywise-primary text-white px-7 py-2.5 rounded-xl shadow-lg hover:bg-pennywise-secondary transition font-semibold text-base flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-pennywise-accent"
      (click)="modalService.openModal()"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M12 4v16m8-8H4"
        />
      </svg>
      Add Expense
    </button>
  `,
  styles: [`
    :host {
      display: inline-block;
    }
  `]
})
export class AddExpenseBtnComponent {
  modalService = inject(ModalService);
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
      amount: -Math.abs(this.amount), // ensure it's negative
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
    this.amount = null;
    this.category = '';
    this.description = '';
    this.date = '';
  }
}
