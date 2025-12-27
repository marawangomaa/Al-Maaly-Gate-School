import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../Services/auth.service';
import { ApiResponse, AuthResponse, LoginRequest } from '../../Interfaces/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, TranslateModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  loginForm!: FormGroup;
  loading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  get f() {
    return this.loginForm.controls;
  }

  onLogin() {
    this.errorMessage = '';

    if (this.loginForm.invalid) {
      this.errorMessage = 'Please fill in all fields correctly';
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    const loginData: LoginRequest = this.loginForm.value;

    this.authService.login(loginData).subscribe({
      next: (response: ApiResponse<AuthResponse>) => {
        this.loading = false;
        console.log(response);

        if (response.success && response.data) {
          // Store teacherId in localStorage
          const teacherId = response.data.roleEntityIds.teacherId;
          const studentId = response.data.roleEntityIds.studentId;
          const adminId = response.data.roleEntityIds.adminId;
          localStorage.setItem('teacherId', teacherId);
          localStorage.setItem('studentId', studentId);
          localStorage.setItem('adminId', adminId);

          // Tokens and user info are already handled in AuthService.handleAuth()
          this.router.navigate(['/app']);
        } else {
          this.errorMessage = response.message || 'Invalid email or password';
        }
      },
      error: (err) => {
        this.loading = false;

        if (err.status === 0) {
          this.errorMessage = 'Cannot reach the server. Make sure the backend is running.';
          if (err.error?.message?.includes('confirm')) {
            this.router.navigate(['/confirm-email']);
          }
        } else {
          this.errorMessage = err.error?.message || 'Invalid credentials';
        }

        console.error('Login error:', err);
      }
    });
  }

}
