import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirmation-status',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirmation-status.component.html',
  styleUrls: ['./confirmation-status.component.css']
})
export class ConfirmationStatusComponent implements OnInit {
  status: 'success' | 'error' = 'error';
  message = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    const statusParam = this.route.snapshot.queryParamMap.get('status');

    if (statusParam === 'success') {
      this.status = 'success';
      this.message = 'Your email has been confirmed successfully. You can now log in.';
      setTimeout(() => this.router.navigate(['/login']), 3000);
    } else {
      this.status = 'error';
      this.message = 'Email confirmation failed or the link has expired.';
    }
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  goToConfirm(): void {
    this.router.navigate(['/confirm-email']);
  }
}
