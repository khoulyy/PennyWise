import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Auth, User } from '@angular/fire/auth';
import { Firestore, doc, getDoc, updateDoc, setDoc } from '@angular/fire/firestore';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';

interface UserProfile {
  name: string;
  email: string;
  balance: number;
  createdAt?: Date;
  lastLogin?: Date;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, SidebarComponent],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  private auth = inject(Auth);
  private firestore = inject(Firestore);

  profile: UserProfile = {
    name: '',
    email: '',
    balance: 0
  };

  originalBalance: number = 0; // Store original balance for comparison
  isEditing = false;
  successMessage = '';
  errorMessage = '';

  ngOnInit() {
    this.loadUserProfile();
  }

  private async loadUserProfile() {
    const user = this.auth.currentUser;
    if (!user) return;
    try {
      const userDoc = doc(this.firestore, 'users', user.uid);
      const userSnap = await getDoc(userDoc);
      
      if (userSnap.exists()) {
        const data = userSnap.data();
        this.profile = {
          name: data['name'] ?? '',
          email: user.email ?? '',
          balance: data['balance'] ?? 0,
          createdAt: user.metadata.creationTime ? new Date(user.metadata.creationTime) : undefined,
          lastLogin: user.metadata.lastSignInTime ? new Date(user.metadata.lastSignInTime) : undefined
        };
        this.originalBalance = this.profile.balance;
      } else {
        // Initialize new user profile if document doesn't exist
        const newProfile = {
          name: '',
          email: user.email ?? '',
          balance: 0,
          createdAt: user.metadata.creationTime ? new Date(user.metadata.creationTime) : undefined,
          lastLogin: user.metadata.lastSignInTime ? new Date(user.metadata.lastSignInTime) : undefined
        };
        // Create the user document
        await setDoc(userDoc, newProfile);
        this.profile = newProfile;
        this.originalBalance = 0;
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      this.errorMessage = 'Failed to load profile data';
      setTimeout(() => this.errorMessage = '', 3000);
    }
  }

  async saveProfile() {
    const user = this.auth.currentUser;
    if (!user) {
      this.errorMessage = 'No user logged in';
      setTimeout(() => this.errorMessage = '', 3000);
      return;
    }

    try {
      const userDoc = doc(this.firestore, 'users', user.uid);
      const updates = {
        name: this.profile.name,
        balance: this.profile.balance,
        lastUpdated: new Date()
      };
      
      await updateDoc(userDoc, updates);
      this.originalBalance = this.profile.balance; // Update original balance after successful save
      this.isEditing = false;
      this.successMessage = 'Profile updated successfully';
      setTimeout(() => this.successMessage = '', 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
      this.errorMessage = 'Failed to update profile';
      setTimeout(() => this.errorMessage = '', 3000);
    }
  }

  cancelEdit() {
    this.profile.balance = this.originalBalance; // Restore original balance
    this.loadUserProfile(); // Reload original data
    this.isEditing = false;
  }

  formatDate(date?: Date): string {
    if (!date) return 'Not available';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
