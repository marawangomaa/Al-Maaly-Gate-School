import { Component, Inject, PLATFORM_ID, OnInit } from '@angular/core';
import { isPlatformBrowser, NgIf } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { preloadTranslations } from '../../preload-translations';
import { AuthService } from '../../Services/auth.service';

@Component({
  selector: 'app-nav-bar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, TranslateModule, NgIf],
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.css'],
})
export class NavBarComponent implements OnInit {

  isLoggedIn = false;
  role: string | null = null;
  isDarkMode = false;
  currentLang = 'ar';

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private translate: TranslateService,
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.isLoggedIn = this.auth.isLoggedIn();
    this.role = this.auth.getRole();  // Admin | Teacher | Student

    // Setup language + theme
    if (isPlatformBrowser(this.platformId)) {
      const savedLang = localStorage.getItem('lang') || 'ar';
      this.currentLang = savedLang;
      preloadTranslations(this.translate, savedLang);

      document.documentElement.setAttribute('lang', savedLang);
      document.documentElement.setAttribute(
        'dir',
        savedLang === 'ar' ? 'rtl' : 'ltr'
      );

      const savedTheme = localStorage.getItem('theme') || 'light';
      this.isDarkMode = savedTheme === 'dark';
      document.body.setAttribute('data-theme', savedTheme);
    }
  }

  toggleLanguage() {
    this.currentLang = this.currentLang === 'ar' ? 'en' : 'ar';
    this.translate.use(this.currentLang);
    localStorage.setItem('lang', this.currentLang);
    document.documentElement.setAttribute('lang', this.currentLang);
    document.documentElement.setAttribute(
      'dir',
      this.currentLang === 'ar' ? 'rtl' : 'ltr'
    );
  }

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    const theme = this.isDarkMode ? 'dark' : 'light';
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
