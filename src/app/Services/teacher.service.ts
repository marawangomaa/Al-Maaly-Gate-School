import { Injectable } from '@angular/core';
import { environment } from '../Environment/Environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponseHandler } from '../utils/api-response-handler';
import { Teacher } from '../Interfaces/teacher';
import { ApiResponse } from '../Interfaces/auth';

@Injectable({
  providedIn: 'root'
})
export class TeacherService {

  private apiUrl: string = `${environment.apiBaseUrl}`;

  constructor(private http: HttpClient) {}
  //Get All Teachers
  GetAllTeachers():Observable<Teacher[]>
  {
    const url = `${this.apiUrl}/Teacher`;
    return ApiResponseHandler.handleApiResponse<Teacher[]>(
      this.http.get<ApiResponse<Teacher[]>>(url)
    );
  }

}
