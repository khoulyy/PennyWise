import { Component, OnInit, HostListener, OnDestroy } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Auth, onAuthStateChanged, User, Unsubscribe } from '@angular/fire/auth';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
})
export class SidebarComponent implements OnInit, OnDestroy {
  collapsed = false;
  isLoggedIn = false;
  userInitial = '';
  userName = '';
  userEmail = '';
  mobileMenuOpen = false;
  isMobile = false;
  private authUnsubscribe: Unsubscribe | undefined;

  constructor(
    private router: Router,
    private auth: Auth,
    private firestore: Firestore
  ) {
    this.initializeSidebarState();
  }

  private initializeSidebarState() {
    // Load collapsed state from localStorage
    try {
      const savedState = localStorage.getItem('sidebarCollapsed');
      this.collapsed = savedState === 'true';
    } catch (error) {
      console.error('Error loading sidebar state:', error);
      this.collapsed = false;
    }
    
    // Check initial screen size
    this.checkScreenSize();
  }

  @HostListener('window:resize')
  onResize() {
    this.checkScreenSize();
  }

  private checkScreenSize() {
    const wasMobile = this.isMobile;
    this.isMobile = window.innerWidth < 1024; // lg breakpoint
    
    // Handle state changes when switching between mobile and desktop
    if (wasMobile !== this.isMobile) {
      if (this.isMobile) {
        // Switching to mobile: close mobile menu and reset collapse state
        this.mobileMenuOpen = false;
        this.collapsed = false;
      } else {
        // Switching to desktop: restore collapse state from localStorage
        try {
          const savedState = localStorage.getItem('sidebarCollapsed');
          this.collapsed = savedState === 'true';
        } catch (error) {
          console.error('Error restoring sidebar state:', error);
          this.collapsed = false;
        }
      }
    }
  }

  toggleMobileMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  ngOnInit() {
    this.authUnsubscribe = onAuthStateChanged(this.auth, async (user) => {
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

  ngOnDestroy() {
    if (this.authUnsubscribe) {
      this.authUnsubscribe();
    }
  }

  toggleSidebar() {
    if (!this.isMobile) {
      this.collapsed = !this.collapsed;
      // Save collapsed state to localStorage
      try {
        localStorage.setItem('sidebarCollapsed', this.collapsed.toString());
      } catch (error) {
        console.error('Error saving sidebar state:', error);
      }
    }
  }

  logout() {
    this.auth.signOut().then(() => {
      this.router.navigate(['/']);
    }).catch((error) => {
      console.error('Error signing out:', error);
    });
  }
}
