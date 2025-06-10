import { BalanceComponent } from './../components/balance/balance.component';
import { inject, Injectable } from '@angular/core';
import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  UserCredential
} from '@angular/fire/auth';

import { Firestore, doc, setDoc } from '@angular/fire/firestore';
import { User as AppUser } from '../models/user'; // ✅ Avoid name clash

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private auth = inject(Auth);
  private firestore = inject(Firestore);

async register(email: string, password: string, userData: { uName: string; mobile: string }): Promise<UserCredential> {
  const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);

  const newUser: AppUser = {
    uId: userCredential.user.uid,
    email: userCredential.user.email ?? '',
    uName: userData.uName,
    mobile: userData.mobile,
    balance: 0
  };

  const userDocRef = doc(this.firestore, `users/${newUser.uId}`);
  await setDoc(userDocRef, newUser);

  return userCredential;
}


  async login(email: string, password: string): Promise<UserCredential> {
  try {
    return await signInWithEmailAndPassword(this.auth, email, password);
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
}

async logout(): Promise<void> {
  try {
    await signOut(this.auth);
    
  } catch (error) {
    console.error('Logout failed:', error);
    throw error;
  }
}

}
