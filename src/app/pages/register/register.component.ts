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
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPass: ['', Validators.required],
      mobile: ['', [Validators.required, Validators.pattern('^[+]?[0-9]{10,15}$')]]
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

        console.log('RegisterComponent: Form data before sending:', { name, email, mobile });

        await this.authService.register(email, password, { name: name.trim(), mobile: mobile.trim() });
        this.router.navigate(['/home']);  // Redirect to home after success
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
    } else {
      console.log('RegisterComponent: Form is invalid. Errors:', this.signupForm.errors);
      Object.keys(this.signupForm.controls).forEach(key => {
        const controlErrors = this.signupForm.get(key)?.errors;
        if (controlErrors) {
          console.log(`Control '${key}' has errors:`, controlErrors);
        }
      });
    }
  }
}
