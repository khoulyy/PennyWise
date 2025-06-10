import { inject, Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  query,
  where,
  getDocs,
} from '@angular/fire/firestore';
import {
  Auth,
  onAuthStateChanged,
  User as FirebaseUser,
} from '@angular/fire/auth';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FirestoreUserService {
  private firestore = inject(Firestore);
  private auth = inject(Auth);

  constructor() {}

  /**
   * Get the balance for the currently authenticated user as an Observable
   */
  getUserBalance$(): Observable<number | null> {
    // Listen to auth state changes to support live user switching
    return new Observable<number | null>((subscriber) => {
      const unsubscribe = onAuthStateChanged(
        this.auth,
        async (user: FirebaseUser | null) => {
          if (!user) {
            subscriber.next(null);
            return;
          }
          // Query the users collection for a document where uId == user.uid
          const usersCollection = collection(this.firestore, 'users');
          const q = query(usersCollection, where('uId', '==', user.uid));
          const querySnapshot = await getDocs(q);
          if (querySnapshot.empty) {
            subscriber.next(null);
            return;
          }
          const data = querySnapshot.docs[0].data();
          const balance =
            typeof data['balance'] === 'number'
              ? data['balance']
              : Number(data['balance']);
          subscriber.next(!isNaN(balance) ? balance : null);
        }
      );
      return { unsubscribe };
    });
  }
}
