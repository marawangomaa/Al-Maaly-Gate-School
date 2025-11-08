import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../Services/auth.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule, TranslateModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  loginForm!: FormGroup;
  loading: boolean = false;
  errorMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {}

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
    const loginData = this.loginForm.value;

    this.authService.login(loginData).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          // Save login info
          localStorage.setItem('token', response.data.token);
          localStorage.setItem('userEmail', response.data.email);
          localStorage.setItem('userName', response.data.fullName);
          localStorage.setItem('roles', JSON.stringify(response.data.roles));
          localStorage.setItem('isLoggedIn', 'true');

          this.router.navigate(['/app']);
        } else {
          this.errorMessage = response.message || 'Invalid email or password';
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Login error:', err);
        if (err.status === 0) {
          this.errorMessage = 'Cannot connect to the server. Please ensure the backend is running.';
        } else {
          this.errorMessage = err.error?.message || 'Invalid credentials';
        }
        this.loading = false;
      },
    });
  }
}
