import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private isDarkModeSubject = new BehaviorSubject<boolean>(false);
  isDarkMode$ = this.isDarkModeSubject.asObservable();

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.initializeTheme();
  }

  private initializeTheme() {
    if (isPlatformBrowser(this.platformId)) {
      const savedTheme = localStorage.getItem('theme') || 'light';
      const isDarkMode = savedTheme === 'dark';
      this.isDarkModeSubject.next(isDarkMode);
      document.body.setAttribute('data-theme', savedTheme);
    }
  }

  setTheme(theme: 'light' | 'dark') {
    const isDarkMode = theme === 'dark';
    this.isDarkModeSubject.next(isDarkMode);
    
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('theme', theme);
      document.body.setAttribute('data-theme', theme);
    }
  }

  toggleTheme() {
    const currentTheme = this.isDarkModeSubject.value ? 'dark' : 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }
}