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

    if (this.token && this.userId) {
      // User clicked email link → automatic confirmation
      this.isLinkConfirmation = true;
      this.confirmByLink();
    } else if (this.email) {
      // User just registered → pre-filled email for manual code entry
      this.isManualConfirmation = true;
      this.message = 'Please enter the confirmation code sent to your email.';
    } else {
      // User clicked "Confirm your email" link in login → must type email manually
      this.isManualConfirmation = true;
      this.email = ''; // force user to enter email
      this.message = 'Please enter your email and the confirmation code.';
    }
  }

  private confirmByLink(): void {
    this.loading = true;
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