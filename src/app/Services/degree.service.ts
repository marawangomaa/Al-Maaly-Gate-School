// src/app/core/services/degree.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../../environments/environment';
import { AddDegreesDto, DegreeType, StudentDegreesDto } from '../Interfaces/idegree';
import { ApiResponse } from '../Interfaces/auth';
import { DegreeComponentTypeDto } from '../Interfaces/icomponenttype';

@Injectable({
  providedIn: 'root'
})
export class DegreeService {
  private baseUrl = `${environment.apiUrl}/Degree`;

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

  // Get component types for a subject
  getSubjectComponentTypes(subjectId: string): Observable<ApiResponse<DegreeComponentTypeDto[]>> {
    return this.http.get<ApiResponse<DegreeComponentTypeDto[]>>(
      `${this.baseUrl}/subject/${subjectId}/components`
    );
  }

  // Helper method to create example data
  getDegreeExample(studentId: string, subjectId: string, componentTypeIds: any): any {
    return {
      studentId: studentId,
      degrees: [
        // Example 1: MidTerm1 with components
        {
          subjectId: subjectId,
          degreeType: DegreeType.MidTerm1,
          components: [
            {
              componentTypeId: componentTypeIds.oral,
              componentName: 'Oral Exam',
              score: 8,
              maxScore: 10
            },
            {
              componentTypeId: componentTypeIds.written,
              componentName: 'Written Exam',
              score: 15,
              maxScore: 20
            }
          ]
        },
        // Example 2: Final1 simple (no components)
        {
          subjectId: subjectId,
          degreeType: DegreeType.Final1,
          score: 28,
          maxScore: 30
        },
        // Example 3: MidTerm2 with components
        {
          subjectId: subjectId,
          degreeType: DegreeType.MidTerm2,
          components: [
            {
              componentTypeId: componentTypeIds.homework,
              componentName: 'Homework',
              score: 9,
              maxScore: 10
            },
            {
              componentTypeId: componentTypeIds.project,
              componentName: 'Project',
              score: 18,
              maxScore: 20
            }
          ]
        },
        // Example 4: Final2 with 4 components
        {
          subjectId: subjectId,
          degreeType: DegreeType.Final2,
          components: [
            {
              componentTypeId: componentTypeIds.oral,
              componentName: 'Oral Exam',
              score: 9,
              maxScore: 10
            },
            {
              componentTypeId: componentTypeIds.written,
              componentName: 'Written Exam',
              score: 18,
              maxScore: 20
            },
            {
              componentTypeId: componentTypeIds.homework,
              componentName: 'Homework',
              score: 10,
              maxScore: 10
            },
            {
              componentTypeId: componentTypeIds.project,
              componentName: 'Project',
              score: 19,
              maxScore: 20
            }
          ]
        }
      ]
    };
  }

  // Helper to get DegreeType name
  getDegreeTypeName(type: number): string {
    switch(type) {
      case DegreeType.MidTerm1: return 'Mid Term 1';
      case DegreeType.Final1: return 'Final 1';
      case DegreeType.MidTerm2: return 'Mid Term 2';
      case DegreeType.Final2: return 'Final 2';
      default: return 'Unknown';
    }
  }
}