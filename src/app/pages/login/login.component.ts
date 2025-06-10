import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  email = '';
  password = '';
  errorMessage = '';
  loading = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  async login() {
    this.loading = true;
    this.errorMessage = '';

    try {
      await this.authService.login(this.email, this.password);
      this.router.navigate(['/register']);
    } catch (error: any) {
      switch (error.code) {
        case 'auth/user-not-found':
          this.errorMessage = 'No account found. Please register first.';
          setTimeout(() => this.navigateToRegister(), 2000);
          break;
        case 'auth/wrong-password':
          this.errorMessage = 'Incorrect password.';
          break;
        case 'auth/invalid-email':
          this.errorMessage = 'Invalid email format.';
          break;
        default:
          this.errorMessage = 'Login failed. Try again.';
      }
    } finally {
      this.loading = false;
    }
  }

  navigateToRegister() {
    this.router.navigate(['/register']);
  }
}
