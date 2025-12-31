// Create a simple ToastService if you don't have one
// toast.service.ts
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface Toast {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastSubject = new Subject<Toast>();
  
  toast$ = this.toastSubject.asObservable();
  
  showSuccess(message: string, duration: number = 3000): void {
    this.toastSubject.next({ message, type: 'success', duration });
  }
  
  showError(message: string, duration: number = 3000): void {
    this.toastSubject.next({ message, type: 'error', duration });
  }
  
  showInfo(message: string, duration: number = 3000): void {
    this.toastSubject.next({ message, type: 'info', duration });
  }
  
  showWarning(message: string, duration: number = 3000): void {
    this.toastSubject.next({ message, type: 'warning', duration });
  }
}