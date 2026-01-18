// src/app/config/toastr.config.ts
import { GlobalConfig } from 'ngx-toastr';

export const toastrConfig: Partial<GlobalConfig> = {
  // Timeout settings
  timeOut: 3000,
  extendedTimeOut: 1000,
  disableTimeOut: false,
  
  // Positioning
  positionClass: 'toast-top-right',
  
  // Behavior
  preventDuplicates: true,
  progressBar: true,
  closeButton: true,
  tapToDismiss: true,
  
  // Animation
  progressAnimation: 'decreasing',
  easeTime: 300,
  easing: 'ease-in',
  // Other
  enableHtml: false,
  onActivateTick: true,
  titleClass: 'toast-title',
  messageClass: 'toast-message',
};