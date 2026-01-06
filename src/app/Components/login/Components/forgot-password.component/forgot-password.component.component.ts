import { Component, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../../../Services/auth.service';
import { NgIf } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-forgot-password.component',
  imports: [ReactiveFormsModule, TranslateModule,NgIf],
  templateUrl: './forgot-password.component.component.html',
  styleUrl: './forgot-password.component.component.css'
})
export class ForgotPasswordComponentComponent implements OnInit {
  form!: ReturnType<FormBuilder['group']>;
  loading = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService
  ) {}
  ngOnInit() {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }
  submit() {
    if (this.form.invalid) return;

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.authService.forgotPassword(this.form.value.email!)
      .subscribe({
        next: () => {
          this.loading = false;
          this.successMessage =
            'If the email exists, a reset link has been sent';
        },
        error: () => {
          this.loading = false;
          this.errorMessage = 'Something went wrong';
        }
      });
  }
}
