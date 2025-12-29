import { Injectable } from '@angular/core';
import { AddDegreesDto, StudentDegreesDto } from '../Interfaces/idegree';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { ApiResponse } from '../Interfaces/auth';

@Injectable({
  providedIn: 'root'
})
export class DegreeService {

  private baseUrl = `${environment.apiUrl}/Degree`

  constructor(private http: HttpClient) {}

  // Add Degrees
  addDegrees(dto: AddDegreesDto): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(
      `${this.baseUrl}/add`,
      dto
    );
  }

  // Get single student degrees
  getStudentDegrees(studentId: string): Observable<ApiResponse<StudentDegreesDto>> {
    return this.http.get<ApiResponse<StudentDegreesDto>>(
      `${this.baseUrl}/student/${studentId}`
    );
  }

  // Get all students + degrees
  getAllStudentsDegrees(): Observable<ApiResponse<StudentDegreesDto[]>> {
    return this.http.get<ApiResponse<StudentDegreesDto[]>>(
      `${this.baseUrl}/all`
    );
  }
}
