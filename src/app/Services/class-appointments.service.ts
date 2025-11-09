import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { iclassAppointments } from '../Interfaces/iclassAppointments';
import { ApiResponse } from '../Interfaces/auth';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ClassAppointmentsService {

  private apiUrl = `${environment.apiUrl}/ClassAppointment/student`;

  constructor(private http: HttpClient) { }

  GetClassAppointmentsForStudent(ClassId: string): Observable<ApiResponse<iclassAppointments[]>> {
    return this.http.get<ApiResponse<iclassAppointments[]>>(`${this.apiUrl}/${ClassId}`);
  }
}