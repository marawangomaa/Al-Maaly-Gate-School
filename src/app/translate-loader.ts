import { TranslateLoader } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { shareReplay, catchError } from 'rxjs/operators';

export class UniversalTranslateLoader implements TranslateLoader {
  private cache = new Map<string, Observable<any>>();

  constructor(private http: HttpClient) { }

  getTranslation(lang: string): Observable<any> {
    // Check cache first
    if (this.cache.has(lang)) {
      return this.cache.get(lang)!;
    }

    // ✅ SSR only - Read from filesystem
    if (typeof window === 'undefined') {
      try {
        const fs = require('fs');
        const path = require('path');

        // Try multiple possible paths (REMOVED __dirname)
        const possiblePaths = [
          path.join(process.cwd(), 'src', 'assets', 'i18n', `${lang}.json`),
          path.join(process.cwd(), 'dist', 'browser', 'assets', 'i18n', `${lang}.json`),
          path.join(process.cwd(), 'dist', 'server', 'assets', 'i18n', `${lang}.json`),
          // Removed problematic line: path.join(__dirname, 'assets', 'i18n', `${lang}.json`)
          // Add alternative paths instead:
          path.join(process.cwd(), 'assets', 'i18n', `${lang}.json`),
          path.join(process.cwd(), 'public', 'assets', 'i18n', `${lang}.json`)
        ];

        // console.log(`🔍 SSR: Looking for ${lang}.json in:`);
        // possiblePaths.forEach(p => console.log(`   - ${p}`));

        let fileContent: string | null = null;
        let foundPath = '';

        for (const filePath of possiblePaths) {
          if (fs.existsSync(filePath)) {
            fileContent = fs.readFileSync(filePath, 'utf8');
            foundPath = filePath;
            break;
          }
        }

        if (fileContent) {
          // console.log(`✅ SSR: Loaded translations for "${lang}" from: ${foundPath}`);
          const translation = of(JSON.parse(fileContent));
          this.cache.set(lang, translation);
          return translation;
        } else {
          // console.warn(`⚠️ SSR: No translation file found for language: ${lang}`);
          // console.warn(`   Searched paths: ${possiblePaths.map(p => `\n   - ${p}`).join('')}`);
          return of({});
        }
      } catch (err) {
        console.error(`❌ SSR: Could not load translations for "${lang}"`, err);
        return of({});
      }
    }

    // ✅ Client-side - Use HTTP with caching
    console.log(`🌐 Browser: Loading translations for "${lang}" via HTTP`);
    const translation$ = this.http.get(`/assets/i18n/${lang}.json`).pipe(
      catchError((error) => {
        console.error(`❌ Browser: Failed to load translations for: ${lang}`, error);
        return of({});
      }),
      shareReplay(1) // Cache the response
    );

    this.cache.set(lang, translation$);
    return translation$;
  }
}

export function HttpLoaderFactory(http: HttpClient): TranslateLoader {
  return new UniversalTranslateLoader(http);
}