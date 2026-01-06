import { TranslateLoader } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';

export class UniversalTranslateLoader implements TranslateLoader {
  constructor(private http: HttpClient) { }

  getTranslation(lang: string): Observable<any> {
    // ✅ SSR only
    if (typeof window === 'undefined') {
      try {
        // Lazy imports (Node-only)
        const fs = require('fs');
        const path = require('path');

        const devPath = path.join(
          process.cwd(),
          'src',
          'assets',
          'i18n',
          `${lang}.json`
        );

        const prodPath = path.join(
          process.cwd(),
          'dist',
          'browser',
          'assets',
          'i18n',
          `${lang}.json`
        );

        const filePath = fs.existsSync(devPath) ? devPath : prodPath;
        const content = fs.readFileSync(filePath, 'utf8');

        return of(JSON.parse(content));
      } catch (err) {
        console.error(`❌ Could not load translations for "${lang}"`, err);
        return of({});
      }
    }

    return this.http.get(`/assets/i18n/${lang}.json`);
  }
}

export function HttpLoaderFactory(http: HttpClient): TranslateLoader {
  return new UniversalTranslateLoader(http);
}
