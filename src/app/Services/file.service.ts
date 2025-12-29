import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpEvent, HttpEventType } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class FileService {
  private baseUrl = `${environment.apiUrl}/api`;

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  // Upload file with progress tracking
  uploadFile(file: File, controllerName: string): Observable<{
    progress?: number;
    response?: any;
    error?: any;
  }> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post(
      `${this.baseUrl}/${controllerName}/upload`,
      formData,
      {
        headers: this.getAuthHeaders(),
        reportProgress: true,
        observe: 'events'
      }
    ).pipe(
      map((event: HttpEvent<any>) => {
        switch (event.type) {
          case HttpEventType.UploadProgress:
            const progress = Math.round((100 * event.loaded) / (event.total || 1));
            return { progress };
          
          case HttpEventType.Response:
            return { response: event.body };
          
          default:
            return {};
        }
      })
    );
  }

  // Delete file
  deleteFile(filePath: string): Observable<any> {
    return this.http.delete(
      `${this.baseUrl}/files`,
      {
        headers: this.getAuthHeaders(),
        body: { filePath }
      }
    );
  }

// In file.service.ts - Update the getFileUrl method
getFileUrl(relativePath: string): string {
  console.log('Original image path:', relativePath);
  
  if (!relativePath) {
    console.log('No image path provided, using default avatar');
    return this.getDefaultAvatarUrl();
  }
  
  const cleanPath = relativePath.trim();
  
  // Already a full URL
  if (cleanPath.startsWith('http://') || cleanPath.startsWith('https://')) {
    return cleanPath;
  }
  
  // Use imageBaseUrl (without /api) for images
  const baseUrl = environment.imageBaseUrl;
  
  let finalUrl = '';
  
  // Handle different path formats
  if (cleanPath.startsWith('/')) {
    // Path starts with / (absolute path)
    finalUrl = `${baseUrl}${cleanPath}`;
  } else if (cleanPath.startsWith('uploads/')) {
    // Path starts with uploads/
    finalUrl = `${baseUrl}/${cleanPath}`;
  } else if (cleanPath.includes('uploads/')) {
    // Path contains uploads/
    finalUrl = `${baseUrl}/${cleanPath}`;
  } else {
    // Just a filename - assume it's in uploads/AfterAuthentication/images/
    finalUrl = `${baseUrl}/uploads/AfterAuthentication/images/${cleanPath}`;
  }
  
  console.log('Final image URL:', finalUrl);
  return finalUrl;
}

private getDefaultAvatarUrl(): string {
  // Make sure this path exists in your Angular assets
  return '/assets/images/default-avatar.png';
}

  // Download file
  downloadFile(filePath: string, fileName: string): Observable<Blob> {
    return this.http.get(
      `${this.baseUrl}/files/download?filePath=${encodeURIComponent(filePath)}`,
      {
        headers: this.getAuthHeaders(),
        responseType: 'blob'
      }
    );
  }

  // Helper method to convert blob to base64 (for preview)
  blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to convert blob to base64'));
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
}