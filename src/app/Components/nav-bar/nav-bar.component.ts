import { Component, Inject, PLATFORM_ID, OnInit, HostListener } from '@angular/core';
import { CommonModule, isPlatformBrowser, NgIf } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { preloadTranslations } from '../../preload-translations';
import { AuthService } from '../../Services/auth.service';

@Component({
  selector: 'app-nav-bar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, TranslateModule, NgIf],
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.css'],
})
export class NavBarComponent implements OnInit {

  isLoggedIn = false;
  role: string | null = null;
  isDarkMode = false;
  currentLang = 'ar';
  isDropdownOpen = false;
  isThemeDropdownOpen = false;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private translate: TranslateService,
    private auth: AuthService,
    private router: Router
  ) { }

  ngOnInit() {
    this.isLoggedIn = this.auth.isLoggedIn();
    this.role = this.auth.getRole();  // Admin | Teacher | Student

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

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;

    if (!target.closest('.lang-dropdown')) {
      this.isDropdownOpen = false;
    }

    if (!target.closest('.theme-dropdown')) {
      this.isThemeDropdownOpen = false;
    }
  }

  switchLanguage(lang: 'en' | 'ar') {
    if (this.currentLang !== lang) {
      this.currentLang = lang;
      this.setLanguage(lang);
      this.isDropdownOpen = false;
    }
  }

  toggleLanguage() {
    this.currentLang = this.currentLang === 'ar' ? 'en' : 'ar';
    this.setLanguage(this.currentLang);
  }
  private setLanguage(lang: string) {
    this.translate.use(lang);

    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('lang', lang);
      document.documentElement.setAttribute('lang', lang);
      document.documentElement.setAttribute(
        'dir',
        lang === 'ar' ? 'rtl' : 'ltr'
      );
    }
  }
  getCurrentFlag(): string {
    return this.currentLang === 'ar'
      ? 'assets/images/saudi-arabia-flag-icon.svg'
      : 'assets/images/united-kingdom-flag-icon.svg';
  }

  toggleThemeDropdown() {
    this.isThemeDropdownOpen = !this.isThemeDropdownOpen;
  }

  toggleTheme() {
    const newTheme = this.isDarkMode ? 'light' : 'dark';
    this.setTheme(newTheme);
  }

  setTheme(theme: 'light' | 'dark') {
    this.isDarkMode = (theme === 'dark');
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    this.isThemeDropdownOpen = false;
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
