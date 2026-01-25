// image.service.ts - FIXED VERSION
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ImageService {

  getImageUrl(imagePath: string): string {
    if (!imagePath || imagePath.trim() === '') {
      console.warn('Empty image path provided, using default avatar');
      return this.getDefaultAvatarUrl();
    }

    const cleanPath = imagePath.trim();

    // Already a full URL - return as is
    if (cleanPath.startsWith('http://') || cleanPath.startsWith('https://')) {
      return cleanPath;
    }

    // IMPORTANT: Use environment.imageBaseUrl instead of environment.apiUrl
    // imageBaseUrl = 'https://localhost:7002' (without /api)
    const baseUrl = environment.imageBaseUrl;

    // If the path already starts with uploads/, use it as is
    if (cleanPath.startsWith('uploads/')) {
      return `${baseUrl}/${cleanPath}`;
    }

    // If the path starts with /uploads, remove the leading slash
    if (cleanPath.startsWith('/uploads/')) {
      return `${baseUrl}${cleanPath}`;
    }

    // If it contains uploads somewhere in the path
    if (cleanPath.includes('uploads/')) {
      // Make sure it has a leading slash
      const finalPath = cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`;
      return `${baseUrl}${finalPath}`;
    }

    // If it's just a filename, assume it's in uploads/AfterAuthentication/images/
    return `${baseUrl}/uploads/AfterAuthentication/images/${cleanPath}`;
  }

  getDefaultAvatarUrl(): string {
    return '/assets/images/default-avatar.png';
  }

  // Optional: Remove or modify this method to prevent infinite requests
  async checkImageExists(imagePath: string): Promise<boolean> {
    return new Promise((resolve) => {
      if (!imagePath) {
        resolve(false);
        return;
      }

      const img = new Image();
      img.onload = () => {
        console.log('Image loaded successfully:', imagePath);
        resolve(true);
      };
      img.onerror = () => {
        console.warn('Image failed to load:', imagePath);
        resolve(false);
      };

      // Use a timeout to prevent hanging
      const timeout = setTimeout(() => {
        img.src = ''; // Cancel loading
        resolve(false);
      }, 5000);

      img.onload = img.onerror = () => {
        clearTimeout(timeout);
      };

      img.src = this.getImageUrl(imagePath);
    });
  }
}