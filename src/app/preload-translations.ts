// src/app/preload-translations.ts
import { TranslateService } from '@ngx-translate/core';
import ar from '../assets/i18n/ar.json';
import en from '../assets/i18n/en.json';

export function preloadTranslations(translate: TranslateService, savedLang: string = 'ar') {
  translate.setTranslation('ar', ar, true);
  translate.setTranslation('en', en, true);
  translate.use(savedLang);
}
