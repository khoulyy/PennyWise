import { BalanceComponent } from './../components/balance/balance.component';
import { inject, Injectable } from '@angular/core';
import { Firestore, collection, addDoc, query, where, getDocs } from '@angular/fire/firestore';
import { Expense } from '../models/expense';
import { doc, getDoc, updateDoc } from '@angular/fire/firestore';


@Injectable({
  providedIn: 'root',
})
export class FirestoreExpenseService {
  private firestore = inject(Firestore);

  constructor() {}

  // Add a new expense to the 'expense' collection
  async addExpense(expense: Expense): Promise<void> {
    const expensesCollection = collection(this.firestore, 'expenses'); // ✅ Collection name must match your DB
    await addDoc(expensesCollection, { ...expense });
  }

  // Calculate total balance by summing all expense amounts for a specific user
async getTotalBalance(userId: string): Promise<number> {
  const userDocRef = doc(this.firestore, 'users', userId);
  const userSnap = await getDoc(userDocRef);

  if (!userSnap.exists()) {
    console.warn(`User document not found for ID: ${userId}`);
    return 0;
  }

  const data = userSnap.data();
  return data['balance'] || 0; // Safely access with bracket notation
}

  async updateUserBalance(userId: string, changeAmount: number): Promise<void> {
  const userDocRef = doc(this.firestore, 'users', userId);
  const userDocSnap = await getDoc(userDocRef);

  if (!userDocSnap.exists()) {
    throw new Error('User document not found');
  }

const currentBalance = userDocSnap.data()['balance'] || 0;
  await updateDoc(userDocRef, { balance: currentBalance + changeAmount });
}
}
