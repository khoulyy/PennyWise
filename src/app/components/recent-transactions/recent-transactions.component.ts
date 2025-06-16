import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Firestore, collection, query, where, limit, onSnapshot, Timestamp } from '@angular/fire/firestore';
import { Auth, onAuthStateChanged, Unsubscribe } from '@angular/fire/auth';

interface Transaction {
  id: string;
  description: string;
  amount: number;
  date: Date;
  category?: string;
}

interface FirestoreTransaction {
  id: string;
  description: string;
  amount: number;
  date: Timestamp;
  category?: string;
  uId: string;
}

@Component({
  selector: 'app-recent-transactions',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './recent-transactions.component.html',
  styleUrls: ['./recent-transactions.component.css']
})
export class RecentTransactionsComponent implements OnInit, OnDestroy {
  private firestore = inject(Firestore);
  private auth = inject(Auth);
  private unsubscribeAuth: Unsubscribe | undefined;
  private unsubscribeSnapshot: Unsubscribe | undefined;

  transactions: Transaction[] = [];

  ngOnInit() {
    this.unsubscribeAuth = onAuthStateChanged(this.auth, (user) => {
      if (user) {
        const expensesRef = collection(this.firestore, 'expenses');
        const q = query(
          expensesRef,
          where('uId', '==', user.uid),
          limit(20)
        );

        this.unsubscribeSnapshot = onSnapshot(q, (snapshot) => {
          this.transactions = snapshot.docs
            .map(doc => {
              const data = doc.data();
              return {
                id: doc.id,
                description: data['description'],
                amount: data['amount'],
                date: data['date']?.toDate() ?? new Date(),
                category: data['category']
              };
            })
            .sort((a, b) => b.date.getTime() - a.date.getTime())
            .slice(0, 5);
        }, (error) => {
          console.error('Error fetching transactions:', error);
        });
      } else {
        this.transactions = [];
      }
    });
  }

  ngOnDestroy() {
    if (this.unsubscribeAuth) {
      this.unsubscribeAuth();
    }
    if (this.unsubscribeSnapshot) {
      this.unsubscribeSnapshot();
    }
  }
}
