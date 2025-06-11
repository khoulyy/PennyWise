import { Injectable } from '@angular/core';
import { Firestore, collection, query, where, getDocs } from '@angular/fire/firestore';
import { Auth, getAuth } from '@angular/fire/auth'; // ✅ modular Auth
import { Expense } from '../models/expense';

@Injectable({ providedIn: 'root' })
export class ExpenseService {
  constructor(private firestore: Firestore, private auth: Auth) {}

async getExpensesForUser(): Promise<{ docId: string, data: Expense }[]> {
  const user = this.auth.currentUser;
  if (!user) return [];

  const expenseQuery = query(
    collection(this.firestore, 'expenses'),
    where('uId', '==', user.uid)
  );

  const snapshot = await getDocs(expenseQuery);

  return snapshot.docs.map(doc => ({
    docId: doc.id,       // 🔁 Firestore document ID
    data: doc.data() as Expense
  }));
}

}
