// translate-loader.ts
import { TranslateLoader } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';

// Only import in Node.js context
import * as fs from 'fs';
import * as path from 'path';

export class UniversalTranslateLoader implements TranslateLoader {
  constructor(private http: HttpClient) {}

  getTranslation(lang: string): Observable<any> {
    // SSR mode
    if (typeof window === 'undefined') {
      try {
        // dev SSR (ng serve)
        const devPath = path.join(process.cwd(), 'src', 'assets', 'i18n', `${lang}.json`);
        // prod SSR (ng build + ng serve:ssr)
        const prodPath = path.join(process.cwd(), 'dist', 'browser', 'assets', 'i18n', `${lang}.json`);

        const filePath = fs.existsSync(devPath) ? devPath : prodPath;
        const content = fs.readFileSync(filePath, 'utf8');
        return of(JSON.parse(content));
      } catch (err) {
        console.error(`❌ Could not load translations for "${lang}"`, err);
        return of({});
      }
    }

    // Browser → use HttpClient
    return this.http.get(`/assets/i18n/${lang}.json`);
  }
}

export function HttpLoaderFactory(http: HttpClient): TranslateLoader {
  return new UniversalTranslateLoader(http);
}
