import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../Services/auth.service';

@Component({
  selector: 'app-confirm-email',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './confirm-email.component.html',
  styleUrls: ['./confirm-email.component.css']
})
export class ConfirmEmailComponent implements OnInit {
  email = '';
  code = '';
  token = '';
  userId = '';
  message = '';
  loading = false;
  isLinkConfirmation = false;
  isManualConfirmation = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private auth: AuthService
  ) { }

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token') || '';
    this.userId = this.route.snapshot.queryParamMap.get('userId') || '';
    this.email = this.route.snapshot.queryParamMap.get('email') || '';

    // Check if this is a link confirmation (email link)
    if (this.token && this.userId) {
      this.isLinkConfirmation = true;
      this.confirmByLink();
    }
    // Check if email is provided (manual code entry)
    else if (this.email) {
      this.isManualConfirmation = true;
      this.message = 'Please enter the confirmation code sent to your email.';
    }
    // No parameters - generic message
    else {
      this.message = 'Please confirm your email to activate your account.';
    }
  }

  private confirmByLink(): void {
    this.loading = true;
    this.auth.confirmEmailByLink(this.token, this.userId).subscribe({
      next: res => {
        this.message = res.message || 'Email confirmed successfully';
        this.loading = false;
        setTimeout(() => this.router.navigate(['/login']), 2000);
      },
      error: err => {
        this.message = err.error?.message || 'Confirmation failed. Please try again.';
        this.loading = false;
        // Fallback to manual confirmation if link fails
        this.isLinkConfirmation = false;
        this.isManualConfirmation = true;
      }
    });
  }

  confirmCode(): void {
    if (!this.email || !this.code || this.code.length !== 6) {
      this.message = 'Please enter a valid email and 6-digit code.';
      return;
    }

    this.loading = true;
    this.auth.confirmEmailByCode(this.email, this.code).subscribe({
      next: res => {
        this.message = res.message || 'Email confirmed successfully';
        this.loading = false;
        setTimeout(() => this.router.navigate(['/login']), 2000);
      },
      error: err => {
        this.message = err.error?.message || 'Confirmation failed. Please try again.';
        this.loading = false;
      }
    });
  }

  resend(): void {
    if (!this.email || this.email.trim() === '') {
      this.message = 'Please enter your email address first';
      return;
    }

    this.loading = true;
    this.auth.resendConfirmation(this.email).subscribe({
      next: res => {
        this.message = res.message || 'Confirmation code resent successfully';
        this.loading = false;
      },
      error: err => {
        this.message = err.error?.message || 'Failed to resend code. Please try again.';
        this.loading = false;
      }
    });
  }
}