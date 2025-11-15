import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  CreateExamWithQuestionsDto,
  ExamDetailsViewDto,
  ExamViewDto,
  UpdateExamDto
} from '../Interfaces/iexam';

@Injectable({ providedIn: 'root' })
export class ExamService {
  private readonly baseUrl = `${environment.apiUrl}/Exam`;
  private isBrowser: boolean = false;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: any
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  getTeacherId(): string | null {
    if (!this.isBrowser) return null;
    return localStorage.getItem('teacherId');
  }

  getAll(): Observable<ExamViewDto[]> {
    return this.http.get<ExamViewDto[]>(`${this.baseUrl}`);
  }

  getById(id: string): Observable<ExamDetailsViewDto> {
    return this.http.get<ExamDetailsViewDto>(`${this.baseUrl}/${id}`);
  }

  getByTeacher(): Observable<ExamViewDto[]> {
    const teacherId = this.getTeacherId();
    return this.http.get<ExamViewDto[]>(`${this.baseUrl}/teacher/${teacherId}`);
  }

  createWithQuestions(dto: CreateExamWithQuestionsDto): Observable<any> {
    return this.http.post(`${this.baseUrl}/with-questions`, dto);
  }

  update(id: string, dto: UpdateExamDto): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}`, dto);
  }

  delete(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }

  getExamDetails(id: string): Observable<ExamDetailsViewDto> {
    return this.http.get<ExamDetailsViewDto>(`${this.baseUrl}/${id}/details`);
  }
}
