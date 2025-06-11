import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Firestore, doc, onSnapshot } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';

@Component({
  selector: 'app-balance',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './balance.component.html',
  styleUrls: ['./balance.component.css']
})
export class BalanceComponent implements OnInit {
  private firestore = inject(Firestore);
  private auth = inject(Auth);
  
  balance: number = 0;

  ngOnInit() {
    const user = this.auth.currentUser;
    if (!user) return;

    const userDoc = doc(this.firestore, 'users', user.uid);
    onSnapshot(userDoc, (doc) => {
      if (doc.exists()) {
        this.balance = doc.data()['balance'] ?? 0;
      }
    });
  }
}
