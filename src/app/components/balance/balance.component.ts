import { Component, inject, OnInit } from '@angular/core';
import { FirestoreUserService } from '../../services/firestore-user.service';
import { NgIf, AsyncPipe, DecimalPipe } from '@angular/common';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-balance',
  standalone: true,
  imports: [NgIf, AsyncPipe, DecimalPipe],
  templateUrl: './balance.component.html',
  styleUrl: './balance.component.css',
})
export class BalanceComponent implements OnInit {
  balance$: Observable<number | null>;
  private firestoreUserService = inject(FirestoreUserService);

  constructor() {
    this.balance$ = this.firestoreUserService.getUserBalance$();
  }

  ngOnInit() {}
}
