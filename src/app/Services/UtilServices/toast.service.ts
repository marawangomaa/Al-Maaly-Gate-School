// Services/UtilServices/toast.service.ts
import { Injectable, inject } from '@angular/core';
import { ToastrService, ActiveToast, IndividualConfig } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { Observable, map } from 'rxjs';

export type ToastType = 'success' | 'error' | 'warning' | 'info';
export type ToastPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';

interface ToastOptions extends Partial<IndividualConfig> {
  timeOut?: number;
  extendedTimeOut?: number;
  disableTimeOut?: boolean;
  positionClass?: string;
  preventDuplicates?: boolean;
  progressBar?: boolean;
  closeButton?: boolean;
  tapToDismiss?: boolean;
  progressAnimation?: 'decreasing' | 'increasing';
  enableHtml?: boolean;
  toastClass?: string;
  onActivateTick?: boolean;
  newestOnTop?: boolean;
  closeButtonHtml?: string;
}

interface TranslatedMessage {
  message?: string;
  title?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private readonly toastr = inject(ToastrService);
  private readonly translate = inject(TranslateService);

  // ==================== PRIVATE CORE METHODS ====================
  private showToast(
    message: string,
    title: string = '',
    type: ToastType = 'info',
    options: ToastOptions = {}
  ): ActiveToast<any> {
    const finalOptions = this.getBaseOptions(type, options);

    switch (type) {
      case 'success':
        return this.toastr.success(message, title, finalOptions);
      case 'error':
        return this.toastr.error(message, title, finalOptions);
      case 'warning':
        return this.toastr.warning(message, title, finalOptions);
      case 'info':
      default:
        return this.toastr.info(message, title, finalOptions);
    }
  }

  /**
   * Get base options for all toasts with RTL/LTR support
   */
  private getBaseOptions(type: ToastType = 'info', customOptions: ToastOptions = {}): ToastOptions {
    const isArabic = this.translate.currentLang === 'ar';
    const positionClass = this.getPositionClass();

    const baseOptions: ToastOptions = {
      timeOut: type === 'error' ? 5000 : 3000,
      extendedTimeOut: 1000,
      disableTimeOut: false,
      positionClass: positionClass,
      preventDuplicates: true,
      progressBar: true,
      closeButton: true,
      tapToDismiss: true,
      progressAnimation: 'decreasing',
      enableHtml: false,
      toastClass: `ngx-toastr ${isArabic ? 'rtl' : 'ltr'}`,
      onActivateTick: true,
      newestOnTop: true,
      closeButtonHtml: '<button type="button" class="toast-close-button" aria-label="Close">×</button>'
    };

    return { ...baseOptions, ...customOptions };
  }

  /**
   * Get position class based on language direction
   */
  private getPositionClass(): string {
    const isArabic = this.translate.currentLang === 'ar';
    return isArabic ? 'toast-top-left' : 'toast-top-right';
  }

  /**
   * Apply document direction based on current language
   */
  private applyDocumentDirection(): void {
    const isArabic = this.translate.currentLang === 'ar';
    document.documentElement.dir = isArabic ? 'rtl' : 'ltr';
    document.documentElement.lang = this.translate.currentLang || 'en';
  }

  /**
   * Get translated message(s) from translation keys
   */
  private getTranslatedMessages(
    messageKey: string,
    titleKey?: string,
    params?: any
  ): Observable<TranslatedMessage> {
    const translationKeys = titleKey ? [messageKey, titleKey] : [messageKey];

    return this.translate.get(translationKeys, params).pipe(
      map(translations => ({
        message: translations[messageKey],
        title: titleKey ? translations[titleKey] : ''
      }))
    );
  }

