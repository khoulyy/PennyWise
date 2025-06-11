import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  errorMessage = '';
  loading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit() {
    // Subscribe to form value changes to enable/disable the button
    this.loginForm.valueChanges.subscribe(() => {
      this.errorMessage = ''; // Clear error message when form changes
    });
  }

  async login() {
    if (this.loginForm.valid) {
      this.loading = true;
      this.errorMessage = '';

      try {
        const { email, password } = this.loginForm.value;
        await this.authService.login(email, password);
        this.router.navigate(['/home']);
      } catch (error: any) {
        switch (error.code) {
          case 'auth/user-not-found':
            this.errorMessage = 'No account found. Please register first.';
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
    } else {
      // Mark all fields as touched to trigger validation messages
      Object.keys(this.loginForm.controls).forEach(key => {
        const control = this.loginForm.get(key);
        control?.markAsTouched();
      });
    }
  }

  navigateToRegister() {
    this.router.navigate(['/register']);
  }
}
