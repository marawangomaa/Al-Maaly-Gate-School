// ✅ FINAL WORKING VERSION
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  CreateQuestionDto,
  QuestionViewDto,
  UpdateQuestionDto,
  QuestionTypes
} from '../Interfaces/iquestoin';
import { HttpClient } from '@angular/common/http';
import { environment } from '../Environment/Environment';

export interface QuestionModel {
  id: string;
  text: string;
  type: 'Choices' | 'TrueOrFalse' | 'Text';
  degree: number;
  choices?: { id: string; text: string; isCorrect: boolean }[];
  trueAndFalses?: boolean | null;
}

@Injectable({
  providedIn: 'root',
})
export class QuestionService {

  private baseUrl = `${environment.apiBaseUrl}/question`;

  // ✅ STREAM OF QUESTIONS
  private _questions$ = new BehaviorSubject<QuestionModel[]>([]);
  public questions$ = this._questions$.asObservable();

  constructor(private http: HttpClient) {}

  // ✅ LOAD QUESTIONS FROM API AND MAP TYPES FOR FRONTEND
  loadAll() {
  this.getAll().pipe(
    map(res => res.data.map(q => this.mapToUI(q))) // map over res.data
  ).subscribe(q => this._questions$.next(q));
}


  // ✅ MAP BACKEND → FRONTEND TYPES
  private mapToUI(q: QuestionViewDto): QuestionModel {
  let type: 'Choices' | 'TrueOrFalse' | 'Text';

  // if backend sends string, normalize it to enum number first
 const typeStr = q.type as unknown as string; // cast number → unknown → string

let typeNum: QuestionTypes;

switch (typeStr.toLowerCase()) {
  case 'choices': typeNum = QuestionTypes.Choices; break;
  case 'trueorfalse': typeNum = QuestionTypes.TrueOrFalse; break;
  default: typeNum = QuestionTypes.Text; break;
}


  // map enum → UI string
  switch (typeNum) {
    case QuestionTypes.Choices:
      type = 'Choices';
      break;
    case QuestionTypes.TrueOrFalse:
      type = 'TrueOrFalse';
      break;
    case QuestionTypes.Text:
    default:
      type = 'Text';
      break;
  }

  return {
    id: q.id,
    text: q.content,
    type,
    degree: q.degree,
    choices: q.choices ?? [],
    trueAndFalses: q.trueAndFalses ?? null
  };
}



  // ✅ API ENDPOINTS
  getAll(): Observable<{ success: boolean; message: string; data: QuestionViewDto[] }> {
  return this.http.get<{ success: boolean; message: string; data: QuestionViewDto[] }>(`${this.baseUrl}`);
}


  getById(id: string): Observable<QuestionViewDto> {
    return this.http.get<QuestionViewDto>(`${this.baseUrl}/${id}`);
  }

  create(dto: CreateQuestionDto): Observable<QuestionViewDto> {
    return this.http.post<QuestionViewDto>(`${this.baseUrl}`, dto);
  }

  update(id: string, dto: UpdateQuestionDto): Observable<QuestionViewDto> {
    return this.http.put<QuestionViewDto>(`${this.baseUrl}/${id}`, dto);
  }

  delete(id: string): Observable<boolean> {
    return this.http.delete<boolean>(`${this.baseUrl}/${id}`);
  }
}
