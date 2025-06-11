import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Firestore, doc, updateDoc, deleteDoc, getDoc } from '@angular/fire/firestore';
import { Expense } from '../../models/expense';
import { Auth } from '@angular/fire/auth';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-recent-transactions',
  standalone: true,
  imports: [CommonModule, FormsModule,RouterModule],
  templateUrl: './recent-transactions.component.html',
  styleUrl: './recent-transactions.component.css',
})
export class RecentTransactionsComponent {
  @Input() transactions: { docId: string, data: Expense }[] = [];
  @Output() dataChanged = new EventEmitter<void>();

  selectedDocId: string | null = null;
  editDescription = '';
  editAmount = 0;

  constructor(private firestore: Firestore, private auth: Auth) {}

  formatAmount(amount: number): string {
    return `- $${Math.abs(amount).toFixed(2)}`;
  }

  edit(docId: string, expense: Expense) {
    this.selectedDocId = docId;
    this.editDescription = expense.description;
    this.editAmount = expense.amount;
  }

  cancelEdit() {
    this.selectedDocId = null;
  }

  async saveEdit(docId: string) {
    const docRef = doc(this.firestore, 'expenses', docId);
    await updateDoc(docRef, {
      description: this.editDescription,
      amount: this.editAmount,
    });
    this.selectedDocId = null;
    this.dataChanged.emit(); // notify HomeComponent to reload
  }

  async deleteExpense(docId: string, amount: number) {
    const docRef = doc(this.firestore, 'expenses', docId);
    await deleteDoc(docRef);

    // restore balance
    const user = this.auth.currentUser;
    if (user) {
      const userRef = doc(this.firestore, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      const userData: any = userSnap.data();
const newBalance = (userData?.balance || 0) + amount;
await updateDoc(userRef, { balance: newBalance });
    }

    this.dataChanged.emit(); // notify HomeComponent to reload
  }
}
