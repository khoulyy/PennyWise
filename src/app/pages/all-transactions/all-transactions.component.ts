import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Expense } from '../../models/expense';
import { ExpenseService } from '../../services/expense.service.ts.service';
import { Firestore, doc, updateDoc, deleteDoc, getDoc } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';

@Component({
  selector: 'app-all-transactions',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './all-transactions.component.html',
  styleUrl: './all-transactions.component.css',
})
export class AllTransactionsComponent implements OnInit {
  transactions: { docId: string; data: Expense }[] = [];
  currentPage = 1;
  itemsPerPage = 10;
  totalSpent = 0;
  balance = 0;

  selectedDocId: string | null = null;
  editDescription = '';
  editAmount = 0;

  constructor(
    private expenseService: ExpenseService,
    private firestore: Firestore,
    private auth: Auth
  ) {}

  async ngOnInit() {
    await this.loadData();
  }

  async loadData() {
    const user = this.auth.currentUser;
    if (!user) return;

    // Load expenses
    this.transactions = await this.expenseService.getExpensesForUser();

    // Load balance
    const userRef = doc(this.firestore, 'users', user.uid);
    const userSnap = await getDoc(userRef);
    const userData = userSnap.data();
    this.balance = (userData && 'balance' in userData) ? (userData as any).balance : 0;


    // Calculate total spent
    this.totalSpent = this.transactions.reduce((sum, tx) => sum + Math.abs(tx.data.amount), 0);
  }

  get paginatedTransactions() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.transactions.slice(start, start + this.itemsPerPage);
  }

  get totalPages(): number {
    return Math.ceil(this.transactions.length / this.itemsPerPage);
  }

  goToPage(page: number) {
    this.currentPage = page;
  }

  formatAmount(amount: number): string {
    return `- $${Math.abs(amount).toFixed(2)}`;
  }

  edit(tx: { docId: string; data: Expense }) {
    this.selectedDocId = tx.docId;
    this.editDescription = tx.data.description;
    this.editAmount = tx.data.amount;
  }

  cancelEdit() {
    this.selectedDocId = null;
  }

  async saveEdit(docId: string) {
    const user = this.auth.currentUser;
    if (!user) return;

    const oldTx = this.transactions.find(t => t.docId === docId);
    if (!oldTx) return;

    const difference = this.editAmount - oldTx.data.amount;

    // Update the expense
    const docRef = doc(this.firestore, 'expenses', docId);
    await updateDoc(docRef, {
      description: this.editDescription,
      amount: this.editAmount
    });

    // Update balance
    const userRef = doc(this.firestore, 'users', user.uid);
    await updateDoc(userRef, {
      balance: this.balance - difference
    });

    this.selectedDocId = null;
    await this.loadData();
  }

  async deleteExpense(docId: string, amount: number) {
    const user = this.auth.currentUser;
    if (!user) return;

    // Delete expense
    await deleteDoc(doc(this.firestore, 'expenses', docId));

    // Add amount back to balance
    const userRef = doc(this.firestore, 'users', user.uid);
    await updateDoc(userRef, {
      balance: this.balance + amount
    });

    await this.loadData();
  }
}
