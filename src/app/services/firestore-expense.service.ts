import { inject, Injectable } from '@angular/core';
import { Firestore, collection, addDoc } from '@angular/fire/firestore';
import { Timestamp } from 'firebase/firestore';
import { Expense } from '../models/expense';

@Injectable({
  providedIn: 'root',
})
export class FirestoreExpenseService {
  private firestore = inject(Firestore);

  constructor() {}

async addExpense(expense: Expense): Promise<void> {
  const expensesCollection = collection(this.firestore, 'expenses');
  await addDoc(expensesCollection, { ...expense });
}

}
