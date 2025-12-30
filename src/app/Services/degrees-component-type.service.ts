// src/app/core/services/degree-component-type.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { CreateDegreeComponentTypeDto, DegreeComponentTypeDto, UpdateDegreeComponentTypeDto } from '../Interfaces/icomponenttype';
import { ApiResponse } from '../Interfaces/auth';
import { AuthService } from './auth.service';


@Injectable({
  providedIn: 'root'
})
export class DegreeComponentTypeService {
  private baseUrl = `${environment.apiUrl}/DegreeComponentType`;
  private token: string | null;
  private headers: HttpHeaders;


  constructor(private http: HttpClient, private authService: AuthService) {
    this.token = this.authService.getToken();
    this.headers = new HttpHeaders(
      {
        'Authorization': `Bearer ${this.token}`
      })
   }

  // Create a new component type
  createComponentType(dto: CreateDegreeComponentTypeDto): Observable<ApiResponse<DegreeComponentTypeDto>> {
    return this.http.post<ApiResponse<DegreeComponentTypeDto>>(
      `${this.baseUrl}`,
      dto, { headers: this.headers }
    );
  }

  // Update an existing component type
  updateComponentType(id: string, dto: UpdateDegreeComponentTypeDto): Observable<ApiResponse<DegreeComponentTypeDto>> {
    return this.http.put<ApiResponse<DegreeComponentTypeDto>>(
      `${this.baseUrl}/${id}`,
      dto, { headers: this.headers }
    );
  }

  // Delete a component type
  deleteComponentType(id: string): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(
      `${this.baseUrl}/${id}`, { headers: this.headers }
    );
  }

  // Get component type by ID
  getComponentTypeById(id: string): Observable<ApiResponse<DegreeComponentTypeDto>> {
    return this.http.get<ApiResponse<DegreeComponentTypeDto>>(
      `${this.baseUrl}/${id}`, { headers: this.headers }
    );
  }

  // Get all component types for a subject
  getComponentTypesBySubject(subjectId: string): Observable<ApiResponse<DegreeComponentTypeDto[]>> {
    return this.http.get<ApiResponse<DegreeComponentTypeDto[]>>(
      `${this.baseUrl}/subject/${subjectId}`, { headers: this.headers }
    );
  }

  // Reorder component types
  reorderComponentTypes(subjectId: string, componentTypeIds: string[]): Observable<ApiResponse<boolean>> {
    return this.http.put<ApiResponse<boolean>>(
      `${this.baseUrl}/reorder/${subjectId}`,
      componentTypeIds, { headers: this.headers }
    );
  }

  // Get all component types (including inactive) for a subject
  getAllComponentTypesBySubject(subjectId: string): Observable<ApiResponse<DegreeComponentTypeDto[]>> {
    return this.http.get<ApiResponse<DegreeComponentTypeDto[]>>(
      `${this.baseUrl}/subject/${subjectId}/with-inactive`, { headers: this.headers }
    );
  }
}