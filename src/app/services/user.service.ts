import { Injectable } from '@angular/core';
import { Firestore, doc, getDoc, updateDoc, setDoc } from '@angular/fire/firestore';

export interface UserData {
  name?: string;
  email?: string;
  balance?: number;
  preferences?: {
    emailNotifications?: boolean;
    transactionAlerts?: boolean;
  };
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(private firestore: Firestore) {}

  async getUserData(userId: string): Promise<UserData | null> {
    try {
      const userDoc = doc(this.firestore, 'users', userId);
      const userSnap = await getDoc(userDoc);
      
      if (userSnap.exists()) {
        return userSnap.data() as UserData;
      }
      return null;
    } catch (error) {
      console.error('Error getting user data:', error);
      throw error;
    }
  }

  async updateUserData(userId: string, data: Partial<UserData>): Promise<void> {
    try {
      const userDoc = doc(this.firestore, 'users', userId);
      await updateDoc(userDoc, data);
    } catch (error) {
      console.error('Error updating user data:', error);
      throw error;
    }
  }

  async updateUserPreferences(userId: string, preferences: UserData['preferences']): Promise<void> {
    try {
      const userDoc = doc(this.firestore, 'users', userId);
      await updateDoc(userDoc, { preferences });
    } catch (error) {
      console.error('Error updating user preferences:', error);
      throw error;
    }
  }

  async createUserData(userId: string, data: UserData): Promise<void> {
    try {
      const userDoc = doc(this.firestore, 'users', userId);
      await setDoc(userDoc, data);
    } catch (error) {
      console.error('Error creating user data:', error);
      throw error;
    }
  }
} 