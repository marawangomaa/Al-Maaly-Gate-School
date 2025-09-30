import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true, // This makes it standalone
  imports: [],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'] // fixed "styleUrl" -> "styleUrls"
})
export class HomeComponent {
  username: string = 'User'; // default username
  isBrowser: boolean = false;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit(): void {
    // Check if running in the browser before accessing localStorage
    this.isBrowser = isPlatformBrowser(this.platformId);

    if (this.isBrowser) {
      const savedUsername = localStorage.getItem('username');
      if (savedUsername) {
        this.username = savedUsername;
      }
    }
  }

  logout(): void {
    if (this.isBrowser) {
      localStorage.removeItem('username');
    }
    this.username = 'User';
    alert('You have been logged out successfully.');
  }
}
