import { Component, Inject, PLATFORM_ID, OnInit } from '@angular/core';
import { isPlatformBrowser, NgIf } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { preloadTranslations } from '../../preload-translations';

@Component({
  selector: 'app-nav-bar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, TranslateModule, NgIf],
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.css'],
})
export class NavBarComponent implements OnInit {
  isLoggedIn = false;
  isDarkMode = false;
  currentLang = 'ar';

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private translate: TranslateService
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      // Load saved language
      const savedLang = localStorage.getItem('lang') || 'ar';
      this.currentLang = savedLang;
      preloadTranslations(this.translate, savedLang);

      document.documentElement.setAttribute('lang', savedLang);
      document.documentElement.setAttribute(
        'dir',
        savedLang === 'ar' ? 'rtl' : 'ltr'
      );

      // Load saved theme
      const savedTheme = localStorage.getItem('theme') || 'light';
      this.isDarkMode = savedTheme === 'dark';
      document.body.setAttribute('data-theme', savedTheme);

      // Load saved login state
      const savedLogin = localStorage.getItem('isLoggedIn');
      this.isLoggedIn = savedLogin === 'true';
    }
  }

  toggleLanguage() {
    this.currentLang = this.currentLang === 'ar' ? 'en' : 'ar';
    this.translate.use(this.currentLang);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('lang', this.currentLang);
      document.documentElement.setAttribute('lang', this.currentLang);
      document.documentElement.setAttribute(
        'dir',
        this.currentLang === 'ar' ? 'rtl' : 'ltr'
      );
    }
  }

  toggleTheme() {
    if (isPlatformBrowser(this.platformId)) {
      this.isDarkMode = !this.isDarkMode;
      const newTheme = this.isDarkMode ? 'dark' : 'light';
      document.body.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
    }
  }

  toggleLogin() {
    if (isPlatformBrowser(this.platformId)) {
      this.isLoggedIn = !this.isLoggedIn;
      localStorage.setItem('isLoggedIn', String(this.isLoggedIn));
    }
  }
}