  // ==================== PUBLIC SHOW METHODS ====================
  /**
   * Show translated toast with translation keys
   */
  showTranslated(
    messageKey: string,
    titleKey?: string,
    type: ToastType = 'info',
    params?: any,
    options: ToastOptions = {}
  ): void {
    this.getTranslatedMessages(messageKey, titleKey, params).subscribe({
      next: (translations) => {
        this.applyDocumentDirection();
        this.showToast(
          translations.message || messageKey,
          translations.title || '',
          type,
          options
        );
      },
      error: () => {
        // Fallback to showing the key itself if translation fails
        this.applyDocumentDirection();
        this.showToast(
          messageKey,
          titleKey || '',
          type,
          options
        );
      }
    });
  }

  // ==================== QUICK METHODS WITH CUSTOM TIMEOUTS ==================== 
  quickSuccessTranslated(messageKey: string, titleKey?: string, timeOut: number = 2000, params?: any): void {
    this.showTranslated(messageKey, titleKey, 'success', params, { timeOut });
  }

  quickErrorTranslated(messageKey: string, titleKey?: string, timeOut: number = 3000, params?: any): void {
    this.showTranslated(messageKey, titleKey, 'error', params, { timeOut });
  }

  persistentTranslated(messageKey: string, titleKey?: string, type: ToastType = 'info', params?: any): void {
    this.showTranslated(messageKey, titleKey, type, params, {
      timeOut: 0,
      disableTimeOut: true,
      tapToDismiss: false,
      progressBar: false
    });
  }

  dismissPersistent(): void {
    this.toastr.clear();
  }

  // ==================== GENERIC METHODS WITH TRANSLATION SUPPORT ====================

  success(message?: string, title?: string): void;
  success(messageKey?: string, titleKey?: string, params?: any): void;
  success(message?: string, title?: string, params?: any): void {
    if (typeof params !== 'undefined') {
      // This is a translation call
      const messageKey = message || 'TOAST.MESSAGES.GENERIC_SUCCESS';
      const titleKey = title || 'TOAST.TITLES.SUCCESS';
      this.showTranslated(messageKey, titleKey, 'success', params);
    } else if (message && title) {
      // Direct strings with both message and title
      this.showTranslated(message, title, 'success');
    } else if (message) {
      // Check if message looks like a translation key
      if (message.includes('.')) {
        this.showTranslated(message, 'TOAST.TITLES.SUCCESS', 'success');
      } else {
        // Direct string message only
        this.showTranslated('TOAST.MESSAGES.GENERIC_SUCCESS', 'TOAST.TITLES.SUCCESS', 'success');
      }
    } else {
      // Default success
      this.showTranslated('TOAST.MESSAGES.GENERIC_SUCCESS', 'TOAST.TITLES.SUCCESS', 'success');
    }
  }

  error(message?: string, title?: string): void;
  error(messageKey?: string, titleKey?: string, params?: any): void;
  error(message?: string, title?: string, params?: any): void {
    if (typeof params !== 'undefined') {
      // This is a translation call
      const messageKey = message || 'TOAST.MESSAGES.GENERIC_ERROR';
      const titleKey = title || 'TOAST.TITLES.ERROR';
      this.showTranslated(messageKey, titleKey, 'error', params);
    } else if (message && title) {
      // Direct strings with both message and title
      this.showTranslated(message, title, 'error');
    } else if (message) {
      // Check if message looks like a translation key
      if (message.includes('.')) {
        this.showTranslated(message, 'TOAST.TITLES.ERROR', 'error');
      } else {
        // Direct string message only
        this.showTranslated(message, 'TOAST.TITLES.ERROR', 'error');
      }
    } else {
      // Default error
      this.showTranslated('TOAST.MESSAGES.GENERIC_ERROR', 'TOAST.TITLES.ERROR', 'error');
    }
  }

