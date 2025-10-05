import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, NgClass } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-dashboard-nav',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, TranslateModule, NgClass],
  templateUrl: './dashboard-nav.component.html',
  styleUrls: ['./dashboard-nav.component.css']
})
export class DashboardNavComponent {
  currentRole: 'teacher' | 'student' | 'admin' = 'student';
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    this.loadRole();
  }

  loadRole(): void {
    if (this.isBrowser) {
      const storedRole = localStorage.getItem('userRole');
      if (storedRole === 'teacher' || storedRole === 'student' || storedRole === 'admin') {
        this.currentRole = storedRole as any;
      }
    }
  }

  switchRole(role: 'teacher' | 'student' | 'admin'): void {
    this.currentRole = role;
    if (this.isBrowser) {
      localStorage.setItem('userRole', role);
    }
    console.log(`Switched role to: ${role}`);
  }
}
