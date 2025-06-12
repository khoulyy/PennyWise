import { Injectable, inject } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, User, onAuthStateChanged, updateProfile } from '@angular/fire/auth';
import { Firestore, doc, setDoc, getDoc } from '@angular/fire/firestore';
import { BehaviorSubject, Observable, from, of } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';

interface UserData {
  name: string;  // Corrected from uName to name
  mobile: string;
  email?: string;
  createdAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth: Auth = inject(Auth);
  private firestore: Firestore = inject(Firestore);
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private userDataSubject = new BehaviorSubject<UserData | null>(null);

  currentUser$ = this.currentUserSubject.asObservable();
  userData$ = this.userDataSubject.asObservable();

  constructor() {
    onAuthStateChanged(this.auth, async (user) => {
      console.log('Auth state changed:', user?.email); // Debug log
      this.currentUserSubject.next(user);
      
      if (user) {
        try {
          const userDoc = await getDoc(doc(this.firestore, 'users', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data() as UserData;
            console.log('Retrieved user data from Firestore:', userData); // Debug log
            this.userDataSubject.next(userData);
          } else {
            console.log('No user data found in Firestore for:', user.uid); // Debug log
            this.userDataSubject.next(null);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          this.userDataSubject.next(null);
        }
      } else {
        this.userDataSubject.next(null);
      }
    });
  }

  async register(email: string, password: string, userData: UserData): Promise<void> {
    try {
      console.log('Starting registration process...'); // Debug log
      console.log('Registration data:', { email, userData }); // Debug log

      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      const user = userCredential.user;
      console.log('User account created:', user.uid); // Debug log

      await updateProfile(user, {
        displayName: userData.name  // Use userData.name
      });
      console.log('User profile updated with name:', userData.name); // Debug log

      const dataToStore: UserData = {
        name: userData.name,  // Store as 'name' in Firestore
        mobile: userData.mobile,
        email: email,
        createdAt: new Date().toISOString()
      };
      
      console.log('Storing user data in Firestore:', dataToStore); // Debug log
      
      const userRef = doc(this.firestore, 'users', user.uid);
      await setDoc(userRef, dataToStore, { merge: false });
      
      const storedDoc = await getDoc(userRef);
      if (storedDoc.exists()) {
        const storedData = storedDoc.data() as UserData;
        console.log('Verified stored user data:', storedData); // Debug log
        this.userDataSubject.next(storedData);
      } else {
        console.error('Failed to verify stored user data - document does not exist');
        throw new Error('Failed to store user data');
      }

    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  async login(email: string, password: string): Promise<void> {
    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      const user = userCredential.user;
      console.log('User logged in:', user.uid); // Debug log

      const userDoc = await getDoc(doc(this.firestore, 'users', user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data() as UserData;
        console.log('Retrieved user data on login:', userData); // Debug log
        this.userDataSubject.next(userData);
      } else {
        console.error('No user data found in Firestore for logged in user');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      await signOut(this.auth);
      this.userDataSubject.next(null);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }

  getCurrentUser(): Observable<User | null> {
    return this.currentUser$;
  }

  getUserData(): Observable<UserData | null> {
    return this.userData$;
  }

  isAuthenticated(): Observable<boolean> {
    return this.currentUser$.pipe(map(user => !!user));
  }
}
