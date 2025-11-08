import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors,
  ReactiveFormsModule,
  FormsModule
} from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ApiResponse, AuthResponse, RegisterRequest } from '../../Interfaces/auth';
import { AuthService } from '../../Services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, TranslateModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {

  registerForm!: FormGroup;
  errorMessage = '';
  successMessage = '';
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.registerForm = this.fb.group(
      {
        fullName: ['', [Validators.required, Validators.minLength(3)]],
        userName: ['', [Validators.required, Validators.minLength(3)]],
        email: ['', [Validators.required, Validators.email]],

        // ✅ Contact info (optional but must be 10 chars if filled)
        contactInfo: ['', [Validators.minLength(10)]],

        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', Validators.required],

        role: ['', Validators.required]
      },
      { validators: this.matchPasswordValidator }
    );
  }

  // ✅ Custom validator: make sure password === confirmPassword
  matchPasswordValidator(form: AbstractControl): ValidationErrors | null {
    const password = form.get('password')?.value;
    const confirm = form.get('confirmPassword')?.value;

    if (password !== confirm) {
      form.get('confirmPassword')?.setErrors({ mismatch: true });
      return { mismatch: true };
    }

    return null;
  }

  // ✅ Submit
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
      userName: this.registerForm.value.userName,
      contactInfo: this.registerForm.value.contactInfo,
      email: this.registerForm.value.email,
      password: this.registerForm.value.password,
      confirmPassword: this.registerForm.value.confirmPassword,
      role: this.registerForm.value.role
    };

    this.authService.register(registerData).subscribe({
      next: (response: ApiResponse<AuthResponse>) => {
        this.isLoading = false;

        if (response.success) {
          this.successMessage = 'Registration successful! Redirecting...';

          setTimeout(() => this.router.navigate(['/login']), 800);

          this.registerForm.reset();
        } else {
          this.errorMessage = response.message || 'Registration failed';
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage =
          err.error?.message || 'Something went wrong. Please try again.';

        console.error('❌ Error:', err);
      }
    });
  }
}
