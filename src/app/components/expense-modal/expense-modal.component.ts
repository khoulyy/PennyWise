import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalService } from '../../services/modal.service';
import { Firestore, doc, updateDoc, collection, addDoc, Timestamp, increment } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { FirestoreExpenseService } from '../../services/firestore-expense.service';

@Component({
  selector: 'app-expense-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div *ngIf="modalService.modalState$ | async" class="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" (click)="modalService.closeModal()"></div>
      
      <!-- Modal -->
      <div class="relative bg-white/90 rounded-3xl shadow-2xl w-full max-w-lg border border-pennywise-accent animate-fade-in backdrop-blur-xl">
        <!-- Close Button -->
        <button
          (click)="modalService.closeModal()"
          class="absolute top-4 right-4 text-gray-400 hover:text-pennywise-primary transition p-2 -m-2"
          aria-label="Close"
        >
          <svg class="h-6 w-6 sm:h-7 sm:w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <!-- Modal Content -->
        <div class="p-6 sm:p-8">
          <!-- Modal Title -->
          <h3 class="text-xl sm:text-2xl font-extrabold mb-6 text-pennywise-primary text-center tracking-tight">
            Add Expense
          </h3>

          <!-- Form -->
          <form (ngSubmit)="addExpense()" #expenseForm="ngForm" class="flex flex-col gap-4 sm:gap-5">
            <!-- Amount & Category -->
            <div class="flex flex-col gap-4 sm:flex-row sm:gap-4">
              <input
                type="number"
                [(ngModel)]="amount"
                name="amount"
                required
                min="0"
                placeholder="Amount"
                class="flex-1 rounded-xl border border-pennywise-accent px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-pennywise-primary text-base sm:text-lg bg-pennywise-accent/20 placeholder:text-pennywise-primary"
                autofocus
              />

              <div class="flex-1">
                <select
                  [(ngModel)]="category"
                  name="category"
                  required
                  class="w-full rounded-xl border border-pennywise-accent px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-pennywise-primary text-base sm:text-lg bg-pennywise-accent/20 text-gray-700"
                >
                  <option value="" disabled>Select Category</option>
                  <option value="grocery">Grocery</option>
                  <option value="transport">Transport</option>
                  <option value="entertainment">Entertainment</option>
                  <option value="utilities">Utilities</option>
                  <option value="health">Health</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <!-- Description -->
            <textarea
              [(ngModel)]="description"
              name="description"
              required
              placeholder="Description"
              rows="2"
              class="rounded-xl border border-pennywise-accent px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-pennywise-primary text-base sm:text-lg bg-pennywise-accent/20 placeholder:text-pennywise-primary resize-none"
            ></textarea>

            <!-- Date -->
            <div>
              <label for="expense-date" class="block text-sm font-medium text-pennywise-primary mb-1">Date</label>
              <input
                type="date"
                id="expense-date"
                [(ngModel)]="date"
                name="date"
                required
                class="w-full rounded-xl border border-pennywise-accent px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-pennywise-primary text-base sm:text-lg bg-pennywise-accent/20 transition"
              />
            </div>

            <!-- Error Message -->
            <p *ngIf="balanceError" class="text-red-500 font-medium text-sm mt-1 text-center">
              ❌ Balance is not enough to cover this expense.
            </p>

            <!-- Submit -->
            <button
              type="submit"
              [disabled]="expenseForm.invalid || loading"
              class="mt-2 bg-pennywise-primary text-white px-6 py-3 rounded-xl font-bold shadow hover:bg-pennywise-secondary transition text-base sm:text-lg tracking-wide flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-pennywise-accent disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ng-container *ngIf="loading; else addText">
                <svg class="animate-spin h-5 w-5 mr-2 text-white" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Adding...
              </ng-container>
              <ng-template #addText>Add Expense</ng-template>
            </button>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: contents;
    }
  `]
})
export class ExpenseModalComponent implements OnInit {
  modalService = inject(ModalService);
  private firestore = inject(Firestore);
  private auth = inject(Auth);
  private router = inject(Router);
  private expenseService = inject(FirestoreExpenseService);

  amount: number | null = null;
  category = '';
  description = '';
  date!: string;
  balanceError = false;
  loading = false;

  ngOnInit() {
    // Set default date to today
    this.date = new Date().toISOString().split('T')[0];
  }

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

    try {
      // Check if user has enough balance
      const currentBalance = await this.expenseService.getTotalBalance(user.uid);
      if (currentBalance < this.amount) {
        this.balanceError = true;
        this.loading = false;
        return;
      }

      const expenseAmount = -Math.abs(this.amount);

      // Add expense to expenses collection
      await this.expenseService.addExpense({
        amount: expenseAmount,
        category: this.category,
        description: this.description,
        date: jsDate,
        uId: user.uid
      });

      // Update user's balance
      await this.expenseService.updateUserBalance(user.uid, expenseAmount);

      this.resetForm();
      this.modalService.closeModal();
      
      // Navigate to the current route to trigger a refresh
      const currentUrl = this.router.url;
      this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
        this.router.navigate([currentUrl]);
      });
    } catch (error) {
      console.error('Error adding expense:', error);
    } finally {
      this.loading = false;
    }
  }

  private resetForm() {
    this.amount = null;
    this.category = '';
    this.description = '';
    this.date = new Date().toISOString().split('T')[0];
    this.balanceError = false;
  }
} 