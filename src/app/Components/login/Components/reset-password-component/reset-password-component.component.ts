import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgIf } from '@angular/common';
import { AuthService } from '../../../../Services/auth.service';
import { TranslateModule } from '@ngx-translate/core';
@Component({
  standalone: true,
  selector: 'app-reset-password-component',
  imports: [ReactiveFormsModule, NgIf,TranslateModule],
  templateUrl: './reset-password-component.component.html',
  styleUrl: './reset-password-component.component.css'
})
export class ResetPasswordComponentComponent implements OnInit {
  email!: string;
  token!: string;

  loading = false;
  successMessage = '';
  errorMessage = '';

  form!: ReturnType<FormBuilder['group']>;

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) { }
  ngOnInit(): void {
    this.email = this.route.snapshot.queryParamMap.get('email') ?? '';
    this.token = this.route.snapshot.queryParamMap.get('token') ?? '';

    if (!this.email || !this.token) {
      this.errorMessage = 'Invalid or expired reset link';
      return;
    }
    this.form = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    });
  }
  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { newPassword, confirmPassword } = this.form.value;

    if (newPassword !== confirmPassword) {
      this.errorMessage = 'Passwords do not match';
      return;
    }
    this.loading = true;
    this.errorMessage = '';

    this.authService.resetPassword({
      email: this.email,
      token: this.token,
      newPassword: newPassword!
    }).subscribe({
      next: () => {
        this.loading = false;
        this.successMessage = 'Password reset successful';

        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: err => {
        this.loading = false;
        this.errorMessage =
          err.error?.message || 'Invalid or expired reset link';
      }
    });
  }

}