  warning(message?: string, title?: string): void;
  warning(messageKey?: string, titleKey?: string, params?: any): void;
  warning(message?: string, title?: string, params?: any): void {
    if (typeof params !== 'undefined') {
      // This is a translation call
      const messageKey = message || 'TOAST.MESSAGES.GENERIC_WARNING';
      const titleKey = title || 'TOAST.TITLES.WARNING';
      this.showTranslated(messageKey, titleKey, 'warning', params);
    } else if (message && title) {
      // Direct strings with both message and title
      this.showTranslated(message, title, 'warning');
    } else if (message) {
      // Check if message looks like a translation key
      if (message.includes('.')) {
        this.showTranslated(message, 'TOAST.TITLES.WARNING', 'warning');
      } else {
        // Direct string message only
        this.showTranslated('TOAST.MESSAGES.GENERIC_WARNING', 'TOAST.TITLES.WARNING', 'warning');
      }
    } else {
      // Default warning
      this.showTranslated('TOAST.MESSAGES.GENERIC_WARNING', 'TOAST.TITLES.WARNING', 'warning');
    }
  }

  info(message?: string, title?: string): void;
  info(messageKey?: string, titleKey?: string, params?: any): void;
  info(message?: string, title?: string, params?: any): void {
    if (typeof params !== 'undefined') {
      // This is a translation call
      const messageKey = message || 'TOAST.MESSAGES.GENERIC_INFO';
      const titleKey = title || 'TOAST.TITLES.INFO';
      this.showTranslated(messageKey, titleKey, 'info', params);
    } else if (message && title) {
      // Direct strings with both message and title
      this.showTranslated(message, title, 'info');
    } else if (message) {
      // Check if message looks like a translation key
      if (message.includes('.')) {
        this.showTranslated(message, 'TOAST.TITLES.INFO', 'info');
      } else {
        // Direct string message only
        this.showTranslated('TOAST.MESSAGES.GENERIC_INFO', 'TOAST.TITLES.INFO', 'info');
      }
    } else {
      // Default info
      this.showTranslated('TOAST.MESSAGES.GENERIC_INFO', 'TOAST.TITLES.INFO', 'info');
    }
  }

  // ==================== COMMON OPERATION METHODS ====================

  saved(messageKey?: string, params?: any): void {
    if (messageKey) {
      this.showTranslated(messageKey, 'TOAST.TITLES.SUCCESS', 'success', params);
    } else {
      this.showTranslated('TOAST.MESSAGES.SAVED', 'TOAST.TITLES.SUCCESS', 'success');
    }
  }

  updated(messageKey?: string, params?: any): void {
    if (messageKey) {
      this.showTranslated(messageKey, 'TOAST.TITLES.SUCCESS', 'success', params);
    } else {
      this.showTranslated('TOAST.MESSAGES.UPDATED', 'TOAST.TITLES.SUCCESS', 'success');
    }
  }

  deleted(messageKey?: string, params?: any): void {
    if (messageKey) {
      this.showTranslated(messageKey, 'TOAST.TITLES.SUCCESS', 'success', params);
    } else {
      this.showTranslated('TOAST.MESSAGES.DELETED', 'TOAST.TITLES.SUCCESS', 'success');
    }
  }

  created(messageKey?: string, params?: any): void {
    if (messageKey) {
      this.showTranslated(messageKey, 'TOAST.TITLES.SUCCESS', 'success', params);
    } else {
      this.showTranslated('TOAST.MESSAGES.CREATED', 'TOAST.TITLES.SUCCESS', 'success');
    }
  }

  // ==================== UTILITY METHODS ====================

  clear(): void {
    this.toastr.clear();
  }

  clearAll(): void {
    this.toastr.clear();
  }

  clearLast(): void {
    const toastr: any = this.toastr;
    if (toastr.toasts && toastr.toasts.length > 0) {
      const lastToast = toastr.toasts[toastr.toasts.length - 1];
      this.toastr.remove(lastToast.toastId);
    }
  }

  /**
   * Get count of active toasts
   */
  getActiveCount(): number {
    const toastr: any = this.toastr;
    return toastr.toasts ? toastr.toasts.length : 0;
  }
}