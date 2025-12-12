import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../../Services/AuthService';
import { PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-dashboard-nav',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, TranslateModule],
  templateUrl: './dashboard-nav.component.html',
  styleUrls: ['./dashboard-nav.component.css']
})
export class DashboardNavComponent {

  currentRole: 'admin' | 'teacher' | 'student' | 'parent' | null = null;

  private platformId = inject(PLATFORM_ID);

  constructor(private auth: AuthService, private router: Router) { }

  ngOnInit() {
    // ✅ Only run on the browser
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    // ✅ Only read role in browser
    const role = this.auth.role?.toLowerCase() || null;

    if (role === 'admin' || role === 'teacher' || role === 'student'|| role === 'parent') {
      this.currentRole = role;
    }

    console.log("Dashboard role (browser):", this.currentRole);

    if (!this.auth.isLoggedIn() || !this.currentRole) {
      this.router.navigate(['/login']);
    }
  }

  logout() {
    this.auth.logout();
  }
}
