import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule , // ✅ Required for [formGroup] and formControlName
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent {
  signupForm: FormGroup;           // ✅ Always defined
  errorMessage = '';              // Clearer initialization
  loading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    // Initialize the form once
    this.signupForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPass: ['', Validators.required],
      mobile: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });  // ✅ Use 'validators' array
  }

  // ✅ Validator must remain a method returning validation object or null
  passwordMatchValidator(form: FormGroup) {
    return form.get('password')?.value === form.get('confirmPass')?.value
      ? null : { mismatch: true };
  }
get navigateToLogin(): () => void {
  return () => this.router.navigate(['']);
}

  // ✅ Submit handler
  async onRegister() {
    if (this.signupForm.valid) {
      this.loading = true;
      this.errorMessage = '';

      try {
        const { email, password, name, mobile } = this.signupForm.value;
        await this.authService.register(email, password, { uName: name, mobile });
        this.router.navigate(['']);  // Redirect after success
      } catch (error: any) {
        console.error('Registration error:', error);
        if (error.code === 'auth/email-already-in-use') {
          this.errorMessage = 'This email is already registered.';
        } else if (error.code === 'auth/weak-password') {
          this.errorMessage = 'Password should be at least 6 characters.';
        } else {
          this.errorMessage = 'Registration failed. Please try again.';
        }
      } finally {
        this.loading = false;
      }
    }
  }
}
