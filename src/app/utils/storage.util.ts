export const isBrowser = typeof window !== 'undefined';

export class StorageUtil {
  private static readonly PRESERVED_KEYS = ['theme', 'lang'];

  static get(key: string): string | null {
    return isBrowser ? localStorage.getItem(key) : null;
  }

  static set(key: string, value: string): void {
    if (isBrowser) localStorage.setItem(key, value);
  }

  static remove(key: string): void {
    if (isBrowser) localStorage.removeItem(key);
  }

  // static clear(): void {
  //   if (isBrowser) localStorage.clear();
  // }

  static clear(): void {
    if (isBrowser) {
      // Get all keys in localStorage
      const allKeys = Object.keys(localStorage);

      // Filter out keys we want to preserve
      const keysToRemove = allKeys.filter(key =>
        !this.PRESERVED_KEYS.includes(key)
      );

      // Remove only non-preserved keys
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
      });

      // Clear all of sessionStorage
      sessionStorage.clear();
    }
  }

}
