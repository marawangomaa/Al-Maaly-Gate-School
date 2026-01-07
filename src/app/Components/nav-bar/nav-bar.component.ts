import { Component, Inject, PLATFORM_ID, OnInit, HostListener } from '@angular/core';
import { CommonModule, isPlatformBrowser, NgIf } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { preloadTranslations } from '../../preload-translations';
import { AuthService } from '../../Services/auth.service';
import { ThemeService } from '../../Services/theme.service';
import { Subscription } from 'rxjs';

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
  private themeSubscription?: Subscription; 

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private translate: TranslateService,
    private auth: AuthService,
    private router: Router,
    private themeService: ThemeService
  ) { }

  ngOnInit() {
    this.isLoggedIn = this.auth.isLoggedIn();
    this.role = this.auth.getRole();

    // Subscribe to theme changes
    this.themeSubscription = this.themeService.isDarkMode$.subscribe(isDark => {
      this.isDarkMode = isDark;
    });

    const savedLang = localStorage.getItem('lang') || 'ar';
    this.currentLang = savedLang;
    preloadTranslations(this.translate, savedLang);

    document.documentElement.setAttribute('lang', savedLang);
    document.documentElement.setAttribute(
      'dir',
      savedLang === 'ar' ? 'rtl' : 'ltr'
    );
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
    this.themeService.toggleTheme();
  }

  setTheme(theme: 'light' | 'dark') {
    this.themeService.setTheme(theme);
    this.isThemeDropdownOpen = false;
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  ngOnDestroy() {
    // Clean up subscription
    if (this.themeSubscription) {
      this.themeSubscription.unsubscribe();
    }
  }
}
