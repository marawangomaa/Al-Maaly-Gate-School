import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ApiResponse, ClassDto, ClassViewDto } from '../Interfaces/iclass';
import { HttpClient } from '@angular/common/http';
import { environment } from '../Environment/Environment';

export interface ClassModel {
  id: string;
  grade: string;
  section: string;
  subject: string;
  meetingLink: string;
  startTime: string; // ISO string
  duration: number; // minutes
  ended: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ClassService {
  private readonly apiUrl = `${environment.apiBaseUrl}/class`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<ApiResponse<ClassViewDto[]>> {
    return this.http.get<ApiResponse<ClassViewDto[]>>(this.apiUrl);
  }

  getById(id: string): Observable<ApiResponse<ClassViewDto>> {
    return this.http.get<ApiResponse<ClassViewDto>>(`${this.apiUrl}/class/${id}`);
  }

  create(dto: ClassDto): Observable<ApiResponse<ClassDto>> {
    return this.http.post<ApiResponse<ClassDto>>(this.apiUrl, dto);
  }

  update(id: string, dto: ClassDto): Observable<ApiResponse<ClassDto>> {
    return this.http.put<ApiResponse<ClassDto>>(`${this.apiUrl}/${id}`, dto);
  }

  delete(id: string): Observable<ApiResponse<string>> {
    return this.http.delete<ApiResponse<string>>(`${this.apiUrl}/${id}`);
  }
}
