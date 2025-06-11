import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Auth, onAuthStateChanged, User } from '@angular/fire/auth';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
})
export class SidebarComponent implements OnInit {
  collapsed = false;
  isLoggedIn = false;
  userInitial = '';
  userName = '';
  userEmail = '';

  constructor(
    private router: Router,
    private auth: Auth,
    private firestore: Firestore
  ) {
    // Load collapsed state from localStorage
    const savedState = localStorage.getItem('sidebarCollapsed');
    this.collapsed = savedState === 'true';
  }

  ngOnInit() {
    onAuthStateChanged(this.auth, async (user) => {
      this.isLoggedIn = !!user;
      if (user) {
        this.userEmail = user.email || '';
        this.userInitial = user.email?.[0].toUpperCase() || '?';
        
        // Get user profile data
        try {
          const userDoc = await getDoc(doc(this.firestore, 'users', user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            this.userName = data['name'] || '';
            if (this.userName) {
              this.userInitial = this.userName[0].toUpperCase();
            }
          }
        } catch (error) {
          console.error('Error loading user profile:', error);
        }
      } else {
        this.router.navigate(['/']);
      }
    });
  }

  toggleSidebar() {
    this.collapsed = !this.collapsed;
    // Save collapsed state to localStorage
    localStorage.setItem('sidebarCollapsed', this.collapsed.toString());
  }

  logout() {
    this.auth.signOut().then(() => {
      this.router.navigate(['/']);
    }).catch((error) => {
      console.error('Error signing out:', error);
    });
  }
}
