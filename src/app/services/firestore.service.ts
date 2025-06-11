import { Injectable } from '@angular/core';
import { Firestore, collection, query, where, getDocs, doc, getDoc, Timestamp } from '@angular/fire/firestore';
import { Observable, from, map, tap } from 'rxjs';

export interface Transaction {
  docId: string;
  data: {
    amount: number;
    description: string;
    date: Timestamp;
    category: string;
    userId: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {
  constructor(private firestore: Firestore) {}

  getBalance(userId: string): Observable<number> {
    const userRef = doc(this.firestore, 'users', userId);
    return from(getDoc(userRef)).pipe(
      map(doc => doc.data()?.['balance'] ?? 0),
      tap(balance => console.log('Retrieved balance:', balance))
    );
  }

  getTransactionsByDateRange(
    userId: string,
    startDate: Timestamp,
    endDate: Timestamp
  ): Observable<Transaction[]> {
    console.log('Fetching transactions for user:', userId);
    console.log('Date range:', { start: startDate.toDate(), end: endDate.toDate() });

    const transactionsRef = collection(this.firestore, 'transactions');
    const q = query(
      transactionsRef,
      where('userId', '==', userId),
      where('date', '>=', startDate),
      where('date', '<=', endDate)
    );

    return from(getDocs(q)).pipe(
      tap(snapshot => console.log('Found transactions:', snapshot.size)),
      map(snapshot => 
        snapshot.docs.map(doc => {
          const data = doc.data() as Transaction['data'];
          console.log('Transaction data:', { id: doc.id, ...data });
          return {
            docId: doc.id,
            data
          };
        })
      ),
      tap(transactions => console.log('Processed transactions:', transactions))
    );
  }
} 