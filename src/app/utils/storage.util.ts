export const isBrowser = typeof window !== 'undefined';

export class StorageUtil {
  static get(key: string): string | null {
    return isBrowser ? localStorage.getItem(key) : null;
  }

  static set(key: string, value: string): void {
    if (isBrowser) localStorage.setItem(key, value);
  }

  static remove(key: string): void {
    if (isBrowser) localStorage.removeItem(key);
  }

  static clear(): void {
    if (isBrowser) localStorage.clear();
  }
}
