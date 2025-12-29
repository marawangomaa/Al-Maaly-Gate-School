import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, throwError } from 'rxjs';
import { ApiResponse, CreateCurriculum, Curriculum, CurriculumDetails, UpdateCurriculum } from '../Interfaces/icurriculum';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CurriculumService {

  private apiUrl = `${environment.apiUrl}/curricula`;

  constructor(private http: HttpClient, private authService: AuthService) { }

  // Helper method to get headers with authorization
  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  // Helper method to extract data from ApiResponse
  private extractData<T>(response: ApiResponse<T>): T {
    if (!response.success) {
      throw new Error(response.message || 'Request failed');
    }
    if (response.data === undefined) {
      throw new Error('No data returned from server');
    }
    return response.data;
  }

  // Get all curricula
  getAll(): Observable<Curriculum[]> {
    return this.http.get<ApiResponse<Curriculum[]>>(this.apiUrl, { headers: this.getHeaders() }).pipe(
      map(response => this.extractData(response)),
      catchError(this.handleError)
    );
  }

  // Get curriculum by ID
  getById(id: string): Observable<Curriculum> {
    return this.http.get<ApiResponse<Curriculum>>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() }).pipe(
      map(response => this.extractData(response)),
      catchError(this.handleError)
    );
  }

  // Get curriculum with details
  getWithDetails(id: string): Observable<CurriculumDetails> {
    return this.http.get<ApiResponse<CurriculumDetails>>(`${this.apiUrl}/${id}/details`, { headers: this.getHeaders() }).pipe(
      map(response => this.extractData(response)),
      catchError(this.handleError)
    );
  }

  // Create new curriculum
  create(curriculum: CreateCurriculum): Observable<Curriculum> {
    return this.http.post<ApiResponse<Curriculum>>(this.apiUrl, curriculum, { headers: this.getHeaders() }).pipe(
      map(response => this.extractData(response)),
      catchError(this.handleError)
    );
  }

  // Update curriculum
  update(id: string, curriculum: UpdateCurriculum): Observable<Curriculum> {
    return this.http.put<ApiResponse<Curriculum>>(`${this.apiUrl}/${id}`, curriculum, { headers: this.getHeaders() }).pipe(
      map(response => this.extractData(response)),
      catchError(this.handleError)
    );
  }

  // Delete curriculum
  delete(id: string): Observable<boolean> {
    return this.http.delete<ApiResponse<boolean>>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() }).pipe(
      map(response => {
        if (!response.success) {
          throw new Error(response.message || 'Delete failed');
        }
        return response.data || false;
      }),
      catchError(this.handleError)
    );
  }

  // Check if curriculum exists
  exists(id: string): Observable<boolean> {
    return this.http.get<ApiResponse<boolean>>(`${this.apiUrl}/exists/${id}`, { headers: this.getHeaders() }).pipe(
      map(response => this.extractData(response)),
      catchError(this.handleError)
    );
  }

  // Check if curriculum has students
  hasStudents(id: string): Observable<boolean> {
    return this.http.get<ApiResponse<boolean>>(`${this.apiUrl}/${id}/has-students`, { headers: this.getHeaders() }).pipe(
      map(response => this.extractData(response)),
      catchError(this.handleError)
    );
  }

  // Check if curriculum has teachers
  hasTeachers(id: string): Observable<boolean> {
    return this.http.get<ApiResponse<boolean>>(`${this.apiUrl}/${id}/has-teachers`, { headers: this.getHeaders() }).pipe(
      map(response => this.extractData(response)),
      catchError(this.handleError)
    );
  }

  // Get curriculum count
  getCount(): Observable<ApiResponse<number>> {
    return this.http.get<ApiResponse<number>>(`${this.apiUrl}/count`, { headers: this.getHeaders() });
  }

  // Error handler - updated to handle ApiResponse format
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An error occurred';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = error.error.message;
    } else {
      // Server-side error
      // Try to extract message from ApiResponse format
      if (error.error && typeof error.error === 'object') {
        // Check if error follows ApiResponse format
        const apiError = error.error as ApiResponse<any>;
        if (apiError.message) {
          errorMessage = apiError.message;
        } else if (error.error.message) {
          errorMessage = error.error.message;
        }
      }
      
      // Handle specific status codes
      if (error.status === 401) {
        errorMessage = 'Unauthorized: Please login again';
      } else if (error.status === 403) {
        errorMessage = 'Forbidden: You do not have permission to perform this action';
      } else if (error.status === 404) {
        errorMessage = 'Resource not found';
      } else if (error.status === 409) {
        errorMessage = 'Conflict: Resource already exists';
      } else if (error.status === 400) {
        errorMessage = 'Bad request: Invalid data provided';
      }
    }

    console.error('Curriculum Service Error:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}