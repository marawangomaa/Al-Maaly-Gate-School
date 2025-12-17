import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { CreateCurriculum, Curriculum, CurriculumDetails, UpdateCurriculum } from '../Interfaces/icurriculum';
import { environment } from '../Environment/Environment';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class CurriculumService {

  private apiUrl = `${environment.apiBaseUrl}/curricula`;

  constructor(private http: HttpClient, private authService: AuthService) { }

  // Helper method to get headers with authorization
  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  // Get all curricula
  getAll(): Observable<Curriculum[]> {
    return this.http.get<Curriculum[]>(this.apiUrl, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  // Get curriculum by ID
  getById(id: string): Observable<Curriculum> {
    return this.http.get<Curriculum>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  // Get curriculum with details
  getWithDetails(id: string): Observable<CurriculumDetails> {
    return this.http.get<CurriculumDetails>(`${this.apiUrl}/${id}/details`, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  // Create new curriculum
  create(curriculum: CreateCurriculum): Observable<Curriculum> {
    return this.http.post<Curriculum>(this.apiUrl, curriculum, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  // Update curriculum
  update(id: string, curriculum: UpdateCurriculum): Observable<Curriculum> {
    return this.http.put<Curriculum>(`${this.apiUrl}/${id}`, curriculum, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  // Delete curriculum
  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  // Check if curriculum exists
  exists(id: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/exists/${id}`, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  // Check if curriculum has students
  hasStudents(id: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/${id}/has-students`, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  // Check if curriculum has teachers
  hasTeachers(id: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/${id}/has-teachers`, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  // Error handler
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An error occurred';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = error.error.message;
    } else {
      // Server-side error
      if (error.error && error.error.message) {
        errorMessage = error.error.message;
      } else if (error.status === 401) {
        errorMessage = 'Unauthorized: Please login again';
        // Optionally trigger logout
        // this.authService.logout();
      } else if (error.status === 403) {
        errorMessage = 'Forbidden: You do not have permission to perform this action';
      } else if (error.status === 404) {
        errorMessage = 'Resource not found';
      } else if (error.status === 409) {
        errorMessage = 'Conflict: Resource already exists';
      } else {
        errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
      }
    }

    console.error('Curriculum Service Error:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}