import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ApiResponse, AuthResponse, RegisterRequest } from '../../Interfaces/auth';
import { AuthService } from '../../Services/auth.service';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, FormsModule, TranslateModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  registerForm!: FormGroup;
  errorMessage = '';
  successMessage = '';
  isLoading = false;

  constructor(private fb: FormBuilder, private authService: AuthService) {}

  ngOnInit(): void {
    this.registerForm = this.fb.group(
      {
        fullName: ['', [Validators.required, Validators.minLength(3)]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        // confirmPassword: ['', [Validators.required]],
        role: ['', Validators.required]
      },
      // { validators: this.passwordMatchValidator }
    );
  }

  // ✅ Check if passwords match
  passwordMatchValidator(form: FormGroup) {
    return form.get('password')?.value === form.get('confirmPassword')?.value
      ? null
      : { mismatch: true };
  }

  // ✅ Submit registration form
  onRegister() {
    if (this.registerForm.invalid) {
      this.errorMessage = 'Please correct the errors in the form';
      return;
    }

    this.errorMessage = '';
    this.successMessage = '';
    this.isLoading = true;

    const registerData: RegisterRequest = {
      fullName: this.registerForm.value.fullName,
      email: this.registerForm.value.email,
      password: this.registerForm.value.password,
      role: this.registerForm.value.role
    };

    this.authService.register(registerData).subscribe({
      next: (response: ApiResponse<AuthResponse>) => {
        this.isLoading = false;
        if (response.success) {
          this.successMessage = 'Registration successful!';
          console.log('✅ Registered:', response.data);
          this.registerForm.reset();
        } else {
          this.errorMessage = response.message || 'Registration failed';
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Something went wrong. Please try again.';
        console.error('❌ Error:', err);
      }
    });
  }
}
