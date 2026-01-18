// Services/UtilServices/toast.service.ts
import { Injectable, inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastr = inject(ToastrService);
  private translate = inject(TranslateService);
  
  // Get the correct position based on language
  private getPositionClass(): string {
    const isArabic = this.translate.currentLang === 'ar';
    // Arabic/RTL: Show on LEFT side
    // English/LTR: Show on RIGHT side
    return isArabic ? 'toast-top-right' : 'toast-top-left';
  }

  // Get base options for all toasts
  private getBaseOptions(type: ToastType = 'info', customOptions: any = {}) {
    const isArabic = this.translate.currentLang === 'ar';
    const positionClass = this.getPositionClass();
    
    const baseOptions = {
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
      // Use default close button
      closeButtonHtml: '<button type="button" class="toast-close-button" aria-label="Close">×</button>'
    };

    // Merge custom options
    return { ...baseOptions, ...customOptions };
  }

  // ==================== MAIN SHOW METHOD ====================
  show(message: string, title: string = '', type: ToastType = 'info', options: any = {}) {
    // Ensure document direction is set correctly
    const isArabic = this.translate.currentLang === 'ar';
    document.documentElement.dir = isArabic ? 'rtl' : 'ltr';
    document.documentElement.lang = this.translate.currentLang || 'en';
    
    const defaultOptions = this.getBaseOptions(type, options);

    console.log(`🎯 Toast: ${type} | Lang: ${this.translate.currentLang} | Position: ${defaultOptions.positionClass} | Dir: ${document.documentElement.dir}`);

    switch (type) {
      case 'success':
        this.toastr.success(message, title, defaultOptions);
        break;
      case 'error':
        this.toastr.error(message, title, defaultOptions);
        break;
      case 'warning':
        this.toastr.warning(message, title, defaultOptions);
        break;
      case 'info':
        this.toastr.info(message, title, defaultOptions);
        break;
    }
  }

  // ==================== GENERIC METHODS ====================
  
  success(message?: string, title?: string) {
    if (message && title) {
      this.show(message, title, 'success');
    } else if (message) {
      this.showTranslated('TOAST.MESSAGES.GENERIC_SUCCESS', 'TOAST.TITLES.SUCCESS', 'success');
    } else {
      this.showTranslated('TOAST.MESSAGES.GENERIC_SUCCESS', 'TOAST.TITLES.SUCCESS', 'success');
    }
  }

  error(message?: string, title?: string) {
    if (message && title) {
      this.show(message, title, 'error');
    } else if (message) {
      this.show(message, 'TOAST.TITLES.ERROR', 'error');
    } else {
      this.showTranslated('TOAST.MESSAGES.GENERIC_ERROR', 'TOAST.TITLES.ERROR', 'error');
    }
  }

  warning(message?: string, title?: string) {
    if (message && title) {
      this.show(message, title, 'warning');
    } else if (message) {
      this.showTranslated('TOAST.MESSAGES.GENERIC_WARNING', 'TOAST.TITLES.WARNING', 'warning');
    } else {
      this.showTranslated('TOAST.MESSAGES.GENERIC_WARNING', 'TOAST.TITLES.WARNING', 'warning');
    }
  }

  info(message?: string, title?: string) {
    if (message && title) {
      this.show(message, title, 'info');
    } else if (message) {
      this.showTranslated('TOAST.MESSAGES.GENERIC_INFO', 'TOAST.TITLES.INFO', 'info');
    } else {
      this.showTranslated('TOAST.MESSAGES.GENERIC_INFO', 'TOAST.TITLES.INFO', 'info');
    }
  }

  // ==================== QUICK METHODS ====================
  saved() {
    this.showTranslated('TOAST.MESSAGES.SAVED', 'TOAST.TITLES.SUCCESS', 'success');
  }

  updated() {
    this.showTranslated('TOAST.MESSAGES.UPDATED', 'TOAST.TITLES.SUCCESS', 'success');
  }

  deleted() {
    this.showTranslated('TOAST.MESSAGES.DELETED', 'TOAST.TITLES.SUCCESS', 'success');
  }

  created() {
    this.showTranslated('TOAST.MESSAGES.CREATED', 'TOAST.TITLES.SUCCESS', 'success');
  }

  // ==================== TRANSLATION METHOD ====================
  showTranslated(messageKey: string, titleKey?: string, type: ToastType = 'info', params?: any) {
    if (titleKey) {
      this.translate.get([messageKey, titleKey], params).subscribe(translations => {
        this.show(translations[messageKey], translations[titleKey], type);
      });
    } else {
      this.translate.get(messageKey, params).subscribe(message => {
        this.show(message, '', type);
      });
    }
  }

  // ==================== UTILITY METHODS ====================
  clear() {
    this.toastr.clear();
  }

  // Test method to verify everything works
  testToast() {
    console.log('🧪 Testing toast system...');
    const isArabic = this.translate.currentLang === 'ar';
    
    if (isArabic) {
      this.success('نجاح! تم اختبار النظام', 'اختبار');
      setTimeout(() => {
        this.error('خطأ! هذا مجرد اختبار', 'اختبار');
      }, 2000);
      setTimeout(() => {
        this.saved();
      }, 4000);
    } else {
      this.success('Success! System tested', 'Test');
      setTimeout(() => {
        this.error('Error! This is just a test', 'Test');
      }, 2000);
      setTimeout(() => {
        this.saved();
      }, 4000);
    }
  }
}